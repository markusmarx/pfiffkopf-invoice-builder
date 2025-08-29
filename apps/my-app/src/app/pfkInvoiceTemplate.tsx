import {
  Button,
  Center,
  ColorInput,
  FileInput,
  Flex,
  Grid,
  Group,
  Modal,
  ModalHeader,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
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
import React, { JSX, useState } from 'react';
import DragVectorInput from './template_components/dragVectorInput/dragVectorInput';
import { TableDataInput } from './template_components/tableDataInput/tableDataInput';
import { FontSelectorUI } from './template_components/fontSelector/fontSelector';
import {
  IconFile,
  IconMail,
  IconPalette,
  IconPencil,
} from '@tabler/icons-react';
import * as pdfjsLib from 'pdfjs-dist';

function LogoUI(properties: {
  properties: TemplateTabDrawProperties;
  this: LogoSection;
}) {
  const spacing = properties.properties.isMobile ? 'sm' : 'lg';
  const paperPadding = properties.properties.isMobile ? 'md' : 'lg';
  const [isLoading, setIsLoading] = useState(false);
  const [imgagesToChoseFrom, setImagesToChoseFrom] = useState<string[]| undefined>();
  const [imageSelection, setImageSelection] = useState(-1);
  return (
    <Stack gap={spacing} p={properties.properties.isMobile ? 'sm' : 'md'}>
      {/*Background selection*/}
      <Modal
        opened={(imgagesToChoseFrom || []).length > 0}
        onClose={() => {
          //
        }}
        size={"100%"}
      >
        <Stack>
          <Center>
            <Title>Briefpapier</Title>
          </Center>
            <Center><Text>Wähle eine Seite als Briefpapier aus.</Text></Center>
            <ScrollArea>
              <Flex>
              {
                imgagesToChoseFrom?.map((img, idx) => {
                  return(
                    <Stack>
                      <img src={img} alt={`Seite ${idx+1}`} onClick={() => {
                        setImageSelection(idx);
                      }}/>
                      <Center><Text>Seite {idx+1}</Text></Center>
                    </Stack>
                  );
                })
              }</Flex>
            </ScrollArea>
            <Flex justify={"end"}><Button disabled={imageSelection === -1} onClick={() => {
              //send event that the 
            }}>Bestättigen {imageSelection !== -1 && 
              <>Seite {imageSelection+1}</>
            }</Button></Flex>
        </Stack>
      </Modal>
      {/* Briefpapier Section */}
      <Paper p={paperPadding} shadow="xs" radius="md">
        <Group gap="md" mb="md">
          <IconMail
            size={20}
            style={{ color: 'var(--mantine-color-orange-6)' }}
          />
          <Text
            size={properties.properties.isMobile ? 'sm' : 'md'}
            fw={600}
            c="dark"
          >
            Briefpapier
          </Text>
        </Group>

        <SimpleGrid
          cols={properties.properties.isMobile ? 1 : 2}
          spacing={properties.properties.isMobile ? 'sm' : 'md'}
        >
          <FileInput
            label="Briefpapier hochladen"
            placeholder="PDF auswählen"
            accept="application/pdf"
            clearable
            defaultValue={properties.this.doc}
            onChange={(file: File | null) => {
              if (file) {
                const img = properties.this.convertPDFToImage(file, (imgs) => {
                  setImageSelection(-1);
                  setImagesToChoseFrom(imgs);
                  return Promise.reject(undefined);
                });
                img.then((value) => {
                  properties.this.docAsImage = value;
                  properties.properties.template.redrawView();
                }, (er) => {
                  if(er instanceof String){
                    alert(er);
                  }
                })
                properties.this.doc = file;
              } else {
                properties.this.doc = null;
                properties.this.docAsImage = null;
                properties.properties.template.redrawView();
              }
            }}
          />
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}

export class LogoSection extends TemplateTab {
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
  doc: null | File;
  docAsImage: null | string;
  async convertPDFToImage(pdf: File, showSelection: (imgs: string[]) => Promise<number>) : Promise<string> {
    const buffer = await pdf.arrayBuffer();
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.js`;
    }
    const doc = await pdfjsLib.getDocument({
      data: buffer,
      useSystemFonts: true,
    }).promise;
    if(doc.numPages === 0){
      return Promise.reject("Nicht genug Seiten, das PDF Dokument benötigt mindestens 1 Seite.");
    }else{
    const images : string[] = [];
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if(context){
      for(let i = 1; i < doc.numPages; i++){
        const page = await doc.getPage(i);
        const viewport = page.getViewport({scale: 1});
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.clearRect(0,0, canvas.width, canvas.height);
        await page.render({canvasContext: context, canvas, viewport}).promise;
        images.push(canvas.toDataURL());
      }
    }else{
      Promise.reject("Javascript Fehler");
    }

      if(doc.numPages > 1){
        //show page selection menu
        const select = await showSelection(images).catch((reason) => {
          return -1;
        });
        if(select === -1){
          return Promise.reject();
        }else{
          return Promise.resolve(images[select]);
        }
      }else{
        //directly set it
        return Promise.resolve(images[0]);
      }
    }
  }
  public constructor() {
    super();
    this.doc = null;
    this.docAsImage = null;
    this.drawUI = (prop) => <LogoUI properties={prop} this={this} />;
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
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      const paperPadding = properties.isMobile ? 'md' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          {/* Seitenlayout Section */}
          <Paper p={paperPadding} shadow="xs" radius="md">
            <Group gap="md" mb="md">
              <IconFile
                size={20}
                style={{ color: 'var(--mantine-color-blue-6)' }}
              />
              <Text size={properties.isMobile ? 'sm' : 'md'} fw={600} c="dark">
                Seitenlayout
              </Text>
            </Group>
            <Stack gap={properties.isMobile ? 'sm' : 'md'}>
              <SimpleGrid cols={2} spacing={properties.isMobile ? 'xs' : 'sm'}>
                <NumberInput
                  label="Rand oben"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingTop}
                  onChange={(size) => {
                    this.pagePaddingTop = Number(size);
                    properties.template.redrawView();
                  }}
                />
                <NumberInput
                  label="Rand unten"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingBottom}
                  onChange={(size) => {
                    this.pagePaddingBottom = Number(size);
                    properties.template.redrawView();
                  }}
                />
                <NumberInput
                  label="Rand links"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingLeft}
                  onChange={(size) => {
                    this.pagePaddingLeft = Number(size);
                    properties.template.redrawView();
                  }}
                />
                <NumberInput
                  label="Rand rechts"
                  placeholder="20"
                  suffix=" mm"
                  size={properties.isMobile ? 'sm' : 'md'}
                  min={0}
                  max={50}
                  defaultValue={this.pagePaddingRight}
                  onChange={(size) => {
                    this.pagePaddingRight = Number(size);
                    properties.template.redrawView();
                  }}
                />
              </SimpleGrid>
            </Stack>
          </Paper>
          {/* Schriftart Section */}
          <Paper p={paperPadding} shadow="xs" radius="md">
            <Group gap="md" mb="md">
              <IconPencil
                size={20}
                style={{ color: 'var(--mantine-color-green-6)' }}
              />
              <Text size={properties.isMobile ? 'sm' : 'md'} fw={600} c="dark">
                Schriftart
              </Text>
            </Group>

            <Stack gap={properties.isMobile ? 'sm' : 'md'}>
              <FontSelectorUI
                allowCustomFontUpload={false}
                fontSelector={this.font}
                template={properties.template}
              />

              <Grid>
                <Grid.Col span={properties.isMobile ? 12 : 6}>
                  <NumberInput
                    label="Schriftgröße"
                    placeholder="12"
                    suffix=" pt"
                    size={properties.isMobile ? 'sm' : 'md'}
                    min={8}
                    max={24}
                    defaultValue={this.fontSize}
                    onChange={(size) => {
                      this.fontSize = Number(size);
                      properties.template.redrawView();
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
          {/* Farben Section */}
          <Paper p={paperPadding} shadow="xs" radius="md">
            <Group gap="md" mb="md">
              <IconPalette
                size={20}
                style={{ color: 'var(--mantine-color-orange-6)' }}
              />
              <Text size={properties.isMobile ? 'sm' : 'md'} fw={600} c="dark">
                Farben
              </Text>
            </Group>

            <SimpleGrid
              cols={properties.isMobile ? 1 : 2}
              spacing={properties.isMobile ? 'sm' : 'md'}
            >
              <ColorInput
                label="Textfarbe"
                placeholder="Wählen Sie eine Farbe"
                size={properties.isMobile ? 'sm' : 'md'}
                defaultValue={this.fontColor}
                onChange={(color) => {
                  this.fontColor = color;
                  properties.template.redrawView();
                }}
                format="hex"
              />
            </SimpleGrid>
          </Paper>
        </Stack>
      );
    };
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
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          <DragVectorInput
            template={properties.template}
            isMobile={properties.isMobile}
            positionVector={this.pos}
          />
        </Stack>
      );
    };
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

export class InvoiceParamSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          <DragVectorInput
            template={properties.template}
            isMobile={properties.isMobile}
            positionVector={this.pos}
          />
        </Stack>
      );
    };
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

export class PositionsSection extends TemplateTab {
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
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      const spacing = properties.isMobile ? 'sm' : 'lg';
      return (
        <Stack gap={spacing} p={properties.isMobile ? 'sm' : 'md'}>
          <TableDataInput
            tableData={this.table}
            template={properties.template}
            isMobile={properties.isMobile}
            labelEditing={true}
            enableEditing={true}
            widthEditing={true}
            reorderEditing={true}
          />
        </Stack>
      );
    };
  }
}

export class PfkInvoiceTemplate extends Template {
  letterpaper?: DocumentSection;
  address?: RecipentSection;
  table?: PositionsSection;
  invoice?: InvoiceParamSection;
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
