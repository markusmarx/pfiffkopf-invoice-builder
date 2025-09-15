/* eslint-disable react/jsx-no-useless-fragment */
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
  unitCodeToHumanReadableString,
  UnitCode,
  countryCodeToHumanReadableString,
} from '@pfiffkopf-webapp-office/pfk-pdf';
import { JSX, useRef } from 'react';
import { DocumentCategory } from './documentCategory';
import { RecipentCategory } from './recipentCategory';
import { InvoiceCategory } from './invoiceCategory';
import { TableCategory } from './tableCategory';
import { LogoCategory } from './logoCategory';
import {
  BookingAccountType,
  Contact,
  CurrencyType,
  Delivery,
  EInvoice,
  ElectronicAdress,
  InvoiceLine,
  InvoiceType,
  PartyRecipent,
  PartySupplier,
  PaymentMeans,
  PostalAdress,
  UstId,
} from '@pfiffkopf-webapp-office/pfk-pdf';

export class LogoSection extends TemplateTab {
  letterpaper: BackgroundPDF;
  positionLogo: DragVector;
  sizeLogo: DragVector;
  logo?: string; //base64image
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
    this.positionLogo = new DragVector(0, 0);
    this.sizeLogo = new DragVector(100, 100);
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
      { accessor: 'amount', label: 'Menge' },
      { accessor: 'unit', label: 'Einheit' },
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
export class InvoiceDataSet implements DataSet, EInvoice {
  invoiceNr: string;
  invoiceDate: Date;
  invoiceType: InvoiceType;
  currency: CurrencyType;
  dueDate?: Date | undefined;
  derliveryDate?: Date | undefined;
  billingPeriod?: { from: Date; to: Date } | undefined;
  buyerReference?: string | undefined;
  projectNumber?: string | undefined;
  contractNumber?: string | undefined;
  orderNumber?: string | undefined;
  jobNumber?: string | undefined;
  goodsReceiptNotification?: { id: string; date: Date } | undefined;
  shippingNotice?: { id: string; date: Date } | undefined;
  tender?: string | string[] | undefined;
  objectReference?: string | string[] | undefined;
  buyerBookingAccount?: { id: string; type: BookingAccountType }[] | undefined;
  invoiceReference?: { id: string; date: Date }[] | undefined;
  remark?: string | undefined;
  supplyingParty: PartySupplier;
  receivingParty: PartyRecipent;
  paymentDetails: PaymentMeans;
  deliveryDetails?: Delivery | undefined;
  positions: InvoiceLine[];
  author?: string;
  constructor(
    invoiceNr: string,
    invoiceDate: Date,
    positions: InvoiceLine[],
    company: {
      adress: PostalAdress;
      id: {
        sellerIdentifier?: string;
        registerNumber?: string;
        ustId?: UstId;
      };
      companyName: string;
      contact: Contact;
      electronicAdress: ElectronicAdress;
    },
    receiver: {
      electronicAdress: ElectronicAdress;
      companyName: string;
      adress: PostalAdress;
    },
    paymentDetails: PaymentMeans,
  ) {
    this.invoiceNr = invoiceNr;
    this.invoiceDate = invoiceDate;
    this.invoiceType = InvoiceType.invoice;
    this.currency = CurrencyType.euro;
    this.supplyingParty = company;
    this.receivingParty = receiver;
    this.positions = positions;
    this.paymentDetails = paymentDetails;
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
    let invoiceData: undefined | InvoiceDataSet = undefined;
    if (prop.dataset && prop.dataset instanceof InvoiceDataSet) {
      invoiceData = prop.dataset as InvoiceDataSet;
    }
    let sumNoTax = invoiceData?.positions ? 0 : 100;
    let taxSum = 0;
    const tableData: TableRow[] = invoiceData?.positions
      ? invoiceData.positions.map((line, idx) => {
          const sumPositionWithoutTax = line.amount * line.priceSingleUnit;
          taxSum += sumPositionWithoutTax * (line.tax / 100);
          sumNoTax += sumPositionWithoutTax;
          return {
            elements: [
              {
                label: (idx + 1).toFixed(0),
                accessor: 'pos',
                style: { textAlign: 'center' },
              },
              {
                label: line.detailDescription || '',
                accessor: 'description',
                style: { textAlign: 'start' },
              },
              {
                label: unitCodeToHumanReadableString(line.unit),
                accessor: 'unit',
              },
              { label: line.amount.toFixed(), accessor: 'amount' },
              {
                label: `${line.priceSingleUnit.toFixed(2).replace('.', ',')}€`,
                accessor: 'single',
              },
              {
                label: `${line.tax.toFixed(2).replace('.', ',')}%`,
                accessor: 'tax',
              },
              {
                label: `${sumPositionWithoutTax.toFixed(2).replace('.', ',')}€`,
                accessor: 'sum',
              },
            ],
            accessorControlled: true,
          };
        })
      : [
          {
            elements: [
              { label: '1', accessor: 'pos', style: { textAlign: 'center' } },
              {
                label: 'Termin Beschreibung',
                accessor: 'description',
                style: { textAlign: 'start' },
              },
              {
                label: unitCodeToHumanReadableString(UnitCode.hour),
                accessor: 'unit',
              },
              { label: '2', accessor: 'amount' },
              { label: '50,00€', accessor: 'single' },
              { label: '0,00%', accessor: 'tax' },
              { label: '100,00€', accessor: 'sum' },
            ],
            accessorControlled: true,
          },
        ];
    tableData.push(
      {
        elements: [
          {
            label: 'Zwischensumme (netto)',
            colSpawn: (this.table?.table.visibleTableCells().length || 0) - 1,
            style: { borderBottom: '0px', textAlign: 'start' },
          },
          {
            label: `${sumNoTax.toFixed(2).replace('.', ',')}€`,
            style: { borderBottom: '0px' },
          },
        ],
        accessorControlled: false,
      },
      {
        elements: [
          {
            label: 'Umsatzsteuersumme',
            colSpawn: (this.table?.table.visibleTableCells().length || 0) - 1,
            style: {
              borderTop: '0px',
              borderBottom: '0px',
              textAlign: 'start',
            },
          },
          {
            label: `${taxSum.toFixed(2).replace('.', ',')}€`,
            style: { borderTop: '0px', borderBottom: '0px' },
          },
        ],
        accessorControlled: false,
      },
      {
        elements: [
          {
            label: 'Gesamtbetrag',
            colSpawn: (this.table?.table.visibleTableCells().length || 0) - 1,
            style: {
              borderTop: '0px',
              textAlign: 'start',
              fontWeight: 'bold',
              verticalAlign: 'bottom',
            },
          },
          {
            label: `${(sumNoTax + taxSum).toFixed(2).replace('.', ',')}€`,
            style: {
              borderTop: '0px',
              fontWeight: 'bold',
              height: '30px',
              verticalAlign: 'bottom',
            },
          },
        ],
        accessorControlled: false,
      },
    );
    function formatDate(date: Date | undefined) {
      return date
        ? `${date.getDay() + 1}.${date.getMonth() + 1}.${date.getFullYear()}`
        : undefined;
    }

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
            <b>{invoiceData?.receivingParty.companyName || 'Musterfirma'}</b>
          </Text>
          <Text style={{ fontSize: fontSize }}>
            <b>Etage 0815</b>
          </Text>
          <Text style={{ fontSize: fontSize }}>{'Maxime Muster'}</Text>
          <Text style={{ fontSize: fontSize }}>
            {invoiceData?.receivingParty.adress.street || 'Musterstraße 16'}
          </Text>
          <Text style={{ fontSize: fontSize }}>
            {invoiceData?.receivingParty.adress.street2 || ' - Zusatz - '}
          </Text>
          <Text style={{ fontSize: fontSize }}>
            {invoiceData?.receivingParty.adress.zip || '01234'}{' '}
            {invoiceData?.receivingParty.adress.city || 'Musterhausen'}
          </Text>
          {invoiceData?.receivingParty.adress.country &&
            invoiceData.receivingParty.adress.country !==
              invoiceData.supplyingParty.adress.country && (
              <Text style={{ fontSize: fontSize }}>
                {countryCodeToHumanReadableString(
                  invoiceData.receivingParty.adress.country,
                )}
              </Text>
            )}
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
                  {formatDate(invoiceData?.invoiceDate) || '31.01.2025'}
                </Text>
                <Text style={{ fontSize: fontSize }}>
                  {formatDate(invoiceData?.billingPeriod?.from) || '01.01.2025'}
                </Text>
                <Text style={{ fontSize: fontSize }}>
                  bis{' '}
                  {formatDate(invoiceData?.billingPeriod?.to) || '31.01.2025'}
                </Text>
              </Stack>
            </Group>
          </Stack>
        </MovableBox>
        <div style={{ top: `3cm`, position: 'relative' }}>
          <Text style={{ fontSize: fontSize }} fw={700}>
            Hallo{' '}
            {invoiceData?.receivingParty.companyName || 'Maxim Mustermann'},
          </Text>
          <Text style={{ fontSize: fontSize }}>
            ich erlaube mir eine Rechnung für folgende Leistungen zu stellen.
          </Text>
          <br />
          <br />
          <MovableTable
            className="table"
            enabled={prop.currentTab === 'table'}
            template={this}
            templateTab={this.table}
            width={this.table?.size.x}
            heigth={this.table?.size.y}
            id="table"
            enableResizing={false}
            cellStyle={{
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderLeft: '1px solid',
              borderRight: '1px solid',
              fontSize: fontSize,
              textAlign: 'end',
            }}
            headerStyle={{
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderLeft: '1px solid',
              borderRight: '1px solid',
              fontSize: fontSize,
            }}
            disableMovement={true}
            {...(this.table?.table.dynamicTable() || { header: [] })}
            rows={tableData}
            insertIntoDocumentFlow={true}
          />
          <br />
          <br />
          <br />
          <Text style={{ fontSize: fontSize }}>
            Vielen Dank für die gute Zusammenarbeit!
          </Text>
        </div>
        <>
          {this.logo?.logo && (
            <MovableBox
              template={this}
              enableResizing={true}
              templateTab={this.logo}
              enabled={prop.currentTab === 'logo'}
              id="logo"
              {...this.logo.positionLogo.dragPos()}
              {...this.logo.sizeLogo.dragSize()}
            >
              <img alt="logo" src={this.logo.logo} width="100%" height="100%" />
            </MovableBox>
          )}
        </>
      </Page>,
    );
  }
}
