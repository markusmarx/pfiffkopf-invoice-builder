function formatDate(date?: Date): string | undefined {
  return date ? `${date.getFullYear()}${date.getMonth() + 1}${date.getDay() + 1}` : undefined;
}
function formatUSTId(county: UstIdCounty, id: string) {
  return `${county}${id}`;
}
function xmlTag(
  name: string,
  value?: string,
  tags?: { tagName: string; tagValue: string }[],
) {
  if(!value){
    return undefined;
  }
  return `<${name}${tags ? " "+tags
    .map((tag) => {
      return `${tag.tagName}=${tag.tagValue} `;
    })
    .join() : ''}>${value}</${name}>`;
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
  pices = "H87",
  single = "C62",
  percent = "P1",
  pachaule = "LS",

  minute = "MIN",
  hour= "HUR",
  day= "DAY",
  week= "WEE",
  month= "MON",
  year= "ANN",

  weight_g = "GRM",
  weight_kg = "KGM",
  weight_t = "TNE",

  centimeters = "CMT",
  meters = "MTR",
  kilometers = "KMT",

}
export function countryCodeToHumanReadableString(code: CountryCode) : string{
  switch(code){
    case CountryCode.DE:
      return "Deutschland";
    case CountryCode.EN:
      return "England"
  }
}
export function unitCodeToHumanReadableString(code: UnitCode) : string{
  switch (code){
    case UnitCode.centimeters:
      return "cm";
    case UnitCode.day:
      return "d";
    case UnitCode.kilometers:
      return "km";
    case UnitCode.hour:
      return "h";
    case UnitCode.meters:
      return "m";
    case UnitCode.minute:
      return "min"; 
    case UnitCode.month:
      return "m";
    case UnitCode.pachaule:
      return "Pauchale";
    case UnitCode.percent:
      return "%";
    case UnitCode.pices:
      return "Stück";
    case UnitCode.single:
      return "Einzel";
    case UnitCode.week:
      return "w";
    case UnitCode.weight_g:
      return "g";
    case UnitCode.weight_kg:
      return "kg";
    case UnitCode.weight_t:
      return "t";
    case UnitCode.year:
      return "y";
  }
}
type UstAmount = 0 | 7 | 10 | 13 | 17 | 20 | 19;
export interface InvoiceLine {
  productNumber?: string;
  name: string;
  amount: number;
  priceSingleUnit: number;
  detailDescription?: string;
  unit: UnitCode;
  taxType?: TaxType;
  tax: UstAmount;
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
export interface NoPaymentMeans extends PaymentMeans{
  id: 1,
  usage?: string
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
  invoice = "380", //Rechnung
  partialInvoice = "326", //Teilrechnung
  proformaInvoice = "325", //Proformarechnung
  creditNote = "381", //Gutschriftsanzeige
  debitNote = "383", //Belastungsanzeige
  invoiceCorrection = "384", //Rechnungskorrektur
  prepaymentInvoice = "386", //Vorauszahlungsrechnung
  rentalBill = "387", //Mietrechnung
  taxBill = "388", //Steuerrechnung
  selfBilledInvoice = "389", //selbst fakturierte Rechnung
  collectionInvoice = "393", //Inkasso Rechnung
  leasingInvoice = "394", //Leasingrechnung
  insuranceBill = "575", //Rechnung des Versicherers
  forwardingInvoice = "623", //Speditionsrechnung
  freightInvoice = "780", //Frachtrechnung
  partialInvoiceForConstructionWork = "875", //Teilrechnung für Bauleistungen
  partialFinalInvoiceForConstructionWork = "876", //Teilschlussrechnung für Bauleistungen
  finalInvoiceForConstructionWork = "877", //Schlussrechnung für Bauleistungen
  customsInvoice = "935", //Zollrechnung
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
  jobNumber?: string;
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
}
function generateContact(contact: Contact){
  return `${xmlTag("ram:DefinedTradeContact", 
    `${xmlTag("ram:PersonName", contact.name)}
    ${xmlTag("ram:TelephoneUniversalCommunication", xmlTag("ram:CompleteNumber", contact.telephone))}
    ${xmlTag("ram:EmailURIUniversalCommunication", xmlTag("ram:URIID", contact.mail))}`
  )
  }`;
}
function generatePostalAdress(adress: PostalAdress, title){
  return xmlTag(title, 
    `${xmlTag("ram:PostcodeCode", adress.zip)}
    ${xmlTag("ram:LineOne", adress.street)}
    ${xmlTag("ram:LineTwo", adress.street2) || ''}
    ${xmlTag("ram:CityName", adress.city)}
    ${xmlTag("ram:", adress.region) || ""}
    ${xmlTag("ram:CountryID", adress.country)}
    `
  )
}
function generateElectronicAdress(id: ElectronicAdress){
  return xmlTag("ram:URIUniversalCommunication", xmlTag("ram:URIID", id.adress, [{tagName: "schemeID", tagValue: id.id}]));
}
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
    tax += lineSum * (line.tax / 100);
  });
  const toPay = sumWithoutTax + tax - options.prepaid;
  const dateFormat = "102";
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
		${xmlTag("ram:ID", options.data.invoiceNr)}
		${xmlTag("ram:TypeCode", options.data.invoiceType)}
    ${xmlTag("ram:IssueDateTime", xmlTag("udt:DateTimeString", formatDate(options.data.invoiceDate), [{tagName: "format", tagValue: dateFormat}]))}
    ${xmlTag("ram:IncludedNote", xmlTag("ram:Content", options.data.remark))|| ""}
	</rsm:ExchangedDocument>
  ${xmlTag("rsm:SupplyChainTradeTransaction", 
    `${options.data.positions.map((line) => {
      return `${xmlTag("ram:IncludedSupplyChainTradeLineItem", 
        //item data
      )

      }`;
    }).join()}
     ${xmlTag("ram:ApplicableHeaderTradeAgreement", 
      `${xmlTag("ram:SellerTradeParty", 
       `${xmlTag("ram:ID", (options.data.supplyingParty.id.ustId ? formatUSTId(options.data.supplyingParty.id.ustId.country, options.data.supplyingParty.id.ustId.ust) : undefined) ||  options.data.supplyingParty.id.sellerIdentifier ||options.data.supplyingParty.id.registerNumber || '')}
        ${xmlTag("ram:Name", options.data.supplyingParty.companyName)}
        ${xmlTag("ram:Description", options.data.supplyingParty.legalInformation)}
        ${xmlTag("ram:SpecifiedLegalOrganization", `
          ${xmlTag("ram:ID", options.data.supplyingParty.id.registerNumber)}
          ${xmlTag("ram:TradingBusinessName", options.data.supplyingParty.tradingName)}
          `)}
        ${generateContact(options.data.supplyingParty.contact)}
        ${generatePostalAdress(options.data.supplyingParty.adress, "ram:PostalTradeAddress")}
        ${generateElectronicAdress(options.data.supplyingParty.electronicAdress)}
        ${xmlTag("ram:SpecifiedTaxRegistration", xmlTag("ram:ID", (options.data.supplyingParty.id.ustId ? formatUSTId(options.data.supplyingParty.id.ustId.country, options.data.supplyingParty.id.ustId.ust) : undefined),[{tagName: "schemeID", tagValue: "VA"}]))}
        ${xmlTag("ram:SpecifiedTaxRegistration", xmlTag("ram:ID", options.data.supplyingParty.taxNumber, [{tagName: "schemeID", tagValue: "FC"}]))}`
      )|| ''}` + 
      `${xmlTag("ram:BuyerTradeParty", 
        `${xmlTag("ram:ID", )}
         ${xmlTag("ram:Name", )}`)|| ''}
         ${xmlTag("ram:SpecifiedLegalOrganization", )}
         ${xmlTag("ram:DefinedTradeContact", )}
         ${generatePostalAdress(options.data.receivingParty.adress, "ram:PostalTradeAddress")}
         ${generateElectronicAdress(options.data.receivingParty.electronicAdress)}
         ${xmlTag("ram:SpecifiedTaxRegistration", )}` + 
      `${xmlTag("ram:SellerOrderReferencedDocument", xmlTag("ram:IssuerAssignedID", options.data.jobNumber)) || ''}` + 
      `${xmlTag("ram:BuyerOrderReferencedDocument", xmlTag("ram:IssuerAssignedID", options.data.orderNumber))|| ''}` + 
      `${xmlTag("ram:ContractReferencedDocument", xmlTag("ram:IssuerAssignedID", options.data.contractNumber))|| ''}` + 
      `${xmlTag("ram:SpecifiedProcuringProject", 
        (xmlTag("ram:ID", options.data.projectNumber) || '') +
        (xmlTag("ram:Name", options.data.projectNumber ? "?" : ''))
      )|| ''}`
    )}
     ${xmlTag("ram:ApplicableHeaderTradeDelivery", 
      `Text`
    )}
     ${xmlTag("ram:ApplicableHeaderTradeSettlement", 
      `Text`
    )}
`
  )}
</rsm:CrossIndustryInvoice>
    `;
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

    */