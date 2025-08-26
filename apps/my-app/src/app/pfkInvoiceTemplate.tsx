import {
  ColorInput,
  FileInput,
  Grid,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  Template,
  TemplateTab,
  FontSelector,
  TemplateDrawProperties,
  TemplateTabDrawProperties,
  DragVector,
  TableData,
  MovableTable,
  Page,
  PageFormat,
  MovableBox,
} from '@pfiffkopf-webapp-office/pfk-pdf';
import React, { JSX } from 'react';
import DragVectorInput, {
  DragVectorDisplayType,
} from './editor/dragVectorInput/dragVectorInput';
import { TableDataInput } from './editor/tableDataInput/tableDataInput';
import { FontSelectorUI } from './editor/fontSelector/fontSelector';
import { IconFile, IconPalette, IconPencil, IconTransform, IconVector } from '@tabler/icons-react';

export class DocumentSection extends TemplateTab {
  font: FontSelector;
  fontSize: number;
  pagePaddingTop: number;
  pagePaddingBottom: number;
  pagePaddingLeft: number;
  pagePaddingRight: number;
  fontColor: string;
  public constructor(template: Template) {
    super();
    this.fontSize = 12;
    this.pagePaddingBottom = 10;
    this.pagePaddingLeft = 10;
    this.pagePaddingRight = 10;
    this.pagePaddingTop = 10;
    this.fontColor = '#1a1a1a';
    this.font = new FontSelector(template.getFontStorage());
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      const paperPadding = properties.isMobile ? 'md' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          {/* Seitenlayout Section */}
          <Paper p={paperPadding} shadow="xs" radius="md">
            <Group gap="md" mb="md">
              <IconFile
                size={20}
                style={{ color: 'var(--mantine-color-blue-6)' }}
              />
              <Text size={properties.isMobile ? 'sm' : 'md'} fw={600} c="dark">
                Seitenlayout
              </Text>
            </Group>
            <Stack gap={properties.isMobile ? 'sm' : 'md'}>
              <SimpleGrid cols={2} spacing={properties.isMobile ? 'xs' : 'sm'}>
                <NumberInput
                  label="Rand oben"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingTop}
                  onChange={(size) => {
                    this.pagePaddingTop = Number(size);
                    properties.template.redrawView();
                  }}
                />
                <NumberInput
                  label="Rand unten"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingBottom}
                  onChange={(size) => {
                    this.pagePaddingBottom = Number(size);
                    properties.template.redrawView();
                  }}
                />
                <NumberInput
                  label="Rand links"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingLeft}
                  onChange={(size) => {
                    this.pagePaddingLeft = Number(size);
                    properties.template.redrawView();
                  }}
                />
                <NumberInput
                  label="Rand rechts"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingRight}
                  onChange={(size) => {
                    this.pagePaddingRight = Number(size);
                    properties.template.redrawView();
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
              <Text size={properties.isMobile ? 'sm' : 'md'} fw={600} c="dark">
                Schriftart
              </Text>
            </Group>

            <Stack gap={properties.isMobile ? 'sm' : 'md'}>
              <FontSelectorUI
                allowCustomFontUpload={false}
                fontSelector={this.font}
                template={properties.template}
              />

              <Grid>
                <Grid.Col span={properties.isMobile ? 12 : 6}>
                  <NumberInput
                    label="Schriftgröße"
                    placeholder="12"
                    suffix=" pt"
                    size={properties.isMobile ? 'sm' : 'md'}
                    min={8}
                    max={24}
                    defaultValue={this.fontSize}
                    onChange={(size) => {
                      this.fontSize = Number(size);
                      properties.template.redrawView();
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
              <Text size={properties.isMobile ? 'sm' : 'md'} fw={600} c="dark">
                Farben
              </Text>
            </Group>

            <SimpleGrid
              cols={properties.isMobile ? 1 : 2}
              spacing={properties.isMobile ? 'sm' : 'md'}
            >
              <ColorInput
                label="Textfarbe"
                placeholder="Wählen Sie eine Farbe"
                size={properties.isMobile ? 'sm' : 'md'}
                defaultValue={this.fontColor}
                onChange={(color) => {
                  this.fontColor = color;
                  properties.template.redrawView();
                }}
                format="hex"
              />
            </SimpleGrid>
          </Paper>
        </Stack>
      );
    };
  }
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'document';
  }
  public get displayName(): string {
    return 'Dokumenteinstellungen';
  }
  public get shortDisplayName(): string {
    return 'Dokument';
  }
  public get description(): string {
    return 'Seitenlayout & Formatierung';
  }
}

export class RecipentSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          <DragVectorInput
            template={properties.template}
            isMobile={properties.isMobile}
            positionVector={this.pos}
          />
        </Stack>
      );
    };
  }
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'recipient';
  }
  public get displayName(): string {
    return 'Empfänger';
  }
  public get shortDisplayName(): string {
    return 'Empfänger';
  }
  public get description(): string {
    return 'Kundendaten & Adresse';
  }
}

export class InvoiceParamSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          <DragVectorInput
            template={properties.template}
            isMobile={properties.isMobile}
            positionVector={this.pos}
          />
        </Stack>
      );
    };
  }
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'invoice';
  }
  public get displayName(): string {
    return 'Rechnungskopf';
  }
  public get shortDisplayName(): string {
    return 'Rechnung';
  }
  public get description(): string {
    return 'Rechnungsnummer, Datum';
  }
}

