import { ReactNode } from "react";
import "./movableBox.module.css"
import { Rnd } from "react-rnd";
export interface MovableBoxParams{
    children?: ReactNode;
    enabled?: boolean;
    id?: string;
    xPos?: number;
    yPos?: number;
    onDrag?: (xPos: number, yPos: number) => void;
}
export function MovableBox(properties: MovableBoxParams){
   return (
    <Rnd className={properties.id}
        size={{width: "400px", height: "100 px"}}
        position={{x: properties.xPos || 0, y: properties.yPos || 0}}
        disableDragging={!properties.enabled}
        enableResizing={false}
        onDragStop={(e,d) => {
            if(properties.onDrag)
                properties.onDrag(d.x, d.y);
        }}
        onDrag={(e, d) => {
            if(properties.onDrag)
                properties.onDrag(d.x, d.y);
        }}
    >
        {properties.children}
    </Rnd>
   );
}