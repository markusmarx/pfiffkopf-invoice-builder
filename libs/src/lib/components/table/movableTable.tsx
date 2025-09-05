import {
  RenderableBlockParams,
  Template,
  TemplateTab,
} from '../../templates/types';
import { Table } from '@mantine/core';
import { BaseMovableBox } from '../baseMovable';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React from 'react';
export interface MovableTableParams extends RenderableBlockParams {
  header: (Collumn | null)[];
  rows: TableRow[];
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
  onTableResize?: (
    delta: number,
    accesor: string,
    template?: Template,
    tab?: TemplateTab,
  ) => void;
}

interface ResizableColumnHeaderProps {
  col: Collumn;
  width: number;
  onResize: (accesor: string, delta: number) => void;
  style?: React.CSSProperties;
  dragging: boolean;
}

export interface Collumn {
  accessor: string;
  label: string;
  style?: React.CSSProperties;
  width?: number;
}
export interface TableRow {
  accessorControlled: boolean;
  elements: (Cell | undefined)[];
}
export interface Cell {
  label: string;
  accessor?: string;
  style?: React.CSSProperties;
  rowSpawn?: number,
  colSpawn?: number
}

function handleResize(
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  accessor: string,
  onResize: (accesor: string, delta: number) => void,
) {
  let startX = e.clientX;
  const handleMouseMove = (event: MouseEvent) => {
    const delta = event.clientX - startX;
    startX = event.clientX;
    onResize(accessor, delta);
  };
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function ResizableColumnHeader(props: ResizableColumnHeaderProps) {
  return (
    <th
      style={Object.assign(
        {
          width: `${props.width}px`,
          position: 'relative',
        },
        props.style,
        props.col.style,
      )}
    >
      {props.col.label}
      {props.dragging && (
        <div
          className="child_drag"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: '5px',
            cursor: 'ew-resize',
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
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: '5px',
          }}
        />
      )}
    </th>
  );
}

export function MovableTable(properties: MovableTableParams) {
  const [colWidths, setColWidths] = useState<{ [Key: string]: number }>(
    properties.header.reduce(
      (acc, col, index) => ({
        ...acc,
        [col?.accessor || index]: col?.width || 150,
      }),
      {},
    ),
  );
  function handleResize(col: string, delta: number) {
    if (properties.onTableResize) {
      properties.onTableResize(
        delta,
        col,
        properties.template,
        properties.templateTab,
      );
    } else {
      setColWidths((prev) => ({
        ...prev,
        [col]: prev[col] + delta,
      }));
    }
  }
  function findAccesorControlledEntry(accesor: string, row: TableRow) {
    for (let i = 0; i < row.elements.length; i++) {
      if (row.elements[i]?.accessor === accesor) {
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
      autoBreakOverMultiplePages={properties.autoBreakOverMultiplePages}
      onResize={properties.onResize}
      onSubmitSizeChange={properties.onSubmitSizeChange}
      disableMovement={properties.disableMovement}
      x={properties.x}
      y={properties.y}
      onSubmitPositionChange={properties.onSubmitPositionChange}
      onDrag={properties.onDrag}
    >
      <div
        id={properties.id}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100%',
          maxHeight: '100%',
        }}
      >
        <DndProvider backend={HTML5Backend}>
          <div>
            <Table>
              <thead>
                <tr>
                  {properties.header.map((value, idx) => {
                    if (value === null) {
                      return '';
                    }
                    return (
                      <ResizableColumnHeader
                        key={value.accessor}
                        width={value.width || colWidths[value.accessor]}
                        col={value}
                        onResize={handleResize}
                        style={properties.headerStyle}
                        dragging={
                          idx !== properties.header.length &&
                          (properties.enabled !== undefined
                            ? properties.enabled
                            : true)
                        }
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {properties.rows.map((row) => {
                  if (!row.accessorControlled) {
                    return (
                      <tr>
                        {row.elements.map((cell) => {
                          if(!cell) {
                            return "";
                          }
                          return (
                            <td rowSpan={cell.rowSpawn} colSpan={cell.colSpawn}
                              style={Object.assign(
                                {
                                  position: 'relative',
                                },
                                cell.style,
                                properties.cellStyle,
                              )}
                            >
                              {cell.label}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  } else {
                    return (
                      <tr>
                        {properties.header.map((element) => {
                          if (element === null) {
                            return '';
                          }
                          const cell = findAccesorControlledEntry(
                            element?.accessor,
                            row,
                          );
                          if (!cell) {
                            return <td></td>;
                          }
                          return (
                            <td rowSpan={cell.rowSpawn} colSpan={cell.colSpawn}
                              style={Object.assign(
                                {
                                  position: 'relative',
                                },
                                cell.style,
                                properties.cellStyle,
                              )}
                            >
                              {cell.label}
                            </td>
                          );
                        })}
                      </tr>
                    );
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
