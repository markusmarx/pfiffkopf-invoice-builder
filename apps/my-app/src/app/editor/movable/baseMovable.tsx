import "./movableBox.module.css";
import { Rnd } from "react-rnd";
import { RenderableBlockParams} from "../types";
import { useRef } from "react";
export function BaseMovableBox(properties: RenderableBlockParams) {
  const rnd = useRef<Rnd>(null);
  return (
    
      <Rnd
        ref={rnd}
        className={
          properties.className + (properties.enabled ? " moving-box" : "")
        }
        size={{
          width: `${properties.sizeVector ? properties.sizeVector.x : properties.width || 100}px`,
          height: `${properties.sizeVector ? properties.sizeVector.y : properties.heigth || 100}px`,
        }}
        position={{ x:  properties.posVector ? properties.posVector.x : properties.x || 0, y: properties.posVector ? properties.posVector.y : properties.y || 0 }}
        disableDragging={!properties.enabled || properties.disableMovement}//(!properties.enabled && properties.disableMovement) || properties.disableMovement}
        enableResizing={(properties.enabled && properties.enableResizing) || false}
        onDragStop={(e, d) => {
          if (properties.onSubmitPositionChange)
            properties.onSubmitPositionChange(
              d.x,
              d.y,
              properties.template,
              properties.templateTab
            );
        }}
        onDrag={(e, d) => {
          if (properties.onDrag) {
            properties.onDrag(d.x, d.y, properties.templateTab);
          }
        }}
        cancel=".child_drag"
        bounds={"parent"}
        onResize={(e, dir, ref, delta, position) => {
          if(properties.onResize){
              properties.onResize(Number(ref.style.width.slice(0, -2)), Number(ref.style.height.slice(0, -2)), properties.templateTab);
              if(properties.onDrag){
                  properties.onDrag(position.x, position.y, properties.templateTab);
              }
          }
        }}
        onResizeStop={(e, dir, ref, delta, position) => {
          if(properties.onSubmitSizeChange){
              properties.onSubmitSizeChange(Number(ref.style.width.slice(0, -2)), Number(ref.style.height.slice(0, -2)), properties.template, properties.templateTab);
              if(properties.onDrag){
                  properties.onDrag(position.x, position.y, properties.templateTab);
              }
          }
        }}
        
      >
         {properties.children}
      </Rnd>
    
  );
}
