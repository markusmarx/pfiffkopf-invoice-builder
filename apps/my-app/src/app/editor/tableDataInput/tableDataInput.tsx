import { Checkbox, NumberInput, Table, TextInput } from '@mantine/core';
import {
  TableData,
  TableEntry,
  Template,
} from '@pfiffkopf-webapp-office/pfk-pdf';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { IconGripVertical } from '@tabler/icons-react';
import classes from './tableDataInput.module.css';
import { useReducer } from 'react';

export interface TableDataInputProps {
  tableData: TableData;
  template: Template;
  labelEditing?: boolean;
  enableEditing?: boolean;
  widthEditing?: boolean;
  reorderEditing?: boolean;
}

export function TableDataInput(props: TableDataInputProps) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  function TableRowContent(propserties: { item: TableEntry; index: number }) {
    return (
      <>
        <Table.Td>
          {props.labelEditing && (
            <TextInput
              defaultValue={propserties.item.label}
              onChange={(event) => {
                propserties.item.label = event.target.value;
                props.template.redrawView();
              }}
            />
          )}
          {!props.labelEditing && propserties.item.label}
        </Table.Td>
        <Table.Td>
          <Checkbox
            defaultChecked={propserties.item.enabled}
            disabled={!props.enableEditing}
            onChange={(event) => {
              propserties.item.enabled = event.currentTarget.checked;
              props.template.redrawView();
            }}
          />
        </Table.Td>
        <Table.Td>
          {props.widthEditing && (
            <NumberInput
              defaultValue={propserties.item.width}
              onChange={(event) => {
                propserties.item.width = Number(event);
                props.template.redrawView();
              }}
            />
          )}
          {!props.widthEditing && propserties.item.width}
        </Table.Td>
      </>
    );
  }

  const items = props.tableData.tableEntries.map((item, index) => (
    <Draggable key={item.accessor} index={index} draggableId={item.accessor}>
      {(provided) => (
        <Table.Tr ref={provided.innerRef} {...provided.draggableProps}>
          <Table.Td w={10}>
            <div className={classes.dragHandle} {...provided.dragHandleProps}>
              <IconGripVertical size={18} stroke={1.5} />
            </div>
          </Table.Td>
          <TableRowContent index={index} item={item} />
        </Table.Tr>
      )}
    </Draggable>
  ));
  if (props.reorderEditing) {
    return (
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          const sourceIndex = source.index;
          const destIndex = destination?.index || 0;
          const dest = props.tableData.tableEntries[destIndex];
          props.tableData.tableEntries[destIndex] =
            props.tableData.tableEntries[sourceIndex];
          props.tableData.tableEntries[sourceIndex] = dest;
          props.template.redrawView();
          forceUpdate();
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
  } else {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={10}></Table.Th>
            <Table.Th w={80}>Name</Table.Th>
            <Table.Th w={10}>Aktiviert</Table.Th>
            <Table.Th w={80}>Breite</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {props.tableData.tableEntries.map((value, index) => {
            return (
              <Table.Tr>
                <Table.Td w={10}>
                  <div
                    className={classes.dragHandle}
                    style={{ color: 'rgba(1,1,1,0)' }}
                  >
                    <IconGripVertical size={18} stroke={1.5} />
                  </div>
                </Table.Td>
                <TableRowContent index={index} item={value} />
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    );
  }
}
