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
function xmlTag(
  name: string,
  value?: string,
  tags?: { tagName: string; tagValue: string }[],
) {
  if (!value) {
    return undefined;
  }
  return `<${name}${
    tags
      ? ' ' +
        tags
          .map((tag) => {
            return `${tag.tagName}=${tag.tagValue} `;
          })
          .join()
      : ''
  }>${value}</${name}>`;
}
export enum UstIdCounty {
  Germany = 'DE',
  Ukraine = 'UA',
}
export enum CountryCode {
  DE = 'DE',
  EN = 'EN',
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
  standard = 'S',
  k = 'K',
  ae = 'AE',
  e = 'E',
  g = 'G',
  l = 'L',
  m = 'M',
  o = 'O',
  z = 'Z',
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
export function countryCodeToHumanReadableString(code: CountryCode): string {
  switch (code) {
    case CountryCode.DE:
      return 'Deutschland';
    case CountryCode.EN:
      return 'England';
  }
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
export interface PaymentMeans {
  id: number;
  paymentTerms?: string;
}
export interface NoPaymentMeans extends PaymentMeans {
  id: 1;
  usage?: string;
}
export interface TransferPaymentMeans {
  id: 30 | 42;
  name: string;
  accountAdress: {
    iban?: string;
    bancAccountNumber?: string;
  };
  bicOrSwift: string;
  bankName?: string;
}
export interface SEPAPaymentMeans extends PaymentMeans {
  iban: string;
}
export interface SEPATransferPaymentMeans extends SEPAPaymentMeans {
  id: 58;
  accountOwner: string;
  bic?: string;
  bankName?: string;
  usage?: string;
}
export interface SEPADirectDebitPaymentMeans extends SEPAPaymentMeans {
  id: 59;
  iban: string;
  mandateReference: string;
  creditorIdentifier: string;
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

  const xmlTree = createXML(
    'rsm:CrossIndustryInvoice',
    [
      /*Document Context*/
      createXML('rsm:ExchangedDocumentContext', [
        createXML('ram:BusinessProcessSpecifiedDocumentContextParameter', [
          createXML('ram:Id', 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0'),
        ]),
        createXML('ram:GuidelineSpecifiedDocumentContextParameter', [
          createXML(
            'ram:Id',
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
            [['format', '102']],
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
                createXML('ram:ChargeAmount', pos.priceSingleUnit),
                createXML('ram:BasisQuantity', pos.baseAmount, [
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
                createXML('ram:ExemptionReason'), //TODO: For type Z
                createXML('ram:CategoryCode', options.data.tax.taxType),
                createXML('ram:RateApplicablePercent', options.data.tax.tax),
              ]),
              createXML('ram:BillingSpecifiedPeriod', [
                createXML('ram:StartDateTime', [
                  createXML('udt:DateTimeString', formatDate(pos.endDate), [
                    ['format', '102'],
                  ]),
                ]),
                createXML('ram:EndDateTime', [
                  createXML('udt:DateTimeString', formatDate(pos.endDate), [
                    ['format', '102'],
                  ]),
                ]),
              ]),
              createXML('ram:SpecifiedTradeSettlementLineMonetarySummation', [
                createXML(
                  'ram:LineTotalAmount',
                  (pos.amount / pos.baseAmount) * pos.priceSingleUnit,
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
            createXML('ram:SpecifiedTaxRegistration', [createXML("ram:ID", formatUSTId(options.data.supplyingParty.id.ustId?.country, options.data.supplyingParty.id.ustId?.ust))]),
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
            createXML('ram:SpecifiedTaxRegistration', [createXML("ram:ID", formatUSTId(options.data.receivingParty.ustId?.country, options.data.receivingParty.ustId?.ust))]),
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
          ]),
        ]),
        createXML(
          'ram:ApplicableHeaderTradeDelivery',
          options.data.deliveryDetails
            ? [
                createXML('ram:ActualDeliverySupplyChainEvent', [
                  createXML('rram:OccurrenceDateTime', [
                    createXML(
                      'udt:DateTimeString',
                      formatDate(options.data.derliveryDate),
                      [['format', '102']],
                    ),
                  ]),
                ]),
                createXML('ram:DespatchAdviceReferencedDocument', [
                  createXML('ram:IssuerAssignedID', options.data.shippingNotice?.id),
                ]),
                createXML('ram:ReceivingAdviceReferencedDocument', [
                  createXML('ram:IssuerAssignedID', options.data.goodsReceiptNotification?.id),
                ]),
              ]
            : [],
        ),
        createXML('ram:ApplicableHeaderTradeSettlement', [
          createXML('ram:PaymentReference', 'Verwendungszweck'),
          createXML('ram:InvoiceCurrencyCode', options.data.currency),
          createXML('ram:SpecifiedTradeSettlementPaymentMeans', [
            createXML('ram:TypeCode', `${options.data.paymentDetails.id}`),
          ]),
          createXML('ram:ApplicableTradeTax', [
            createXML('ram:CalculatedAmount', tax),
            createXML('ram:TypeCode', 'VAT'),
            createXML('ram:BasisAmount', sumWithoutTax),
            createXML('ram:CategoryCode', options.data.tax.taxType),
            createXML('ram:RateApplicablePercent', options.data.tax.tax), 
          ]),
          createXML('ram:BillingSpecifiedPeriod', [
            createXML('ram:StartDateTime', [
              createXML(
                'udt:DateTimeString',
                formatDate(options.data.billingPeriod?.from),
                [['format', '102']],
              ),
            ]),
            createXML('ram:EndDateTime', [
              createXML(
                'udt:DateTimeString',
                formatDate(options.data.billingPeriod?.to),
                [['format', '102']],
              ),
            ]),
          ]),
          createXML('ram:SpecifiedTradePaymentTerms', [
            createXML('ram:Description', 'Zahlungsziel*'),
            createXML('ram:DueDateDateTime', [
              createXML(
                'udt:DateTimeString',
                formatDate(options.data.dueDate),
                [['format', '102']],
              ),
            ]),
          ]),
          createXML('ram:SpecifiedTradeSettlementHeaderMonetarySummation', [
            createXML('ram:LineTotalAmount', sumWithoutTax),
            createXML('ram:TaxBasisTotalAmount', sumWithoutTax),
            createXML('ram:TaxTotalAmount', tax, [
              ['currencyID', options.data.currency],
            ]),
            createXML('ram:GrandTotalAmount', tax + sumWithoutTax),
            createXML('ram:DuePayableAmount', tax + sumWithoutTax),
          ]),
          ...(options.data.invoiceReference || []).map((el) =>
            createXML('ram:InvoiceReferencedDocument', [
              createXML('ram:IssuerAssignedID', el.id),
              createXML('ram:FormattedIssueDateTime', [
                createXML('qdt:DateTimeString', formatDate(el.date), [
                  ['format', '102'],
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
/*
<cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="EM">${options.data.accountingSupplierParty.mail}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID>${formatUSTId(options.data.accountingSupplierParty.ustId.country, options.data.accountingSupplierParty.ustId.ust)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${options.data.accountingSupplierParty.name}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${options.data.accountingSupplierParty.adress.street}</cbc:StreetName>
        <cbc:CityName>${options.data.accountingSupplierParty.adress.city}</cbc:CityName>
        <cbc:PostalZone>${options.data.accountingSupplierParty.adress.zip}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${options.data.accountingSupplierParty.adress.country}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${formatUSTId(options.data.accountingSupplierParty.ustId.country, options.data.accountingSupplierParty.ustId.ust)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      ${
        options.data.accountingSupplierParty.taxNr
          ? `      <cac:PartyTaxScheme>
        <cbc:CompanyID>${options.data.accountingSupplierParty.taxNr}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>FC</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ''
      }
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${options.data.accountingSupplierParty.legalName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Name>${options.data.accountingSupplierParty.contact.name}</cbc:Name>
        <cbc:Telephone>${options.data.accountingSupplierParty.contact.telephone}</cbc:Telephone>
        <cbc:ElectronicMail>${options.data.accountingSupplierParty.contact.mail}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:EndpointID schemeID="EM">${options.data.accountingCustomerParty.mail}</cbc:EndpointID>
      <cac:PartyName>
        <cbc:Name>${options.data.accountingCustomerParty.name}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${options.data.accountingCustomerParty.adress.street}</cbc:StreetName>
        <cbc:CityName>${options.data.accountingCustomerParty.adress.city}</cbc:CityName>
        <cbc:PostalZone>${options.data.accountingCustomerParty.adress.zip}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${options.data.accountingCustomerParty.adress.country}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${formatUSTId(options.data.accountingCustomerParty.ustId.country, options.data.accountingCustomerParty.ustId.ust)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${options.data.accountingCustomerParty.legalName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:Delivery>
    <cbc:ActualDeliveryDate>${formatDate(options.data.delivery.deliveryDate)}</cbc:ActualDeliveryDate>
    <cac:DeliveryLocation>
      <cac:Address>
        <cbc:CityName>${options.data.delivery.cityName}</cbc:CityName>
        <cbc:PostalZone>${options.data.delivery.zip}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${options.data.delivery.country}</cbc:IdentificationCode>
        </cac:Country>
      </cac:Address>
    </cac:DeliveryLocation>
  </cac:Delivery>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
    <cbc:PaymentID>${options.data.paymentMeans.usage}</cbc:PaymentID>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${options.data.paymentMeans.iban}</cbc:ID>
      <cbc:Name>${options.data.paymentMeans.accountOwner}</cbc:Name>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>${options.data.paymentMeans.bic}</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${tax}</cbc:TaxAmount>
    ${options.data.positions
      .map((line) => {
        const priceSum = line.priceSingleUnity * line.amount;
        return `    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">${priceSum}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">${(line.tax / 100) * priceSum}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${line.taxType || 'S'}</cbc:ID>
        <cbc:Percent>${line.tax}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
        `;
      })
      .join()}
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">1.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${sumWithoutTax}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR"${tax + sumWithoutTax}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="EUR">0.00</cbc:AllowanceTotalAmount>
    <cbc:ChargeTotalAmount currencyID="EUR">0.00</cbc:ChargeTotalAmount>
    <cbc:PrepaidAmount currencyID="EUR">${options.prepaid}</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="EUR">${toPay}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${options.data.positions8
    .map((line, idx) => {
      return `  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${line.unit}">${line.amount}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${line.amount * line.priceSingleUnity}</cbc:LineExtensionAmount>
    <cac:Item>
      ${
        line.detailDescription
          ? `<cbc:Description>${line.detailDescription}</cbc:Description>`
          : ''
      }
      <cbc:Name>${line.name}</cbc:Name>
      ${
        line.productNumber
          ? `      <cac:SellersItemIdentification>
        <cbc:ID>${line.productNumber}</cbc:ID>
      </cac:SellersItemIdentification>`
          : ''
      }
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${line.taxType || 'S'}</cbc:ID>
        <cbc:Percent>${line.tax}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="EUR">${line.priceSingleUnity}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
    })
    .join()}
return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  	<rsm:ExchangedDocumentContext>
		<ram:BusinessProcessSpecifiedDocumentContextParameter>
			<ram:ID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</ram:ID>
		</ram:BusinessProcessSpecifiedDocumentContextParameter>
		<ram:GuidelineSpecifiedDocumentContextParameter>
			<ram:ID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</ram:ID>
		</ram:GuidelineSpecifiedDocumentContextParameter>
	</rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
		${xmlTag('ram:ID', options.data.invoiceNr)}
		${xmlTag('ram:TypeCode', options.data.invoiceType)}
    ${xmlTag('ram:IssueDateTime', xmlTag('udt:DateTimeString', formatDate(options.data.invoiceDate), [{ tagName: 'format', tagValue: dateFormat }]))}
    ${xmlTag('ram:IncludedNote', xmlTag('ram:Content', options.data.remark)) || ''}
	</rsm:ExchangedDocument>
  ${xmlTag(
    'rsm:SupplyChainTradeTransaction',
    `${options.data.positions
      .map((line) => {
        return `${xmlTag(
          'ram:IncludedSupplyChainTradeLineItem',
          xmlTag('ram:AssociatedDocumentLineDocument'),
        )}`;
      })
      .join()}
     ${xmlTag(
       'ram:ApplicableHeaderTradeAgreement',
       `${
         xmlTag(
           'ram:SellerTradeParty',
           `${xmlTag('ram:ID', (options.data.supplyingParty.id.ustId ? formatUSTId(options.data.supplyingParty.id.ustId.country, options.data.supplyingParty.id.ustId.ust) : undefined) || options.data.supplyingParty.id.sellerIdentifier || options.data.supplyingParty.id.registerNumber || '')}
        ${xmlTag('ram:Name', options.data.supplyingParty.companyName)}
        ${xmlTag('ram:Description', options.data.supplyingParty.legalInformation)}
        ${xmlTag(
          'ram:SpecifiedLegalOrganization',
          `
          ${xmlTag('ram:ID', options.data.supplyingParty.id.registerNumber)}
          ${xmlTag('ram:TradingBusinessName', options.data.supplyingParty.tradingName)}
          `,
        )}
        ${generateContact(options.data.supplyingParty.contact)}
        ${generatePostalAdress(options.data.supplyingParty.adress)}
        ${generateElectronicAdress(options.data.supplyingParty.electronicAdress)}
        ${xmlTag('ram:SpecifiedTaxRegistration', xmlTag('ram:ID', options.data.supplyingParty.id.ustId ? formatUSTId(options.data.supplyingParty.id.ustId.country, options.data.supplyingParty.id.ustId.ust) : undefined, [{ tagName: 'schemeID', tagValue: 'VA' }]))}
        ${xmlTag('ram:SpecifiedTaxRegistration', xmlTag('ram:ID', options.data.supplyingParty.taxNumber, [{ tagName: 'schemeID', tagValue: 'FC' }]))}`,
         ) || ''
       }` +
         `${
           xmlTag(
             'ram:BuyerTradeParty',
             `${xmlTag('ram:ID')}
         ${xmlTag('ram:Name')}`,
           ) || ''
         }
         ${xmlTag('ram:SpecifiedLegalOrganization')}
         ${xmlTag('ram:DefinedTradeContact')}
         ${generatePostalAdress(options.data.receivingParty.adress)}
         ${generateElectronicAdress(options.data.receivingParty.electronicAdress)}
         ${xmlTag('ram:SpecifiedTaxRegistration')}` +
         `${xmlTag('ram:SellerOrderReferencedDocument', xmlTag('ram:IssuerAssignedID', options.data.jobNumber)) || ''}` +
         `${xmlTag('ram:BuyerOrderReferencedDocument', xmlTag('ram:IssuerAssignedID', options.data.orderNumber)) || ''}` +
         `${xmlTag('ram:ContractReferencedDocument', xmlTag('ram:IssuerAssignedID', options.data.contractNumber)) || ''}` +
         `${
           xmlTag(
             'ram:SpecifiedProcuringProject',
             (xmlTag('ram:ID', options.data.projectNumber) || '') +
               xmlTag('ram:Name', options.data.projectNumber ? '?' : ''),
           ) || ''
         }`,
     )}
     ${xmlTag('ram:ApplicableHeaderTradeDelivery', `Text`)}
     ${xmlTag('ram:ApplicableHeaderTradeSettlement', `Text`)}
`,
  )}
</rsm:CrossIndustryInvoice>
    `;
    */
