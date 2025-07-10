import { RenderableBlockParams } from "../types";
import { Text, Table } from "@mantine/core";
import { BaseMovableBox } from "../movable/baseMovable";
import { useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
export interface MovableTableParams extends RenderableBlockParams {
  collums: Collumn[]; 
}

interface ResizableColumnHeaderProps{
  col: Collumn;
  width: number;
  onResize: (accesor: string, delta: number) => void;
}
export interface Collumn{
  accessor: string;
  label: string;
}

function ResizableColumnHeader(props: ResizableColumnHeaderProps) {
    return (
        <th style={{ width: props.width, position: "relative" }}>
            {props.col.label}
        </th>
    );
};

export function MovableTable(properties: MovableTableParams) {

    const [colWidths, setColWidths] = useState<{[Key: string]: number}>(
          properties.collums.reduce((acc, col) => ({ ...acc, [col.accessor]: 150 }), {})
      );
    const handleResize = (col: string, delta : number) => {
      console.log("resize");
          setColWidths((prev) => ({
              ...prev,
              [col]: Math.max(prev[col] + delta, 50),
          }));
      };


   return(
      <BaseMovableBox
        template={properties.template}
        templateTab={properties.templateTab}
        id={properties.id}
        enabled={true}
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
            <Table>
              <thead>
                <tr>
                  {properties.collums.map((value) => {
                    return(
                      <ResizableColumnHeader
                        key={value.accessor}
                        width={colWidths[value.accessor]}
                        col={{accessor: value.accessor, label: value.label}}
                        onResize={handleResize}
                      />
                    );
                  })

                  }
                </tr>
              </thead>
            <tbody>
            </tbody>
            </Table>
          </div>
        </div>
      </BaseMovableBox>
    );
}
