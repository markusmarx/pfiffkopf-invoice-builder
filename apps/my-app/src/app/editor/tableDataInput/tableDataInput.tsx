import { Checkbox, NumberInput, Table, TextInput } from "@mantine/core";
import { TableData, Template } from "../types";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useListState } from "@mantine/hooks";
import { IconGripVertical } from "@tabler/icons-react";
import classes from "./tableDataInput.module.css";
import { useReducer } from "react";

export interface TableDataInputProps {
  tableData: TableData;
  template: Template;
  labelEditing?: boolean;
  enableDisable?: boolean;
  widthEditing?: boolean;
}
export function TableDataInput(props: TableDataInputProps) {
  const [state, handlers] = useListState(props.tableData.tableEntries);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const items = state.map((item, index) => (
    <Draggable key={item.accessor} index={index} draggableId={item.accessor}>
      {(provided) => (
        <Table.Tr ref={provided.innerRef} {...provided.draggableProps}>
          <Table.Td w={10}>
            <div className={classes.dragHandle} {...provided.dragHandleProps}>
              <IconGripVertical size={18} stroke={1.5} />
            </div>
          </Table.Td>
          <Table.Td>
            {props.labelEditing && (
              <TextInput
                value={props.tableData.tableEntries[index].label}
                onChange={(ev) => {
                  item.label = ev.target.value;
                  props.tableData.tableEntries[index].label = ev.target.value;
                  props.template.RedrawView();
                  forceUpdate();
                }}
              />
            )}
            {!props.labelEditing && item.label}
          </Table.Td>
          <Table.Td>
            <Checkbox
              checked={item.enabled}
              disabled={!props.enableDisable}
              onChange={(event) => {
                item.enabled = event.currentTarget.checked;
                props.tableData.tableEntries[index].enabled =
                  event.currentTarget.checked;
                props.template.RedrawView();
                forceUpdate();
              }}
            />
          </Table.Td>
          <Table.Td>
            {props.widthEditing && (
              <NumberInput
                value={item.width}
                onChange={(event) => {
                  item.width = Number(event);
                  props.tableData.tableEntries[index].width = Number(event);
                  props.template.RedrawView();
                  forceUpdate();
                }}
              />
            )}
            {!props.widthEditing && item.width}
          </Table.Td>
        </Table.Tr>
      )}
    </Draggable>
  ));

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        handlers.reorder({ from: source.index, to: destination?.index || 0 });

        const dest = props.tableData.tableEntries[destination?.index || 0];
        props.tableData.tableEntries[destination?.index || 0] =
          props.tableData.tableEntries[source.index];
        props.tableData.tableEntries[source.index] = dest;
        props.template.RedrawView();
      }}
    >
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={10}></Table.Th>
            <Table.Th w={80}>Name</Table.Th>
            <Table.Th w={10}>Aktiviert</Table.Th>
            <Table.Th w={80}>Breite</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Droppable droppableId="dnd-list" direction="vertical">
          {(provided) => (
            <Table.Tbody {...provided.droppableProps} ref={provided.innerRef}>
              {items}
              {provided.placeholder}
            </Table.Tbody>
          )}
        </Droppable>
      </Table>
    </DragDropContext>
  );
}
