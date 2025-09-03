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
  BackgroundPDF,
  DataSet,
  TableRow,
} from '@pfiffkopf-webapp-office/pfk-pdf';
import { JSX } from 'react';
import { DocumentCategory } from './documentCategory';
import { RecipentCategory } from './recipentCategory';
import { InvoiceCategory } from './invoiceCategory';
import { TableCategory } from './tableCategory';
import { LogoCategory } from './logoCategory';

export class LogoSection extends TemplateTab {
  letterpaper: BackgroundPDF;
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
    this.letterpaper = new BackgroundPDF();
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
      { accessor: 'pos', label: 'Pos' },
      { accessor: 'description', label: 'Beschreibung' },
      { accessor: 'time', label: 'Dauer' },
      { accessor: 'single', label: 'Einzel' },
      { accessor: 'tax', label: 'Ust. %' },
      { accessor: 'sum', label: 'Gesamt' },
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
export interface InvoiceLine {
  pos: number;
  description: string;
  time: string;
  priceSingle: number;
  tax: number;
  sum: number;
}
export class InvoiceDataSet implements DataSet {
  author?: string;
  //adress block
  companyName?: string;
  name?: string;
  adressLine?: string;
  additionalAdressLine?: string;
  zip?: string;
  city?: string;
  //invoice
  invoiceNr?: string;
  invoiceDate?: string;
  serviceDateBeginn?: string;
  serviceDateEnd?: string;
  tableEntrys?: InvoiceLine[];
}
export class PfkInvoiceTemplate extends Template {
  letterpaper?: DocumentSection;
  address?: RecipentSection;
  table?: TableSection;
  invoice?: InvoiceSection;
  logo?: LogoSection;

  drawPaper(prop: TemplateDrawProperties): Array<JSX.Element> {
    const fontSize = `${(this.letterpaper?.fontSize || 1) * (4 / 3)}px`;
    let invoiceData: undefined | InvoiceDataSet = undefined;
    if (prop.dataset && prop.dataset instanceof InvoiceDataSet) {
      invoiceData = prop.dataset as InvoiceDataSet;
    }
    let tableSum = invoiceData?.tableEntrys ? 0 : 100;
    const tableData: TableRow[] = invoiceData?.tableEntrys
      ? invoiceData.tableEntrys.map((line) => {
          tableSum += line.sum;
          return {
            elements: [
              { label: line.pos.toFixed(0), accessor: 'pos' },
              { label: line.description, accessor: 'description' },
              { label: line.time, accessor: 'time' },
              {
                label: `${line.priceSingle.toFixed(2).replace('.', ',')}€`,
                accessor: 'single',
              },
              {
                label: `${line.tax.toFixed(2).replace('.', ',')}%`,
                accessor: 'tax',
              },
              {
                label: `${line.sum.toFixed(2).replace('.', ',')}€`,
                accessor: 'sum',
              },
            ],
            accessorControlled: true,
          };
        })
      : [
          {
            elements: [
              { label: '1', accessor: 'pos' },
              { label: 'Termin Beschreibung', accessor: 'description' },
              { label: '2 x 45 min', accessor: 'time' },
              { label: '50,00€', accessor: 'single' },
              { label: '0,00%', accessor: 'tax' },
              { label: '100,00€', accessor: 'sum' },
            ],
            accessorControlled: true,
          },
        ];
    /*tableData.push({
      elements: [
        { label: `${tableSum.toFixed(2).replace('.', ',')}€`, accessor: 'sum' },
        { label: 'Gesamtbetrag', accessor: 'description' },
      ],
      accessorControlled: true,
    });*/

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
        background={
          this.logo?.letterpaper.docAsImage ? this.logo.letterpaper : undefined
        }
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
            <b>{invoiceData?.companyName || 'Musterfirma'}</b>
          </Text>
          <Text style={{ fontSize: fontSize }}>
            <b>Etage 0815</b>
          </Text>
          <Text style={{ fontSize: fontSize }}>
            {invoiceData?.name || 'Maxime Muster'}
          </Text>
          <Text style={{ fontSize: fontSize }}>
            {invoiceData?.adressLine || 'Musterstraße 16'}
          </Text>
          <Text style={{ fontSize: fontSize }}>
            {invoiceData?.additionalAdressLine || ' - Zusatz - '}
          </Text>
          <Text style={{ fontSize: fontSize }}>
            {invoiceData?.zip || '01234'} {invoiceData?.city || 'Musterhausen'}
          </Text>
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
                <Text style={{ fontSize: fontSize }}>
                  {invoiceData?.invoiceNr || 'R2025-0001'}
                </Text>
                <Text style={{ fontSize: fontSize }}>
                  {invoiceData?.invoiceDate || '31.01.2025'}
                </Text>
                <Text style={{ fontSize: fontSize }}>
                  {invoiceData?.serviceDateBeginn || '01.01.2025'}
                </Text>
                <Text style={{ fontSize: fontSize }}>
                  bis {invoiceData?.serviceDateEnd || '31.01.2025'}
                </Text>
              </Stack>
            </Group>
          </Stack>
        </MovableBox>
        <MovableBox id={'salutation'} x={0} y={300} width={700} heigth={100}>
          <Text style={{ fontSize: fontSize }} fw={700}>
            Hallo {invoiceData?.name || 'Maxim Mustermann'},
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
          rows={tableData}
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
