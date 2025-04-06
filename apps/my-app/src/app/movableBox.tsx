import { ReactNode, useRef } from "react";
import Moveable from "react-moveable";

export interface MovableBoxParams{
    children?: ReactNode;

}
export function MovableBox(properties: MovableBoxParams){
    const targetRef = useRef<HTMLDivElement>(null);
    return(
        <>
            <div className="target" ref={targetRef}>{properties?.children}</div>
                <Moveable
                    target={targetRef}
                    draggable={true}
                    throttleDrag={1}
                    edgeDraggable={false}
                    startDragRotate={0}
                    throttleDragRotate={0}
                    onDrag={e => {
                        e.target.style.transform = e.transform;
                    }}
                />
        </>
    );
}