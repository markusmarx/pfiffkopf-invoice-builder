import { CountryCode } from './country_code';
import { generatePaymentXML, PaymentMeans, readStringOrNull } from './payment_means';
import { createXML, renderXML } from './xml';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
function formatDate(date?: Date): string | undefined {
  if (!date) {
    return undefined;
  }
  const month = date.getMonth() + 1;
  const day = date.getDay() + 1;
  return `${date.getFullYear()}${month < 10 ? `0${month}` : month}${day < 10 ? `0${day}` : day}`;
}
function formatUSTId(county: UstIdCounty| undefined, id: string | undefined) {
  if(county === undefined || id === undefined)
  {
    return undefined;
  }
  return `${county}${id}`;
}
export enum UstIdCounty {
  Germany = 'DE',
  Ukraine = 'UA',
}
export enum ElectronicAdressType {
  eMail = 'EM',
  asTwoExchange = 'AS',
  fileTransferProtocoll = 'AU',
  xFourHundredAdressForMail = 'AQ',
  germanLeitwegID = '9958',
}
export interface ElectronicAdress {
  id: ElectronicAdressType;
  adress: string;
}
export interface UstId {
  country: UstIdCounty;
  ust: string;
}
export interface PostalAdress {
  street: string;
  street2?: string;
  aditionalAdressLine?: string;
  city: string;
  zip: string;
  country: CountryCode;
  region?: string;
}
export interface PartySupplier {
  companyName: string;
  tradingName?: string;
  id: {
    sellerIdentifier?: string;
    registerNumber?: string;
    ustId?: UstId;
  };
  taxNumber?: string;
  weeeNumber?: string;
  legalInformation?: string; //for example Kleinunternehmerregelung
  electronicAdress: ElectronicAdress;
  adress: PostalAdress;
  contact: Contact;
}
export interface PartyRecipent {
  companyName: string;
  tradingName?: string;
  buyerIdentifier?: string;
  registerNumber?: string;
  ustId?: UstId;
  electronicAdress: ElectronicAdress;
  adress: PostalAdress;
  contact?: Contact;
}
export enum TaxType {
  standard = 'S', //19%
  export_no_tax = 'K',
  reverse_charge = 'AE',
  exemed = 'E', //UST free
  free_export = 'G',
  intra_community_supply = 'L',
  margin_scheme = 'M', //Differenzbesteuerung
  not_taxable = 'O',
  zero_rated_goods = 'Z', //Steuerfrei, aber steuerbarer Umsatz
  lower_rate = 'AA', //7%
  service_outside_scope = 'B'
}
export enum UnitCode {
  pices = 'H87',
  single = 'C62',
  percent = 'P1',
  pachaule = 'LS',

  minute = 'MIN',
  hour = 'HUR',
  day = 'DAY',
  week = 'WEE',
  month = 'MON',
  year = 'ANN',

  weight_g = 'GRM',
  weight_kg = 'KGM',
  weight_t = 'TNE',

  centimeters = 'CMT',
  meters = 'MTR',
  kilometers = 'KMT',
}
export function unitCodeToHumanReadableString(code: UnitCode): string {
  switch (code) {
    case UnitCode.centimeters:
      return 'cm';
    case UnitCode.day:
      return 'd';
    case UnitCode.kilometers:
      return 'km';
    case UnitCode.hour:
      return 'h';
    case UnitCode.meters:
      return 'm';
    case UnitCode.minute:
      return 'min';
    case UnitCode.month:
      return 'm';
    case UnitCode.pachaule:
      return 'Pauchale';
    case UnitCode.percent:
      return '%';
    case UnitCode.pices:
      return 'Stück';
    case UnitCode.single:
      return 'Einzel';
    case UnitCode.week:
      return 'w';
    case UnitCode.weight_g:
      return 'g';
    case UnitCode.weight_kg:
      return 'kg';
    case UnitCode.weight_t:
      return 't';
    case UnitCode.year:
      return 'y';
  }
}
type UstAmount = 0 | 7 | 10 | 13 | 17 | 20 | 19;
export interface InvoiceLine {
  productNumber?: string;
  buyerProductNumber?: string;
  name: string;
  amount: number;
  baseAmount: number;
  priceSingleUnit: number;
  detailDescription?: string;
  unit: UnitCode;
  position?: string;
  startDate?: Date;
  endDate?: Date;
  objectReferences?: string[];
  //netto = amount/baseamount * priceSingleUnit
  //tax = (tax / 100) * netto
  //brutto = netto+tax
}
export interface Delivery {
  receiverName: string;
  receiverLocation: string;
  adress: PostalAdress;
}
export interface Contact {
  name: string;
  telephone: string;
  mail: string;
}