export class PositionsSection extends TemplateTab {
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'table';
  }
  public get displayName(): string {
    return 'Tabelleneinstellungen';
  }
  public get shortDisplayName(): string {
    return 'Tabelle';
  }
  public get description(): string {
    return 'Tabellenstil & Layout';
  }
  public pos = new DragVector(100, 400);
  public size = new DragVector(300, 100);
  public table = new TableData(
    [
      { accessor: 't1', label: 'Pos' },
      { accessor: 't2', label: 'Beschreibung' },
      { accessor: 't3', label: 'Dauer' },
      { accessor: 't4', label: 'Einzel' },
      { accessor: 't5', label: 'Ust. %' },
      { accessor: 't6', label: 'Gesamt' },
    ],
    300,
  );
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          <DragVectorInput
            template={properties.template}
            isMobile={properties.isMobile}
            positionVector={this.pos}
            sizeVector={this.size}
          />
          <TableDataInput
            tableData={this.table}
            template={properties.template}
            isMobile={properties.isMobile}
            labelEditing={true}
            enableEditing={true}
            widthEditing={true}
            reorderEditing={true}
            
          />
        </Stack>
      );
    };
  }
}

export class PfkInvoiceTemplate extends Template {
  letterpaper?: DocumentSection;
  address?: RecipentSection;
  table?: PositionsSection;
  invoice?: InvoiceParamSection;

  drawPaper(prop: TemplateDrawProperties): Array<JSX.Element> {
    return Array<JSX.Element>(
      <Page
        format={PageFormat.A4}
        borderTop={(this.letterpaper?.pagePaddingTop || 1) / 10}
        borderBottom={(this.letterpaper?.pagePaddingBottom || 1) / 10}
        borderLeft={(this.letterpaper?.pagePaddingLeft || 1) / 10}
        borderRight={(this.letterpaper?.pagePaddingRight || 1) / 10}
        autoExpand={prop.pdfRenderer}
        alwaysBreakToNewPage={false}
        landscape={false}
        style={{
          fontFamily: this.letterpaper?.font.family(),
          color: this.letterpaper?.fontColor,
          fontSize: `${this.letterpaper?.fontSize}pt`, //TODO: Size Conversion and broken?
        }}
      >
        <MovableBox
          className="adress"
          enabled={prop.currentTab === 'recipient'}
          template={this}
          templateTab={this.address}
          {...this.address?.pos.dragPos()}
          width={300}
          heigth={150}
          id="recipient"
        >
          <Text>
            <b>Musterfirma</b>
          </Text>
          <Text>
            <b>Etage 0815</b>
          </Text>
          <Text>Maxime Muster</Text>
          <Text>Musterstraße 16</Text>
          <Text> - Zusatz - </Text>
          <Text>01234 Musterhausen</Text>
        </MovableBox>
        <MovableBox
          className="adress"
          enabled={prop.currentTab === 'invoice'}
          template={this}
          templateTab={this.invoice}
          {...this.invoice?.pos.dragPos()}
          width={300}
          heigth={150}
          id="invoice"
        >
          <Stack align={'flex-end'} gap={0}>
            <Title
              order={3}
              style={{ fontFamily: this.letterpaper?.font.family() }}
            >
              Rechnung
            </Title>
            <Group justify={'space-between'}>
              <Stack align={'flex-end'} gap={0}>
                <Text>Rechnungnr.:</Text>
                <Text>Datum:</Text>
                <Text>Leistungszeitraum:</Text>
                <Text>&nbsp;</Text>
              </Stack>
              <Stack align={'flex-end'} gap={0}>
                <Text>R2025-0001</Text>
                <Text>31.01.2025</Text>
                <Text>01.01.2025</Text>
                <Text>bis 31.01.2025</Text>
              </Stack>
            </Group>
          </Stack>
        </MovableBox>
        <MovableBox id={'salutation'} x={0} y={300} width={700} heigth={100}>
          <Text fw={700}>Hallo Maxim Mustermann,</Text>
          <Text>
            ich erlaube mir eine Rechnung für folgende Leistungen zu stellen.
          </Text>
        </MovableBox>
        <MovableTable
          className="table"
          enabled={prop.currentTab === 'table'}
          template={this}
          templateTab={this.table}
          x={this.table?.pos.x}
          y={this.table?.pos.y}
          width={this.table?.size.x}
          heigth={this.table?.size.y}
          id="table"
          enableResizing={false}
          cellStyle={{ border: '3px solid' }}
          headerStyle={{ border: '3px solid' }}
          disableMovement={true}
          {...(this.table?.table.dynamicTable() || { header: [] })}
          rows={[
            {
              elements: [
                { label: '1', accessor: 't1' },
                { label: 'Termin Beschreibung', accessor: 't2' },
                { label: '2 x 45 min', accessor: 't3' },
                { label: '50,00€', accessor: 't4' },
                { label: '0,00%', accessor: 't5' },
                { label: '100,00€', accessor: 't6' },
              ],
              accessorControlled: true,
            },
          ]}
        />
        <MovableBox id={'salutation'} x={0} y={600} width={700} heigth={100}>
          <Text>Vielen Dank für die gute Zusammenarbeit!</Text>
        </MovableBox>
      </Page>,
    );
  }
}
