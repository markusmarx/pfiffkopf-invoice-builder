import { FileInput, Group, Stack, Text, TextInput, Title } from '@mantine/core';
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

export class LetterpaperSection extends TemplateTab {
  bold?: boolean;
  watermark?: string;
  test?: number;
  testText?: string;
  font: FontSelector;
  public constructor(template: Template) {
    super();
    this.font = new FontSelector(template.getFontStorage());
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <div>
          <FileInput
            label="Briefpapier hochladen"
            style={{ fontFamily: 'Custom Font' }}
            onChange={(file) => {
              //
            }}
          />
          <TextInput
            label="dummy text"
            defaultValue={this.testText}
            onChange={(v) => {
              this.testText = v.target.value;
              properties.template.redrawView();
            }}
          />
          <FontSelectorUI
            fontSelector={this.font}
            allowCustomFontUpload={true}
            template={properties.template}
          />
        </div>
      );
    };
  }
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'paper';
  }
  public get displayName(): string {
    return 'Briefpapier';
  }
  public get shortDisplayName(): string {
    return 'Briefpapier';
  }
  public get description(): string {
    return 'Briefpapier';
  }
}

export class AddressSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <DragVectorInput
          template={properties.template}
          dragVector={this.pos}
          displayType={DragVectorDisplayType.Position}
        />
      );
    };
  }
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'adress';
  }
  public get displayName(): string {
    return 'Rechnungsadresse';
  }
  public get shortDisplayName(): string {
    return 'Rechnungsadresse';
  }
  public get description(): string {
    return 'Rechnungsadresse';
  }
}

export class InvoiceParamSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <DragVectorInput
          template={properties.template}
          dragVector={this.pos}
          displayType={DragVectorDisplayType.Position}
        />
      );
    };
  }
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'invoiceParams';
  }
  public get displayName(): string {
    return 'Rechnungsdaten';
  }
  public get shortDisplayName(): string {
    return 'Rechnungsdaten';
  }
  public get description(): string {
    return 'Rechnungsdaten';
  }
}

export class PositionsSection extends TemplateTab {
  public get pageNumbers(): number | number[] {
    return 0;
  }
  public get id(): string {
    return 'positionSection';
  }
  public get displayName(): string {
    return 'Positionen';
  }
  public get shortDisplayName(): string {
    return 'Positionen';
  }
  public get description(): string {
    return 'Positionen';
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
      return (
        <>
          <DragVectorInput
            template={properties.template}
            dragVector={this.pos}
            displayType={DragVectorDisplayType.Position}
          />
          <DragVectorInput
            template={properties.template}
            dragVector={this.size}
            displayType={DragVectorDisplayType.Size}
          />
          <TableDataInput
            template={properties.template}
            tableData={this.table}
            labelEditing={true}
            enableEditing={true}
            widthEditing={true}
            reorderEditing={true}
          />
        </>
      );
    };
  }
}

export class PfkInvoiceTemplate extends Template {
  letterpaper?: LetterpaperSection;
  address?: AddressSection;
  positions?: PositionsSection;
  invoiceParam?: InvoiceParamSection;

  drawPaper(prop: TemplateDrawProperties): Array<JSX.Element> {
    return Array<JSX.Element>(
      <Page
        format={PageFormat.A4}
        borderTop={1}
        borderBottom={1}
        borderLeft={1}
        borderRight={1}
        autoExpand={prop.pdfRenderer}
        alwaysBreakToNewPage={false}
        landscape={false}
        style={{ fontFamily: this.letterpaper?.font.family()}}
      >
        <MovableBox
          className="adress"
          enabled={prop.currentTab === 'address'}
          template={this}
          templateTab={this.address}
          {...this.address?.pos.dragPos()}
          width={300}
          heigth={150}
          id="address"
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
          enabled={prop.currentTab === 'invoiceParam'}
          template={this}
          templateTab={this.invoiceParam}
          {...this.invoiceParam?.pos.dragPos()}
          width={300}
          heigth={150}
          id="invoiceParam"
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
          className="positions"
          enabled={prop.currentTab === 'positions'}
          template={this}
          templateTab={this.positions}
          x={this.positions?.pos.x}
          y={this.positions?.pos.y}
          width={this.positions?.size.x}
          heigth={this.positions?.size.y}
          id="positions"
          enableResizing={false}
          cellStyle={{ border: '3px solid' }}
          headerStyle={{ border: '3px solid' }}
          disableMovement={true}
          {...(this.positions?.table.dynamicTable() || { header: [] })}
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
