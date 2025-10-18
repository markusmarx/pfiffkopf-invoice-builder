import { createXML, XMLElement } from "./xml";

export enum PaymentType{
  Undefined = 1,
  Transfer = 30,
  PayToBankAccount = 42,
  SEPATransfer = 58,
  SEPADirectDebit = 59
}

export interface PaymentMeans {
  id: PaymentType;
  paymentTerms?: string;
  reference?: string;
}
export interface NoPaymentMeans extends PaymentMeans {
  id: PaymentType.Undefined;
}
export interface TransferPaymentMeans extends PaymentMeans  {
  id: PaymentType.Transfer | PaymentType.PayToBankAccount;
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
  id: PaymentType.SEPATransfer;
  accountOwner: string;
  bic?: string;
  bankName?: string;
}
export interface SEPADirectDebitPaymentMeans extends SEPAPaymentMeans, CreditorReference, DirectDebitMandate {
  id: PaymentType.SEPADirectDebit;
  iban: string;
}
export interface CreditorReference{
  creditorIdentifier : string;
}
export interface DirectDebitMandate{
  mandateReference: string;
}
export function readStringOrNull(means: PaymentMeans, name: string){
  return (means as never)[name] as string;
}
function paymentTypeToHumanReadableString(type: PaymentType){
  switch (type){
    case PaymentType.Undefined:
      return "Undefiniert";
    case PaymentType.PayToBankAccount:
      return "Zahlung auf Bankkonto";
    case PaymentType.SEPADirectDebit:
      return "SEPA-Lastschrift";
    case PaymentType.SEPATransfer:
      return "SEPA-Überweisung";
    case PaymentType.Transfer:
      return "Überweisung";
    default:
      return "Unknown";
  }
}
export function generatePaymentXML(options: PaymentMeans){
    function parse() : (undefined | XMLElement)[]{
        switch(options.id){
            case PaymentType.Undefined:
                return [];
            case PaymentType.PayToBankAccount: case PaymentType.Transfer:
                { const dataTransferPaymentMeans = options as TransferPaymentMeans
                return [
                    createXML("ram:PayeePartyCreditorFinancialAccount", 
                        [
                            createXML("ram:IBANID", dataTransferPaymentMeans.accountAdress.iban),
                            createXML("ram:ProprietaryID", dataTransferPaymentMeans.accountAdress.bancAccountNumber),
                            createXML("ram:AccountName", dataTransferPaymentMeans.name)
                        ]
                    ),
                    createXML("ram:PayeeSpecifiedCreditorFinancialInstitution", [
                        createXML("ram:BICID", dataTransferPaymentMeans.bicOrSwift),
                        createXML("ram:Name", dataTransferPaymentMeans.bankName)
                    ])
                ]; }
            case PaymentType.SEPATransfer:
                { const dataSEPATransferPaymentMeans = options as SEPATransferPaymentMeans;
                return [
                    createXML("ram:PayeePartyCreditorFinancialAccount", 
                        [
                            createXML("ram:IBANID", dataSEPATransferPaymentMeans.iban),
                            createXML("ram:AccountName", dataSEPATransferPaymentMeans.accountOwner)
                        ]
                    ),
                    createXML("ram:PayeeSpecifiedCreditorFinancialInstitution", [
                        createXML("ram:BICID", dataSEPATransferPaymentMeans.bic),
                        createXML("ram:Name", dataSEPATransferPaymentMeans.bankName)
                    ])
                ]; }
            case PaymentType.SEPADirectDebit:
                { const data = options as SEPADirectDebitPaymentMeans;
                return [
                  createXML("ram:PayerPartyDebtorFinancialAccount", [
                    createXML("ram:IBANID", data.iban)
                  ])
                ]; }
        }
        return new Array(0);
    }
    return createXML('ram:SpecifiedTradeSettlementPaymentMeans', [
        createXML('ram:TypeCode', `${options.id}`),
        createXML("ram:Information", paymentTypeToHumanReadableString(options.id)),
        ...parse()
    ]);
}