export enum InvoiceType {
  invoice = '380', //Rechnung
  partialInvoice = '326', //Teilrechnung
  proformaInvoice = '325', //Proformarechnung
  creditNote = '381', //Gutschriftsanzeige
  debitNote = '383', //Belastungsanzeige
  invoiceCorrection = '384', //Rechnungskorrektur
  prepaymentInvoice = '386', //Vorauszahlungsrechnung
  rentalBill = '387', //Mietrechnung
  taxBill = '388', //Steuerrechnung
  selfBilledInvoice = '389', //selbst fakturierte Rechnung
  collectionInvoice = '393', //Inkasso Rechnung
  leasingInvoice = '394', //Leasingrechnung
  insuranceBill = '575', //Rechnung des Versicherers
  forwardingInvoice = '623', //Speditionsrechnung
  freightInvoice = '780', //Frachtrechnung
  partialInvoiceForConstructionWork = '875', //Teilrechnung für Bauleistungen
  partialFinalInvoiceForConstructionWork = '876', //Teilschlussrechnung für Bauleistungen
  finalInvoiceForConstructionWork = '877', //Schlussrechnung für Bauleistungen
  customsInvoice = '935', //Zollrechnung
}
export enum CurrencyType {
  euro = 'EUR',
}
export enum BookingAccountType {
  financial = 1,
  subsidary = 2,
  budget = 3,
  costAccount = 4,
  receivable = 5,
  payable = 6,
  jobCostAccounting = 7,
}
export interface EInvoice {
  invoiceNr: string;
  invoiceDate: Date;
  invoiceType: InvoiceType;
  currency: CurrencyType;
  dueDate?: Date; //Fälligkeitsdatum
  derliveryDate?: Date; //Leistungs-/Lieferdatum
  billingPeriod?: { from: Date; to: Date };
  buyerReference?: string; //Required for authorities
  projectNumber?: string;
  contractNumber?: string;
  orderNumber?: string;
  jobNumber?: string; //Auftragsnummer
  goodsReceiptNotification?: { id: string; date: Date };
  shippingNotice?: { id: string; date: Date };
  tender?: string | string[]; //Auch Los
  objectReference?: string | string[]; //Objektreferenz
  buyerBookingAccount?: { id: string; type: BookingAccountType }[];
  invoiceReference?: { id: string; date: Date }[];
  remark?: string;
  supplyingParty: PartySupplier;
  receivingParty: PartyRecipent;
  paymentDetails: PaymentMeans;
  deliveryDetails?: Delivery;
  positions: InvoiceLine[];
  tax: {
    taxType: TaxType,
    tax: UstAmount
  }
}
function generateContact(contact: Contact | undefined) {
  if (!contact) {
    return undefined;
  }
  return createXML('ram:DefinedTradeContact', [
    createXML('ram:PersonName', contact.name),
    createXML('ram:TelephoneUniversalCommunication', [
      createXML('ram:CompleteNumber', contact.telephone),
    ]),
    createXML('ram:EmailURIUniversalCommunication', [
      createXML('ram:URIID', contact.mail),
    ]),
  ]);
}
function generatePostalAdress(adress: PostalAdress) {
  return createXML('ram:PostalTradeAddress', [
    createXML('ram:PostcodeCode', adress.zip),
    createXML('ram:LineOne', adress.street),
    createXML('ram:LineTwo', adress.street2),
    createXML('ram:CityName', adress.city),
    createXML('ram:', adress.region),
    createXML('ram:CountryID', adress.country),
  ]);
}
function generateElectronicAdress(id: ElectronicAdress) {
  return createXML('ram:URIUniversalCommunication', [
    createXML('ram:URIID', id.adress, [['schemeID', id.id]]),
  ]);
}
function formatNumber(number: number | undefined) : string | undefined{
  if(number === undefined)
    return undefined;
  return number.toFixed(2);
}
/* XML*/
export function generateEInvoiceXML(options: {
  prepaid: number;
  data: EInvoice;
}): string {
  if (options.data.positions.length < 1) {
    throw 'Invoice needs to have atleast 1 position';
  }

  let sumWithoutTax = 0;
  let tax = 0;
  options.data.positions.forEach((line) => {
    const lineSum = line.priceSingleUnit * line.amount;
    sumWithoutTax += lineSum;
    tax += lineSum * (options.data.tax.tax / 100);
  });
  const toPay = sumWithoutTax + tax - options.prepaid;
  const dateFormat = '102';
  console.log(options.data.tax.tax);
  const xmlTree = createXML(
    'rsm:CrossIndustryInvoice',
    [
      /*Document Context*/
      createXML('rsm:ExchangedDocumentContext', [
        createXML('ram:BusinessProcessSpecifiedDocumentContextParameter', [
          createXML('ram:ID', 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'),
        ]),
        createXML('ram:GuidelineSpecifiedDocumentContextParameter', [
          createXML(
            'ram:ID',
            'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0',
          ),
        ]),
      ]),
      /*Basic Document data (id, date, type, note)*/
      createXML('rsm:ExchangedDocument', [
        createXML('ram:ID', options.data.invoiceNr),
        createXML('ram:TypeCode', options.data.invoiceType),
        createXML('ram:IssueDateTime', [
          createXML(
            'udt:DateTimeString',
            formatDate(options.data.invoiceDate),
            [['format', dateFormat]],
          ),
        ]),
        createXML('ram:IncludedNote', [
          createXML('ram:Content', options.data.remark),
        ]),
      ]),
      /*Actual Invoice */
      /*Invoice positions*/
      createXML('rsm:SupplyChainTradeTransaction', [
        ...options.data.positions.map((pos, idx) => {
          return createXML('ram:IncludedSupplyChainTradeLineItem', [
            createXML('ram:AssociatedDocumentLineDocument', [
              createXML('ram:LineID', `${idx + 1}`),
            ]),
            createXML('ram:SpecifiedTradeProduct', [
              createXML('ram:SellerAssignedID', pos.productNumber),
              createXML('ram:BuyerAssignedID', pos.buyerProductNumber),
              createXML('ram:Name', pos.name),
              createXML('ram:Description', pos.detailDescription),
            ]),
            createXML('ram:SpecifiedLineTradeAgreement', [
              createXML('ram:BuyerOrderReferencedDocument', pos.position),
              createXML('ram:NetPriceProductTradePrice', [
                createXML('ram:ChargeAmount', formatNumber(pos.priceSingleUnit)),
                createXML('ram:BasisQuantity', formatNumber(pos.baseAmount), [
                  ['unitCode', pos.unit],
                ]),
              ]),
            ]),
            createXML('ram:SpecifiedLineTradeDelivery', [
              createXML('ram:BilledQuantity', pos.amount, [
                ['unitCode', pos.unit],
              ]),
            ]),
            createXML('ram:SpecifiedLineTradeSettlement', [
              createXML('ram:ApplicableTradeTax', [
                createXML('ram:TypeCode', 'VAT'),
                createXML('ram:ExemptionReason'), //TODO: Not required but nice to have
                createXML('ram:CategoryCode', options.data.tax.taxType),
                createXML('ram:RateApplicablePercent', options.data.tax.tax || "0"),
              ]),
              createXML('ram:BillingSpecifiedPeriod', [
                createXML('ram:StartDateTime', [
                  createXML('udt:DateTimeString', formatDate(pos.endDate), [
                    ['format', dateFormat],
                  ]),
                ]),
                createXML('ram:EndDateTime', [
                  createXML('udt:DateTimeString', formatDate(pos.endDate), [
                    ['format', dateFormat],
                  ]),
                ]),
              ]),
              createXML('ram:SpecifiedTradeSettlementLineMonetarySummation', [
                createXML(
                  'ram:LineTotalAmount',
                  formatNumber((pos.amount / pos.baseAmount) * pos.priceSingleUnit),
                ),
              ]),
            ]),
            ...(pos.objectReferences || []).map((reference) =>
              createXML('ram:AdditionalReferencedDocument', [
                createXML('ram:IssuerAssignedID', reference),
                createXML('ram:TypeCode', '130'),
              ]),
            ),
          ]);
        }),
        createXML('ram:ApplicableHeaderTradeAgreement', [
          //Seller
          createXML("ram:BuyerReference", options.data.buyerReference || "0"),
          createXML('ram:SellerTradeParty', [
            createXML('ram:ID', options.data.supplyingParty.id.sellerIdentifier),
            createXML('ram:Name', options.data.supplyingParty.companyName),
            createXML('ram:SpecifiedLegalOrganization', [
              createXML(
                'ram:TradingBusinessName',
                options.data.supplyingParty.tradingName,
              ),
              createXML("ram:ID", options.data.supplyingParty.id.registerNumber)
            ]),
            createXML('ram:Description'),
            generateContact(options.data.supplyingParty.contact),
            generatePostalAdress(options.data.supplyingParty.adress),
            generateElectronicAdress(
              options.data.supplyingParty.electronicAdress,
            ),
            createXML('ram:SpecifiedTaxRegistration', [createXML("ram:ID", formatUSTId(options.data.supplyingParty.id.ustId?.country, options.data.supplyingParty.id.ustId?.ust), [["schemeID", "VA"]])]),
          ]),
          //Buyer
          createXML('ram:BuyerTradeParty', [
            createXML('ram:Name', options.data.receivingParty.companyName),
            createXML('ram:SpecifiedLegalOrganization', [
              createXML(
                'ram:TradingBusinessName',
                options.data.receivingParty.tradingName,
              ),
              createXML("ram:ID", options.data.receivingParty.registerNumber)
            ]),
            generateContact(options.data.receivingParty.contact),
            generatePostalAdress(options.data.receivingParty.adress),
            generateElectronicAdress(
              options.data.receivingParty.electronicAdress,
            ),
            createXML('ram:SpecifiedTaxRegistration', [createXML("ram:ID", formatUSTId(options.data.receivingParty.ustId?.country, options.data.receivingParty.ustId?.ust), [["schemeID", "VA"]])]),
          ]),
          createXML('ram:SellerOrderReferencedDocument', [
            createXML('ram:IssuerAssignedID', options.data.jobNumber),
          ]),
          createXML('ram:BuyerOrderReferencedDocument', [
            createXML('ram:IssuerAssignedID', options.data.orderNumber),
          ]),
          createXML('ram:ContractReferencedDocument', [
            createXML('ram:IssuerAssignedID', options.data.contractNumber),
          ]),
          createXML('ram:SpecifiedProcuringProject', [
            createXML('ram:ID',  options.data.projectNumber),
            createXML('ram:Name', '?'),
          ], [], 2),
        ]),
        createXML(
          'ram:ApplicableHeaderTradeDelivery',
           [
                createXML('ram:ActualDeliverySupplyChainEvent', [
                  createXML('rram:OccurrenceDateTime', [
                    createXML(
                      'udt:DateTimeString',
                      formatDate(options.data.derliveryDate),
                      [['format', dateFormat]],
                    ),
                  ]),
                ]),
                createXML('ram:DespatchAdviceReferencedDocument', [
                  createXML('ram:IssuerAssignedID', options.data.shippingNotice?.id),
                ]),
                createXML('ram:ReceivingAdviceReferencedDocument', [
                  createXML('ram:IssuerAssignedID', options.data.goodsReceiptNotification?.id),
                ]),
              ],
        ) || {
          id: "ram:ApplicableHeaderTradeDelivery",
          childs: [],
          forceKeep: true
        },
        createXML('ram:ApplicableHeaderTradeSettlement', [
          createXML("ram:CreditorReferenceID",  readStringOrNull(options.data.paymentDetails, "creditorIdentifier")), 
          createXML('ram:PaymentReference', readStringOrNull(options.data.paymentDetails, "reference")),
          createXML('ram:InvoiceCurrencyCode', options.data.currency),
          generatePaymentXML(options.data.paymentDetails),
          createXML('ram:ApplicableTradeTax', [
            createXML('ram:CalculatedAmount', formatNumber(tax)),
            createXML('ram:TypeCode', 'VAT'),
            createXML('ram:BasisAmount', formatNumber(sumWithoutTax)),
            createXML('ram:CategoryCode', options.data.tax.taxType),
            createXML('ram:RateApplicablePercent', options.data.tax.tax || "0"), 
          ]),
          createXML('ram:BillingSpecifiedPeriod', [
            createXML('ram:StartDateTime', [
              createXML(
                'udt:DateTimeString',
                formatDate(options.data.billingPeriod?.from),
                [['format', dateFormat]],
              ),
            ]),
            createXML('ram:EndDateTime', [
              createXML(
                'udt:DateTimeString',
                formatDate(options.data.billingPeriod?.to),
                [['format', dateFormat]],
              ),
            ]),
          ]),
          createXML('ram:SpecifiedTradePaymentTerms', [
            createXML('ram:Description', readStringOrNull(options.data.paymentDetails, "paymentTerms")), //TODO
            createXML("ram:DirectDebitMandateID", readStringOrNull(options.data.paymentDetails, "mandateReference")),
            createXML('ram:DueDateDateTime', [
              createXML(
                'udt:DateTimeString',
                formatDate(options.data.dueDate),
                [['format', dateFormat]],
              ),
            ]),
          ]),
          createXML('ram:SpecifiedTradeSettlementHeaderMonetarySummation', [
            createXML('ram:LineTotalAmount', formatNumber(sumWithoutTax)),
            createXML('ram:TaxBasisTotalAmount', formatNumber(sumWithoutTax)),
            createXML('ram:TaxTotalAmount', formatNumber(tax), [
              ['currencyID', options.data.currency],
            ]),
            createXML('ram:GrandTotalAmount', formatNumber(tax + sumWithoutTax)),
            createXML('ram:DuePayableAmount', formatNumber(tax + sumWithoutTax)),
          ]),
          ...(options.data.invoiceReference || []).map((el) =>
            createXML('ram:InvoiceReferencedDocument', [
              createXML('ram:IssuerAssignedID', el.id),
              createXML('ram:FormattedIssueDateTime', [
                createXML('qdt:DateTimeString', formatDate(el.date), [
                  ['format', dateFormat],
                ]),
              ]),
            ]),
          ),
          ...(options.data.buyerBookingAccount || []).map((el) =>
            createXML('ram:ReceivableSpecifiedTradeAccountingAccount', [
              createXML('ram:ID', el.id),
              createXML('ram:TypeCode', `${el.type}`),
            ]),
          ),
        ]),
      ]),
    ],
    [
      [
        'xmlns:rsm',
        'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
      ],
      [
        'xmlns:qdt',
        'urn:un:unece:uncefact:data:standard:QualifiedDataType:100',
      ],
      [
        'xmlns:ram',
        'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
      ],
      [
        'xmlns:udt',
        'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100',
      ],
    ],
  );
  return renderXML(xmlTree);
}