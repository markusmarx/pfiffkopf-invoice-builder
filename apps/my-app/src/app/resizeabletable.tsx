import React, { useState, useRef } from "react";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ResizableTable = ({ columns, data }) => {
    const [colWidths, setColWidths] = useState(
        columns.reduce((acc: any, col:any) => ({ ...acc, [col.accessor]: 150 }), {})
    );

    const handleResize = (col, delta) => {
        setColWidths((prev) => ({
            ...prev,
            [col]: Math.max(prev[col] + delta, 50),
        }));
    };

    return (
        <DndProvider backend={HTML5Backend}>
        <div className="overflow-x-auto">
            asdf
            <table>
                <thead>
                <tr>
                    {columns.map((col: any) => (
                        <ResizableColumnHeader
                            key={col.accessor}
                            col={col}
                            width={colWidths[col.accessor]}
                            onResize={handleResize}
                        />
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col) => (
                            <td
                                key={col.accessor}
                                style={{ width: colWidths[col.accessor] }}
                                className="border p-2"
                            >
                                {row[col.accessor]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </DndProvider>
    );
};

const ResizableColumnHeader = ({ col, width, onResize }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({ accept: "COLUMN_RESIZE" });
    const [{ isDragging }, drag] = useDrag({
        type: "COLUMN_RESIZE",
        item: { accessor: col.accessor },
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    });

    drag(drop(ref));

    return (
        <th style={{ width }} className="border p-2 relative">
            {col.label}
            <div
                ref={ref}
                className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
                onMouseDown={(e) => {
                    const startX = e.clientX;
                    const handleMouseMove = (event) => {
                        const delta = event.clientX - startX;
                        onResize(col.accessor, delta);
                    };
                    const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove);
                        document.removeEventListener("mouseup", handleMouseUp);
                    };
                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                }}
            />
        </th>
    );
};

export default ResizableTable;
