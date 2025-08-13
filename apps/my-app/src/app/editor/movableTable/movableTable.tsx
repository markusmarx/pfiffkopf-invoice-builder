import { RenderableBlockParams, Template, TemplateTab } from "../types";
import { Text, Table } from "@mantine/core";
import { BaseMovableBox } from "../movable/baseMovable";
import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
export interface MovableTableParams extends RenderableBlockParams {
  header: (Collumn | null)[];
  rows: TableRow[];
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
  onTableResize?: (delta : number, accesor: string, template?: Template, tab?: TemplateTab) => void;
}

interface ResizableColumnHeaderProps {
  col: Collumn;
  width: number;
  onResize: (accesor: string, delta: number) => void;
  style?: React.CSSProperties;
  dragging: boolean;
}
interface ResizableCellProps extends ResizableColumnHeaderProps {
  value: string;
}

export interface Collumn {
  accessor: string;
  label: string;
  style?: React.CSSProperties;
  width?: number;
}
export interface TableRow{
  accesorControlled: boolean;
  elements: Cell[];
}
export interface Cell {
  label: string;
  accesor?: string;
  style?: React.CSSProperties;
}

function handleResize(
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  accessor: string,
  onResize: (accesor: string, delta: number) => void
) {
  let startX = e.clientX;
  const handleMouseMove = (event: MouseEvent) => {
    const delta = event.clientX - startX;
    startX = event.clientX;
    onResize(accessor, delta);
  };
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function ResizableColumnHeader(props: ResizableColumnHeaderProps) {
  return (
    <th
      style={Object.assign(
        {
          width: `${props.width}px`,
          position: "relative",
        },
        props.style,
        props.col.style
      )}
    >
      {props.col.label}
      {props.dragging && (
        <div
          className="child_drag"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "5px",
            cursor: "ew-resize",
          }}
          onMouseDown={(e) =>
            handleResize(e, props.col.accessor, props.onResize)
          }
        />
      )}
      {!props.dragging && (
        <div
          className="child_drag"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "5px",
          }}
        />
      )}
    </th>
  );
}
function Cell(props: ResizableCellProps) {
  return (
    <td
      style={{
        width: `${props.width}px`,
        position: "relative",
        border: "3px solid",
      }}
    >
      {props.value}
      <div
        className="child_drag"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: "5px",
          cursor: "ew-resize",
        }}
        onMouseDown={(e) => handleResize(e, props.col.accessor, props.onResize)}
      />
    </td>
  );
}

export function MovableTable(properties: MovableTableParams) {
  const [colWidths, setColWidths] = useState<{ [Key: string]: number }>(
    properties.header.reduce(
      (acc, col, index) => (
        {
        ...acc,
        [col?.accessor || index]: col?.width || 150,
      }),
      {}
    )
  );
  function handleResize(col: string, delta: number) {
    if(properties.onTableResize){
      properties.onTableResize(delta, col, properties.template, properties.templateTab);
    }else{
      setColWidths((prev) => ({
        ...prev,
        [col]: Math.max(prev[col] + delta, 50),
      }));
    }

  }
  function findAccesorControlledEntry(accesor: string, row: TableRow){
    for(let i = 0; i < row.elements.length; i++){
      if(row.elements[i].accesor === accesor){
        return row.elements[i];
      }
    }
  }

  return (
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
      <div
        id={properties.id}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100%",
          maxHeight: "100%",
        }}
      >
        <DndProvider backend={HTML5Backend}>
          <div>
            <Table>
              <thead>
                <tr>
                  {properties.header.map((value, idx) => {
                    if(value === null){
                      return "";
                    }
                    return (
                      <ResizableColumnHeader
                        key={value.accessor}
                        width={value.width || colWidths[value.accessor]}
                        col={value}
                        onResize={handleResize}
                        style={properties.headerStyle}
                        dragging={idx !== properties.header.length && properties.enabled ? properties.enabled : true}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {properties.rows.map((row) => {
                  if(!row.accesorControlled){
                    return (
                      <tr>
                        {row.elements.map((cell) => {
                          return (
                            <td
                              style={Object.assign(
                                {
                                  position: "relative",
                                },
                                properties.cellStyle,
                                cell.style
                              )}
                            >
                              {cell.label}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }else{
                    return(
                      <tr>
                        {
                          properties.header.map((element, idx) => {
                            if(element === null){
                              return "";
                            }
                            const cell = findAccesorControlledEntry(element?.accessor, row);
                            if(!cell){
                              return <td></td>;
                            }
                            return(
                              <td
                              style={Object.assign(
                                {
                                  position: "relative",
                                },
                                properties.cellStyle,
                                cell.style
                              )}
                            >
                              {cell.label}
                            </td>
                            );
                          })
                        }
                      </tr>
                    )
                  }
                  
                })}
              </tbody>
            </Table>
          </div>
        </DndProvider>
      </div>
    </BaseMovableBox>
  );
}
