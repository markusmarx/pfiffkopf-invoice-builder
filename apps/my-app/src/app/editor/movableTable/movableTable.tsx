import { RenderableBlockParams } from "../types";
import { Text } from "@mantine/core";
import { BaseMovableBox } from "../movable/baseMovable";
export interface MovableTableParams extends RenderableBlockParams {
  collums: string[]; 
}
export function MovableTable(properties: MovableTableParams) {
   return(
      <BaseMovableBox
        template={properties.template}
        templateTab={properties.templateTab}
        id={properties.id}
        enabled={properties.enabled}
        className={properties.className}

        enableResizing={properties.enableResizing}
        width={properties.width}
        heigth={properties.heigth}
        sizeVector={properties.sizeVector}
        autoBreakOverMultiplePages={properties.autoBreakOverMultiplePages}
        onResize={properties.onResize}
        onSubmitSizeChange={properties.onSubmitSizeChange}

        disableMovement={properties.disableMovement}
        x={properties.x}
        y={properties.y}
        posVector={properties.posVector}
        onSubmitPositionChange={properties.onSubmitPositionChange}
        onDrag={properties.onDrag}
      >
        <div id={properties.id} style={{width: "100%", height: "100%", minHeight: "100%", maxHeight: "100%"}}>
          <div>
            {properties.collums.map((collum: string, id: number) => {
                return(
                    <div><Text>{collum}</Text></div>
                );
            })}
          </div>
        </div>
      </BaseMovableBox>
    );
}
