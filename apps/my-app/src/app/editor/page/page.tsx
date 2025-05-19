import { ReactNode } from "react";

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
    render?: boolean
}

export function Page(properties: PageProperties){
    if(properties.render !== undefined && !properties.render){
        return("");
    }
    const widths = [properties.customWidthInCm, 59.5, 42, 29.7, 21, 14.8, 10.5];
    const heights = [properties.customHeigthInCm, 84.1, 59.4, 42, 29.7, 21, 14.8 ];

    const width = properties.landscape ? heights[properties.format] : widths[properties.format];
    const height = properties.landscape ? widths[properties.format] : heights[properties.format];
    return(
        <div style={{minHeight: `${height}cm`, maxHeight: `${width}cm`,  height: `${height}cm`, width: `${width}cm`, backgroundColor: "white"}}>
            {properties.children}
        </div>
    );
}