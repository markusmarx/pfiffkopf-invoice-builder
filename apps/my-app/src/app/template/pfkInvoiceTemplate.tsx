import { Group, Stack, Text, Title } from '@mantine/core';
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
import { JSX } from 'react';
import { DocumentCategory } from './documentCategory';
import { RecipentCategory } from './recipentCategory';
import { InvoiceCategory } from './invoiceCategory';
import { TableCategory } from './tableCategory';
import { LogoCategory } from './logoCategory';

export class LogoSection extends TemplateTab {
  doc: null | File;
  docAsImage: null | string;
  public get id(): string {
    return 'logo';
  }
  public get displayName(): string {
    return 'Logo & Briefpapier';
  }
  public get shortDisplayName(): string {
    return 'Logo & Briefpapier';
  }
  public get description(): string {
    return 'Corporate Layout';
  }
  public get pageNumbers(): number | number[] {
    return [0, 1, 2, 3];
  }
  public constructor() {
    super();
    this.doc = null;
    this.docAsImage = null;
    this.drawUI = (properties) => (
      <LogoCategory self={this} properties={properties} />
    );
  }
}
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
    this.drawUI = (props: TemplateTabDrawProperties) => (
      <DocumentCategory self={this} properties={props} />
    );
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
    this.drawUI = (properties: TemplateTabDrawProperties) => (
      <RecipentCategory self={this} properties={properties} />
    );
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
export class InvoiceSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => (
      <InvoiceCategory self={this} properties={properties} />
    );
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
export class TableSection extends TemplateTab {
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
    this.drawUI = (properties: TemplateTabDrawProperties) => (
      <TableCategory self={this} properties={properties} />
    );
  }
}
export class PfkInvoiceTemplate extends Template {
  letterpaper?: DocumentSection;
  address?: RecipentSection;
  table?: TableSection;
  invoice?: InvoiceSection;
  logo?: LogoSection;

  drawPaper(prop: TemplateDrawProperties): Array<JSX.Element> {
    const fontSize = `${(this.letterpaper?.fontSize || 1) * (4 / 3)}px`;
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
          <Text style={{ fontSize: fontSize }}>
            <b>Musterfirma</b>
          </Text>
          <Text style={{ fontSize: fontSize }}>
            <b>Etage 0815</b>
          </Text>
          <Text style={{ fontSize: fontSize }}>Maxime Muster</Text>
          <Text style={{ fontSize: fontSize }}>Musterstraße 16</Text>
          <Text style={{ fontSize: fontSize }}> - Zusatz - </Text>
          <Text style={{ fontSize: fontSize }}>01234 Musterhausen</Text>
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
              style={{
                fontFamily: this.letterpaper?.font.family(),
                fontSize: fontSize,
              }}
            >
              Rechnung
            </Title>
            <Group justify={'space-between'}>
              <Stack align={'flex-end'} gap={0}>
                <Text style={{ fontSize: fontSize }}>Rechnungnr.:</Text>
                <Text style={{ fontSize: fontSize }}>Datum:</Text>
                <Text style={{ fontSize: fontSize }}>Leistungszeitraum:</Text>
                <Text style={{ fontSize: fontSize }}>&nbsp;</Text>
              </Stack>
              <Stack align={'flex-end'} gap={0}>
                <Text style={{ fontSize: fontSize }}>R2025-0001</Text>
                <Text style={{ fontSize: fontSize }}>31.01.2025</Text>
                <Text style={{ fontSize: fontSize }}>01.01.2025</Text>
                <Text style={{ fontSize: fontSize }}>bis 31.01.2025</Text>
              </Stack>
            </Group>
          </Stack>
        </MovableBox>
        <MovableBox id={'salutation'} x={0} y={300} width={700} heigth={100}>
          <Text style={{ fontSize: fontSize }} fw={700}>
            Hallo Maxim Mustermann,
          </Text>
          <Text style={{ fontSize: fontSize }}>
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
          cellStyle={{ border: '3px solid', fontSize: fontSize }}
          headerStyle={{ border: '3px solid', fontSize: fontSize }}
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
          <Text style={{ fontSize: fontSize }}>
            Vielen Dank für die gute Zusammenarbeit!
          </Text>
        </MovableBox>
      </Page>,
    );
  }
}
