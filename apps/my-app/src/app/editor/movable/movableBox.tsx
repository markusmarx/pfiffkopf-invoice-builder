import { ReactNode, useRef } from "react";
import Moveable from "react-moveable";
import "./movableBox.module.css"
export interface MovableBoxParams{
    children?: ReactNode;
    enabled?: boolean;
    id?: string;
    xPos?: number;
    yPos?: number;
    onDrag?: (xPos: number, yPos: number) => void;
}
export function MovableBox(properties: MovableBoxParams){
    const targetRef = useRef<HTMLDivElement>(null);
    return(
        <>
            <div id={properties.id || "movable"} ref={targetRef} style={{transform: `translate(${properties.xPos}px, ${properties.yPos}px)`}}>{properties?.children}</div>
                <Moveable
                    target={targetRef}
                    draggable={properties.enabled !== undefined ? properties.enabled : true}
                    className={properties.enabled !== undefined && properties.enabled ? "" : "moveable-hidden"}
                    throttleDrag={1}
                    useResizeObserver={true}
                    useMutationObserver={true}
                    edgeDraggable={false}
                    startDragRotate={0}
                    throttleDragRotate={0}
                    onDrag={e => {
                        e.target.style.transform = e.transform;
                        if(properties.onDrag){
                            properties.onDrag(e.left, e.top);
                        }                        
                    }}
                />
        </>
    );
}