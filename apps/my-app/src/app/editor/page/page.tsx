import { ReactElement, useLayoutEffect, useRef, useState } from "react";
import { MovableBoxParams } from "../movable/movableBox";
import { RenderableBlockParams } from "../types";

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
    alwaysBreakToNewPage?: boolean,
    format: PageFormat,
    landscape?: boolean,
    customWidthInCm?: number;
    customHeigthInCm?: number
    children?: ReactElement | ReactElement[],
    render?: boolean,
    borderLeft?: number,
    borderRight?: number,
    borderTop?: number,
    borderBottom?: number,
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

    const width = (properties.landscape ? heights[properties.format] : widths[properties.format])|| 1;
    const height = (properties.landscape ? widths[properties.format] : heights[properties.format])|| 1;

    const [pagesExpandCount, setPageExpandCount] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const cmToPixels = getCmInPixels();

    useLayoutEffect(() => {
        if(!containerRef.current) return;
        //first, reposition and split content 
        //if a element is inside the bottom border zone, move it down
        if(properties.children instanceof Array){
            
            properties.children.forEach(element => {
                const movableBox = element.props as RenderableBlockParams;
                if(movableBox){

                    const top = movableBox.posVector?.y || movableBox.y;
                    let elementHeight = movableBox.heigth || 0;

                    const elementReference = document.getElementById(movableBox.id);
                    if(elementReference){
                        const computedStyle = getComputedStyle(elementReference);
                        elementHeight = Number(computedStyle.height.slice(0, computedStyle.height.length - 2));
                    }
                    if(top){
                        const currentPage = Math.ceil(top / (height*cmToPixels));
                        const threshold = ((currentPage)*(height)-(properties.borderTop || 0)-(properties.borderBottom||0))*cmToPixels;
                        if(top > threshold || top + elementHeight > threshold){
                            if(movableBox.posVector && movableBox.onSubmitPositionChange){
                                const newPos = !properties.alwaysBreakToNewPage && (currentPage * height - (properties.borderTop || 0)) * cmToPixels > top + elementHeight ? 
                                (currentPage * height - (properties.borderTop || 0)- (properties.borderBottom || 0)) * cmToPixels - elementHeight - 1 //break up 
                                : currentPage * height * cmToPixels; //break down
                                movableBox.onSubmitPositionChange(movableBox.posVector.x, Math.ceil(newPos), movableBox.template, movableBox.templateTab);
                            }
                        }
                    }
                }
            }, [properties.children, setPageExpandCount, pagesExpandCount]);
        }
        
        if(properties.autoExpand && properties.children instanceof Array){
            let pagesRequired = 1;
            properties.children.forEach(element => {
                const movableBox = element.props as RenderableBlockParams;
                if(movableBox){
                    const top = movableBox.posVector?.y ||movableBox.y || 0;
                    const elementHeight = movableBox.heigth || 0;
                    pagesRequired = Math.max((top + elementHeight) / (cmToPixels *(height ? height : Number.EPSILON)), pagesRequired);
                }
            });
            pagesRequired = Math.ceil(pagesRequired);
            if(pagesRequired !== pagesExpandCount){
                setPageExpandCount(pagesRequired);
            }
        }
       
    }, [properties.children, cmToPixels, height, pagesExpandCount, properties.alwaysBreakToNewPage, properties.autoExpand, properties.borderBottom, properties.borderTop]);

    if(properties.render !== undefined && !properties.render){
        return("");
    }
    
    const maxWorplaceHeight = (properties.autoExpand) ? ((pagesExpandCount+1)*(height)-(properties.borderTop || 0)-(properties.borderBottom||0)).toString()+"cm" : "100%";

    return(<>   
        <div style={{minHeight: `${height}cm`, maxHeight: `${width}cm`,  height: `${height}cm`, width: `${width}cm`, backgroundColor: "white", 
            paddingBottom: (properties.autoExpand) ? "0cm" : `${properties.borderBottom}cm`,
            paddingTop: `${properties.borderTop}cm`,
            paddingLeft: `${properties.borderLeft}cm`,
            paddingRight: `${properties.borderRight}cm`,
        }}
        >
            <div id="paper-container" ref={containerRef} style={{width: "100%", height: `${maxWorplaceHeight}`, minHeight: `${maxWorplaceHeight}%`, minWidth: "100%"}}>
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