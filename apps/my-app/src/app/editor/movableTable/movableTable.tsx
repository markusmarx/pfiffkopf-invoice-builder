import { Rnd } from "react-rnd";
import { RenderableBlockParams, TemplateTab } from "../types";
export interface MovableTableParams extends RenderableBlockParams {
  enabled?: boolean;
  className?: string;
  onDrag?: (xPos: number, yPos: number, tab?: TemplateTab) => void;
  collums: string[]; 
}
export function MovableTable(properties: MovableTableParams) {
  return (
    <Rnd
      className={
        properties.className + (properties.enabled ? " moving-box" : "")
      }
      size={{
        width: `${properties.width !== undefined ? properties.width : 100}px`,
        height: `${
          properties.heigth !== undefined ? properties.heigth : 100
        }px`,
      }}
      position={{ x:  properties.posVector ? properties.posVector.x : properties.x || 0, y: properties.posVector ? properties.posVector.y : properties.y || 0 }}
      disableDragging={!properties.enabled}
      enableResizing={false}
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
      bounds={"parent"}
    >
        {properties.collums.map((collum: string, id: number) => {
            return(
                collum
            );
        })}
    </Rnd>
  );
}
