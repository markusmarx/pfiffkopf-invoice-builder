import { ReactNode } from "react";
import "./movableBox.module.css"
import { Rnd } from "react-rnd";
import { Template, TemplateTab } from "../types";
export interface MovableBoxParams{
    children?: ReactNode;
    enabled?: boolean;
    className?: string;
    template?: Template;
    templateTab?: TemplateTab;
    width?: number;
    heigth?: number;
    x?: number;
    y?: number;
    onDrag?: (xPos: number, yPos: number, tab?: TemplateTab ) => void;
    onEndDrag?: (xPos: number, yPos: number, template?: Template, tab?: TemplateTab) => void;
}
export function MovableBox(properties: MovableBoxParams){
   return (
    <Rnd className={properties.className + ((properties.enabled) ? " moving-box" : "")}
        size={{width: `${properties.width !== undefined ? properties.width : 100}px`, height: `${properties.heigth !== undefined ? properties.heigth : 100}px`}}
        position={{x: properties.x || 0, y: properties.y || 0}}
        disableDragging={!properties.enabled}
        enableResizing={false}
        onDragStop={(e,d) => {
            if(properties.onEndDrag)
                properties.onEndDrag(d.x, d.y, properties.template, properties.templateTab);
        }}
        onDrag={(e, d) => {
            if(properties.onDrag){
                properties.onDrag(d.x, d.y, properties.templateTab);
            }
        }}
    >
        {properties.children}
    </Rnd>
   );
}