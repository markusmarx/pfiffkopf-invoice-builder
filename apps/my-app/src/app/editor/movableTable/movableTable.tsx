import { RenderableBlockParams } from "../types";
import { Text, Table } from "@mantine/core";
import { BaseMovableBox } from "../movable/baseMovable";
import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
export interface MovableTableParams extends RenderableBlockParams {
  collums: Collumn[];
  rows: Cell[][];
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
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
}
export interface Cell {
  label: string;
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
  const boxWidth = properties.sizeVector
    ? properties.sizeVector.x
    : properties.width || 1;
  const [colWidths, setColWidths] = useState<{ [Key: string]: number }>(
    properties.collums.reduce(
      (acc, col) => ({
        ...acc,
        [col.accessor]: 150,
      }),
      {}
    )
  );
  function handleResize(col: string, delta: number) {
    setColWidths((prev) => ({
      ...prev,
      [col]: Math.max(prev[col] + delta, 50),
    }));
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
                  {properties.collums.map((value, idx) => {
                    return (
                      <ResizableColumnHeader
                        key={value.accessor}
                        width={colWidths[value.accessor]}
                        col={value}
                        onResize={handleResize}
                        style={properties.headerStyle}
                        dragging={idx !== properties.collums.length}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {properties.rows.map((row) => {
                  return (
                    <tr>
                      {row.map((cell) => {
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
                })}
              </tbody>
            </Table>
          </div>
        </DndProvider>
      </div>
    </BaseMovableBox>
  );
}
