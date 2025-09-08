import { TemplateTabDrawProperties } from '@pfiffkopf-webapp-office/pfk-pdf';
import { DocumentSection } from './pfkInvoiceTemplate';
import {
  Group,
  Paper,
  Stack,
  Text,
  SimpleGrid,
  NumberInput,
  ColorInput,
  Grid,
} from '@mantine/core';
import { IconFile, IconPalette, IconPencil } from '@tabler/icons-react';
import { FontSelectorUI } from '../template_components/fontSelector/fontSelector';

export function DocumentCategory(properties: {
  properties: TemplateTabDrawProperties;
  self: DocumentSection;
}) {
  const isMobile = properties.properties.isMobile;
  const self = properties.self;
  const template = properties.properties.template;
  const spacing = isMobile ? 'sm' : 'lg';
  const paperPadding = isMobile ? 'md' : 'lg';
  return (
    <Stack gap={spacing} p={isMobile ? 'sm' : 'md'}>
      {/* Seitenlayout Section */}
      <Paper p={paperPadding} shadow="xs" radius="md">
        <Group gap="md" mb="md">
          <IconFile
            size={20}
            style={{ color: 'var(--mantine-color-blue-6)' }}
          />
          <Text size={isMobile ? 'sm' : 'md'} fw={600} c="dark">
            Seitenlayout
          </Text>
        </Group>
        <Stack gap={isMobile ? 'sm' : 'md'}>
          <SimpleGrid cols={2} spacing={isMobile ? 'xs' : 'sm'}>
            <NumberInput
              label="Rand oben"
              placeholder="20"
              suffix=" mm"
              size={isMobile ? 'sm' : 'md'}
              min={10}
              max={25}
              defaultValue={self.pagePaddingTop}
              onChange={(size) => {
                self.pagePaddingTop = Number(size);
                template.redrawView();
              }}
            />
            <NumberInput
              label="Rand unten"
              placeholder="20"
              suffix=" mm"
              size={isMobile ? 'sm' : 'md'}
              min={10}
              max={25}
              defaultValue={self.pagePaddingBottom}
              onChange={(size) => {
                self.pagePaddingBottom = Number(size);
                template.redrawView();
              }}
            />
            <NumberInput
              label="Rand links"
              placeholder="20"
              suffix=" mm"
              size={isMobile ? 'sm' : 'md'}
              min={10}
              max={25}
              defaultValue={self.pagePaddingLeft}
              onChange={(size) => {
                self.pagePaddingLeft = Number(size);
                template.redrawView();
              }}
            />
            <NumberInput
              label="Rand rechts"
              placeholder="20"
              suffix=" mm"
              size={isMobile ? 'sm' : 'md'}
              min={10}
              max={25}
              defaultValue={self.pagePaddingRight}
              onChange={(size) => {
                self.pagePaddingRight = Number(size);
                template.redrawView();
              }}
            />
          </SimpleGrid>
        </Stack>
      </Paper>
      {/* Schriftart Section */}
      <Paper p={paperPadding} shadow="xs" radius="md">
        <Group gap="md" mb="md">
          <IconPencil
            size={20}
            style={{ color: 'var(--mantine-color-green-6)' }}
          />
          <Text size={isMobile ? 'sm' : 'md'} fw={600} c="dark">
            Schriftart
          </Text>
        </Group>

        <Stack gap={isMobile ? 'sm' : 'md'}>
          <FontSelectorUI
            allowCustomFontUpload={false}
            fontSelector={self.font}
            template={template}
          />

          <Grid>
            <Grid.Col span={isMobile ? 12 : 6}>
              <NumberInput
                label="Schriftgröße"
                placeholder="12"
                suffix=" pt"
                size={isMobile ? 'sm' : 'md'}
                min={8}
                max={24}
                defaultValue={self.fontSize}
                onChange={(size) => {
                  self.fontSize = Number(size);
                  template.redrawView();
                }}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>
      {/* Farben Section */}
      <Paper p={paperPadding} shadow="xs" radius="md">
        <Group gap="md" mb="md">
          <IconPalette
            size={20}
            style={{ color: 'var(--mantine-color-orange-6)' }}
          />
          <Text size={isMobile ? 'sm' : 'md'} fw={600} c="dark">
            Farben
          </Text>
        </Group>

        <SimpleGrid cols={isMobile ? 1 : 2} spacing={isMobile ? 'sm' : 'md'}>
          <ColorInput
            label="Textfarbe"
            placeholder="Wählen Sie eine Farbe"
            size={isMobile ? 'sm' : 'md'}
            defaultValue={self.fontColor}
            onChange={(color) => {
              self.fontColor = color;
              template.redrawView();
            }}
            format="hex"
          />
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
