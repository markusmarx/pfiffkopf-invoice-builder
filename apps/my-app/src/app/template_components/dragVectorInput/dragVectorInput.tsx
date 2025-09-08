import {
  Grid,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { DragVector, Template, Unit } from '@pfiffkopf-webapp-office/pfk-pdf';
import { IconVector } from '@tabler/icons-react';

export enum DragVectorDisplayType {
  Position,
  Size,
}

export interface DragVectorInputProperties {
  positionVector?: DragVector;
  sizeVector?: DragVector;
  template: Template;
  isMobile: boolean;
}
export function DragVectorInput(props: DragVectorInputProperties) {
  const paperPadding = props.isMobile ? 'md' : 'lg';
  return (
    <Paper p={paperPadding} shadow="xs" radius="md">
      <Group gap="md" mb="md">
        <IconVector
          size={20}
          style={{ color: 'var(--mantine-color-green-6)' }}
        />
        <Text size={props.isMobile ? 'sm' : 'md'} fw={600} c="dark">
          Position
        </Text>
      </Group>
      <Stack gap={props.isMobile ? 'sm' : 'md'}>
        <SimpleGrid cols={2} spacing={props.isMobile ? 'xs' : 'sm'}>
          {props.positionVector && (
            <>
              <NumberInput
                label="X-Position"
                placeholder="20"
                size={props.isMobile ? 'sm' : 'md'}
                {...props.positionVector.getInputPropsX(props.template, Unit.mm)}
              />
              <NumberInput
                label="Y-Position"
                placeholder="20"
                size={props.isMobile ? 'sm' : 'md'}
                {...props.positionVector.getInputPropsY(props.template, Unit.mm)}
              />
            </>
          )}

          {props.sizeVector && (
            <>
              <NumberInput
                label="Breite"
                placeholder="20"
                size={props.isMobile ? 'sm' : 'md'}
                {...props.sizeVector.getInputPropsX(props.template, Unit.mm)}
                
                defaultValue={props.sizeVector.x}
                onChange={(size) => {
                  if (props.sizeVector) {
                    props.sizeVector.x = Number(size);
                    props.template.redrawView();
                  }
                }}
              />
              <NumberInput
                label="Höhe"
                placeholder="20"
                size={props.isMobile ? 'sm' : 'md'}
                {...props.sizeVector.getInputPropsY(props.template, Unit.mm)}
                defaultValue={props.sizeVector.y}
                onChange={(size) => {
                  if (props.sizeVector) {
                    props.sizeVector.y = Number(size);
                    props.template.redrawView();
                  }
                }}
              />
            </>
          )}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
export default DragVectorInput;
