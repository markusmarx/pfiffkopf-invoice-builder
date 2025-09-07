function formatDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay() + 1}`;
}
function formatUSTId(county: UstIdCounty, id: string) {
  return `${county}${id}`;
}
enum UstIdCounty {
  Germany = 'DE',
  Ukraine = 'UA',
}
enum CountryCode {
  DE = 'DE',
  EN = 'EN',
}
interface UstId {
  country: UstIdCounty;
  ust: string;
}
interface PostalAdress {
  street: string;
  city: string;
  zip: string;
  country: CountryCode;
}
interface Party {
  name: string;
  mail: string;
  taxNr?: string;
  adress: PostalAdress;
  ustId: UstId;
  legalName: string;
  contact: Contact;
}
enum TaxType {
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
enum UnitCode {
  zoll = 'C62',
}
type UstAmount = 0 | 7 | 10 | 13 | 17 | 20 | 19;
interface InvoiceLine {
  productNumber?: string;
  name: string;
  amount: number;
  priceSingleUnity: number;
  detailDescription?: string;
  unit: UnitCode;
  taxType?: TaxType;
  tax: UstAmount;
}
interface Contact {
  name: string;
  telephone: string;
  mail: string;
}
export function generateEInvoiceXML(options: {
    prepaid: number;
  data: {
    invoiceNr: string;
    issueDate: Date; //Ausstelldatum
    dueDate: Date; //Fälligkeitsdatum
    accountingSupplierParty: Party; //Rechnungssteller
    accountingCustomerParty: Party; //Empfänger
    invoiceLines: InvoiceLine[];
  };
}): string {
    let sumWithoutTax = 0;
    let tax = 0;
    options.data.invoiceLines.forEach((line) => {
        const lineSum = line.priceSingleUnity * line.amount;
        sumWithoutTax += lineSum;
        tax += lineSum * (line.tax / 100);
    });
    const toPay = sumWithoutTax + tax - options.prepaid;
    
  return `
    <?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cec="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${options.data.invoiceNr}</cbc:ID>
  <cbc:IssueDate>${formatDate(options.data.issueDate)}</cbc:IssueDate>
  <cbc:DueDate>${formatDate(options.data.dueDate)}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cbc:BuyerReference>Leitweg-ID</cbc:BuyerReference>
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
    <cbc:ActualDeliveryDate>2003-07-19</cbc:ActualDeliveryDate>
    <cac:DeliveryLocation>
      <cac:Address>
        <cbc:CityName>Empfänger-Ort</cbc:CityName>
        <cbc:PostalZone>Empfänger PLZ</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>DE</cbc:IdentificationCode>
        </cac:Country>
      </cac:Address>
    </cac:DeliveryLocation>
  </cac:Delivery>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
    <cbc:PaymentID>Verwendungszweck</cbc:PaymentID>
    <cac:PayeeFinancialAccount>
      <cbc:ID>IBAN</cbc:ID>
      <cbc:Name>Kontoinhaber</cbc:Name>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>BIC</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${tax}</cbc:TaxAmount>
    ${options.data.invoiceLines.map((line) => {
        const priceSum = line.priceSingleUnity * line.amount;
        return `    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">${priceSum}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">${(line.tax / 100) * priceSum}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${line.taxType || "S"}</cbc:ID>
        <cbc:Percent>${line.tax}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
        `;
    }).join()
    }
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">1.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${sumWithoutTax}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR"${tax+sumWithoutTax}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="EUR">0.00</cbc:AllowanceTotalAmount>
    <cbc:ChargeTotalAmount currencyID="EUR">0.00</cbc:ChargeTotalAmount>
    <cbc:PrepaidAmount currencyID="EUR">${options.prepaid}</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="EUR">${toPay}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${options.data.invoiceLines
    .map((line, idx) => {
      return `  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${line.unit}">${line.amount}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${line.amount * line.priceSingleUnity}</cbc:LineExtensionAmount>
    <cac:Item>
      ${line.detailDescription ? 
       `<cbc:Description>${line.detailDescription}</cbc:Description>`
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
        <cbc:ID>${line.taxType || "S"}</cbc:ID>
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

</Invoice>
    `;
}
