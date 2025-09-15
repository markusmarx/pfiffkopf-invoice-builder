import {
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Table,
  TextInput,
  Text,
  Stack,
  Grid,
  Center,
  Flex,
} from '@mantine/core';
import {
  pxfromUnit,
  pxToUnit,
  RoundToTwo,
  TableData,
  TableEntry,
  Template,
  Unit,
  unitToGermanLanguageString as unitToGermanLanguageString,
} from '@pfiffkopf-webapp-office/pfk-pdf';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { IconGripVertical, IconTable } from '@tabler/icons-react';
import classes from './tableDataInput.module.css';
import { useReducer } from 'react';

export interface TableDataInputProps {
  tableData: TableData;
  template: Template;
  labelEditing?: boolean;
  enableEditing?: boolean;
  widthEditing?: boolean;
  reorderEditing?: boolean;
  isMobile: boolean;
}

export function TableDataInput(props: TableDataInputProps) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const unit = Unit.mm;
  const paperPadding = props.isMobile ? 'md' : 'lg';
  function TableRowContent(propserties: { item: TableEntry; index: number }) {
    return (
      <Table.Td>
        <Stack>
          <Grid>
            <Grid.Col span={11}>
              {props.labelEditing && (
                <TextInput
                  defaultValue={propserties.item.label}
                  onChange={(event) => {
                    propserties.item.label = event.target.value;
                    props.template.redrawView();
                  }}
                />
              )}
              {!props.labelEditing && <Text>{propserties.item.label}</Text>}
            </Grid.Col>
            <Grid.Col span={1}>
              <Checkbox
                styles={{
                  root: {
                    minHeight: '100%',
                    display: 'grid',
                    placeItems: 'center',
                  },
                }}
                defaultChecked={propserties.item.enabled}
                disabled={!props.enableEditing}
                onChange={(event) => {
                  propserties.item.enabled = event.currentTarget.checked;
                  props.template.redrawView();
                }}
              />
            </Grid.Col>
          </Grid>

          {props.widthEditing && (
            <Grid>
              <Grid.Col span={4}>
                <div
                  style={{
                    minHeight: '100%',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Text>Größe:</Text>
                </div>
              </Grid.Col>
              <Grid.Col span={8}>
                <NumberInput
                  defaultValue={RoundToTwo(
                    pxToUnit(propserties.item.width || 0, unit),
                  )}
                  onChange={(event) => {
                    propserties.item.width = pxfromUnit(Number(event), unit);
                    props.template.redrawView();
                  }}
                  suffix={' ' + unitToGermanLanguageString(unit)}
                />
              </Grid.Col>
            </Grid>
          )}
        </Stack>
      </Table.Td>
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

  const content = () => {
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
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <Table.Tbody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
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
              <Table.Th />
                <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {props.tableData.tableEntries.map((value, index) => {
              return (
                <Table.Tr>
                  <TableRowContent index={index} item={value} />
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      );
    }
  };

  return (
    <Paper p={paperPadding} shadow="xs" radius="md">
      <Group gap="md" mb="md">
        <IconTable
          size={20}
          style={{ color: 'var(--mantine-color-green-6)' }}
        />
        <Text size={props.isMobile ? 'sm' : 'md'} fw={600} c="dark">
          Tabelle
        </Text>
      </Group>
      <Stack gap={props.isMobile ? 'sm' : 'md'}>{content()}</Stack>
    </Paper>
  );
}
