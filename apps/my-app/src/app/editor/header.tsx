import React from 'react';
import {
  Group,
  Text,
  Button,
  rem,
  Box,
  Flex,
  Tooltip,
  ActionIcon,
  NumberInput,
  MantineProvider,
} from '@mantine/core';
import {
  IconDeviceFloppy,
  IconEye,
  IconUpload,
  IconFileText,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import {
  CountryCode,
  ElectronicAdressType,
  generateEInvoice,
  InvoiceType,
  NoPaymentMeans,
  SEPATransferPaymentMeans,
  TransferPaymentMeans,
  TaxType,
  Template,
  UnitCode,
  UstIdCounty,
  SEPADirectDebitPaymentMeans,
} from '@pfiffkopf-webapp-office/pfk-pdf';
import saveAs from 'file-saver';
import { InvoiceDataSet } from '../template/pfkInvoiceTemplate';

interface HeaderProps {
  burger?: React.ReactNode;
  isMobile?: boolean;
  currentPage: number;
  maxPages: number;
  setCurrentPage: (page: number) => unknown;
  template: Template;
}

const Header: React.FC<HeaderProps> = ({
  burger,
  isMobile,
  currentPage,
  maxPages,
  setCurrentPage,
  template,
}) => {
  return (
    <Box
      p={isMobile ? 'sm' : 'md'}
      style={{
        background: 'var(--mantine-color-gray-8)',
        color: 'white',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Group gap={isMobile ? 'sm' : 'md'}>
        {burger}
        <Box
          p={isMobile ? 'xs' : 'sm'}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: rem(8),
            backdropFilter: 'blur(10px)',
          }}
        >
          <IconFileText size={isMobile ? 20 : 24} />
        </Box>
        <Text
          size={isMobile ? 'lg' : 'xl'}
          fw={600}
          style={{ display: isMobile ? 'none' : 'block' }}
        >
          PDF Vorlagen Editor
        </Text>
        {isMobile && (
          <Text size="sm" fw={600}>
            PDF Editor
          </Text>
        )}
      </Group>

      <Group gap={isMobile ? 'xs' : 'md'}>
        {!isMobile ? (
          <>
            <Button
              variant="light"
              color="white"
              leftSection={<IconDeviceFloppy size={16} />}
              size={isMobile ? 'xs' : 'sm'}
              styles={{
                root: {
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                },
              }}
            >
              Speichern
            </Button>
            <Button
              variant="light"
              color="white"
              leftSection={<IconEye size={16} />}
              size={isMobile ? 'xs' : 'sm'}
              styles={{
                root: {
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                },
              }}
            >
              Vorschau
            </Button>
          </>
        ) : (
          <Button
            variant="light"
            color="white"
            size="xs"
            leftSection={<IconEye size={14} />}
            styles={{
              root: {
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
              },
            }}
          >
            Vorschau
          </Button>
        )}
        {maxPages !== 1 && (
          <>
            <Text size="sm" c="gray.6" fw={500}>
              Seite {currentPage} von {maxPages}
            </Text>
            <Flex gap="xs">
              <Button.Group>
                <Tooltip label="Erste Seite">
                  <ActionIcon
                    variant="light"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <IconChevronsLeft size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Vorherige Seite">
                  <ActionIcon
                    variant="light"
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <IconChevronLeft size={16} />
                  </ActionIcon>
                </Tooltip>
                <NumberInput
                  styles={{
                    input: {
                      textAlign: 'center',
                      width: 60,
                      borderRadius: 'var(--mantine-radius-sm)',
                    },
                  }}
                  variant="filled"
                  size="sm"
                  clampBehavior="strict"
                  min={1}
                  max={maxPages}
                  decimalScale={0}
                  hideControls
                  value={currentPage}
                  onValueChange={(v) =>
                    setCurrentPage(v.floatValue ? v.floatValue : 1)
                  }
                />
                <Tooltip label="Nächste Seite">
                  <ActionIcon
                    variant="light"
                    onClick={() =>
                      setCurrentPage(Math.min(currentPage + 1, maxPages))
                    }
                    disabled={currentPage === maxPages}
                  >
                    <IconChevronRight size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Letzte Seite">
                  <ActionIcon
                    variant="light"
                    onClick={() => setCurrentPage(maxPages)}
                    disabled={currentPage === maxPages}
                  >
                    <IconChevronsRight size={16} />
                  </ActionIcon>
                </Tooltip>
              </Button.Group>
            </Flex>
          </>
        )}
        <Button
          variant="filled"
          color="white"
          c="blue"
          leftSection={<IconUpload size={isMobile ? 14 : 16} />}
          size={isMobile ? 'xs' : 'sm'}
          styles={{
            root: {
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#667eea',
            },
          }}
          onClick={() => {
            const paymentDetails: SEPADirectDebitPaymentMeans = {
              id: 59,
              iban: "IBAN",
              mandateReference: "Mandatsreferenz",
              creditorIdentifier: "Creditor Identifier"
            };
            const data : InvoiceDataSet = new InvoiceDataSet("0000", new Date(Date.UTC(2003, 6, 18)), [{
              name: "Name",
              amount: 1,
              priceSingleUnit: 1,
              unit: UnitCode.minute,
              baseAmount: 1
            }], {
              id: {
                ustId: {ust: "0123456789", country: UstIdCounty.Germany}
              },
              adress: {
                street: "Straße 1",
                city: "Ort",
                country: CountryCode.DE,
                zip: "12345"
              },
              companyName: "Unternehmensname",
              contact: {
                name: "Name",
                mail: "mail@mail.de",
                telephone: "+49 30 1234567"
              },
              electronicAdress: {adress: "mail@mail.de", id: ElectronicAdressType.eMail}
            }, {
              electronicAdress: {adress: "mail@mail.de", id: ElectronicAdressType.eMail},
              companyName: "Name",
              adress: {
                street: "Straße 1",
                city: "Ort",
                zip: "12345",
                country: CountryCode.DE
              }

            }, paymentDetails);
            data.invoiceType = InvoiceType.invoice;
            data.dueDate = new Date(Date.UTC(2003, 6, 18));
            data.tax.tax = 0;
            data.tax.taxType = TaxType.zero_rated_goods;
            generateEInvoice({
              template: template,
              wrapper: (template) => {
                return <MantineProvider>{template}</MantineProvider>;
              },
              onFinishPDFCreation:
              {
                kind: "buffer",
                callback: (chunks) => {
                const blob = new Blob([chunks] as BlobPart[], {
                  type: 'application/pdf',
                });
                saveAs(blob, 'generierte Rechnung.pdf');
                }
              },
              data: data,
              pdfAData: {
                author: "Pfiffkopf",
                date: new Date(Date.now()),
                title: "Rechnung",
                version: 3,
                conformance: "B"
              }
            });
          }}
        >
          {isMobile ? 'Export' : 'Exportieren'}
        </Button>
      </Group>
    </Box>
  );
};

export default Header;