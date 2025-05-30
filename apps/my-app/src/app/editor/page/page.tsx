import { ReactElement, ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

export enum PageFormat {
    Custom = 0,
    A1 = 1,
    A2 = 2,
    A3 = 3,
    A4 = 4,
    A5 = 5,
    A6 = 6
}

interface PageProperties{
    autoExpand?: boolean,
    format: PageFormat,
    landscape?: boolean,
    customWidthInCm?: number;
    customHeigthInCm?: number
    children?: ReactNode | ReactNode[],
    render?: boolean,
    borderLeft?: number,
    borderRight?: number,
    borderTop?: number,
    borderBottom?: number,
}
function px2cm(px : number) : number {
  //const n = 3; // use 3 digits after decimal point (1mm resolution)
  const cpi = 2.54; // centimeters per inch
  const dpi = 96; // dots per inch
  const ppd = window.devicePixelRatio; // pixels per dot
  return (px * cpi / (dpi * ppd));
}
function cm2px(px : number) : number {
  //const n = 3; // use 3 digits after decimal point (1mm resolution)
  const cpi = 2.54; // centimeters per inch
  const dpi = 96; // dots per inch
  const ppd = window.devicePixelRatio; // pixels per dot
  return (ppd / cpi);
}
function getCmInPixels(): number {
  const div = document.createElement("div");
  div.style.width = "1cm";
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  document.body.appendChild(div);

  const pixels = div.getBoundingClientRect().width;
  document.body.removeChild(div);

  return pixels;
}

export function Page(properties: PageProperties){

    const widths = [properties.customWidthInCm, 59.5, 42, 29.7, 21, 14.8, 10.5];
    const heights = [properties.customHeigthInCm, 84.1, 59.4, 42, 29.7, 21, 14.8 ];

    const width = properties.landscape ? heights[properties.format] : widths[properties.format];
    const height = properties.landscape ? widths[properties.format] : heights[properties.format];

    const [pagesExpandCount, setPageExpandCount] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const cmToPixels = getCmInPixels();

    useLayoutEffect(() => {
        if(!containerRef.current) return;
        const childNodes = Array.from(containerRef.current.children);
        //first, reposition and split content 

        //count the required pages and expand it
        if(properties.autoExpand){
            let pagesRequired = 1;
            for(let  i = 0; i < childNodes.length; i++){
                const style = getComputedStyle(childNodes[i]);
                const transformMatrix = style.transform.substring(7, style.transform.length - 1).split(',');
                if(transformMatrix.length > 1){
                    const top = parseFloat(transformMatrix[5]);
                    const elementHeight = parseFloat(style.getPropertyValue('height'));
                    pagesRequired = Math.max((top + elementHeight) / (cmToPixels *(height ? height : Number.EPSILON)), pagesRequired);       
                }   
            }
            pagesRequired = Math.ceil(pagesRequired);
            if(pagesRequired !== pagesExpandCount){
                setPageExpandCount(pagesRequired);
            }
        }
        //if a element is inside the bottom border zone, move it down
    });

    if(properties.render !== undefined && !properties.render){
        return("");
    }
    
    const maxWorplaceHeight = (properties.autoExpand) ? "200" : "100";

    return(<>   
        <div style={{minHeight: `${height}cm`, maxHeight: `${width}cm`,  height: `${height}cm`, width: `${width}cm`, backgroundColor: "white", 
            paddingBottom: (properties.autoExpand) ? "0cm" : `${properties.borderBottom}cm`,
            paddingTop: `${properties.borderTop}cm`,
            paddingLeft: `${properties.borderLeft}cm`,
            paddingRight: `${properties.borderRight}cm`,
        }}
        >
            <div id="paper-container" ref={containerRef} style={{width: "100%", height: `${maxWorplaceHeight}%`, minHeight: `${maxWorplaceHeight}%`, minWidth: "100%"}}>
                {properties.children}
            </div>
        </div>
        {
            [...Array(pagesExpandCount-1)].map(() => {
                return(
                    <div
                        style={{minHeight: `${height}cm`, maxHeight: `${width}cm`,  height: `${height}cm`, width: `${width}cm`, backgroundColor: "white", borderTop: "dashed black"}}
                    ></div>
                );
            })
        }
        
        </>
    );
}