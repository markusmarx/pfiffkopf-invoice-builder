import {FileInput, Group, Stack, Text, TextInput, Title} from "@mantine/core";
import {
  DragVector,
  FontStorage,
  TableData,
  Template,
  TemplateDrawProperties,
  TemplateTab,
  TemplateTabDrawProperties,
} from "./editor/types";
import React, { JSX } from "react";
import { MovableBox } from "./editor/movable/movableBox";
import { Page, PageFormat } from "./editor/page/page";
import { MovableTable } from "./editor/movableTable/movableTable";
import DragVectorInput, {
  DragVectorDisplayType,
} from "./editor/dragVectorInput/dragVectorInput";
import { TableDataInput } from "./editor/tableDataInput/tableDataInput";
import { FontSelector } from "./editor/fontSelector/fontSelector";

export class LetterpaperSection extends TemplateTab {
  bold?: boolean;
  watermark?: string;
  test?: number;
  testText?: string;
  font: FontStorage;
  public constructor() {
    super();
    this.font = new FontStorage();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <div>
          <FileInput label="Briefpapier hochladen" style={{fontFamily: "Custom Font"}}/>
          <TextInput
            label="dummy text"
            defaultValue={this.testText}
            onChange={(v) => {
              this.testText = v.target.value;
              properties.template.RedrawView();
            }}
          />
          <FontSelector 
            fontStorage={this.font}
            allowCustomFontUpload={true}
            fonts={["Arial", "Times New Roman"]}
            template={properties.template}

          />          
        </div>
      );
    };
  }
  DisplayName(): string {
    return "Briefpapier";
  }
  public PageNumbers(): number[] {
    return [0, 1];
  }
}

export class AddressSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <DragVectorInput
          template={properties.template}
          dragVector={this.pos}
          displayType={DragVectorDisplayType.Position}
        />
      );
    };
  }
  DisplayName(): string {
    return "Rechnungsadresse";
  }
  public PageNumbers(): number {
    return 0;
  }
}

export class InvoiceParamSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <DragVectorInput
          template={properties.template}
          dragVector={this.pos}
          displayType={DragVectorDisplayType.Position}
        />
      );
    };
  }
  DisplayName(): string {
    return "Rechnungsdaten";
  }
  public PageNumbers(): number {
    return 0;
  }
}

export class PositionsSection extends TemplateTab {
  public pos = new DragVector(100, 400);
  public size = new DragVector(300, 100);
  public table = new TableData(
    [
      { accessor: "t1", label: "Pos" },
      { accessor: "t2", label: "Beschreibung" },
      { accessor: "t3", label: "Dauer" },
      { accessor: "t4", label: "Einzel" },
      { accessor: "t5", label: "Ust. %" },
      { accessor: "t6", label: "Gesamt" },
    ],
    300
  );
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <>
          <DragVectorInput
            template={properties.template}
            dragVector={this.pos}
            displayType={DragVectorDisplayType.Position}
          />
          <DragVectorInput
            template={properties.template}
            dragVector={this.size}
            displayType={DragVectorDisplayType.Size}
          />
          <TableDataInput
            template={properties.template}
            tableData={this.table}
            labelEditing={true}
            enableEditing={true}
            widthEditing={true}
            reorderEditing={true}
          />
        </>
      );
    };
  }
  DisplayName(): string {
    return "Positionen";
  }
  public PageNumbers(): number {
    return 0;
  }
}

export class PfkInvoiceTemplate extends Template {
  letterpaper?: LetterpaperSection;
  address?: AddressSection;
  positions?: PositionsSection;
  invoiceParam?: InvoiceParamSection;
  DrawPaper(prop: TemplateDrawProperties): Array<JSX.Element> {
    console.log(this.letterpaper?.font);
    return Array<JSX.Element>(
      <Page
        format={PageFormat.A4}
        borderTop={1}
        borderBottom={1}
        borderLeft={1}
        borderRight={1}
        autoExpand={prop.pdfRenderer}
        alwaysBreakToNewPage={false}
        style={{fontFamily: this.letterpaper?.font.Get()}}
      >
        <MovableBox
          className="adress"
          enabled={prop.currentTab === "address"}
          template={this}
          templateTab={this.address}
          {...this.address?.pos.DragPos()}
          width={300}
          heigth={150}
          id="address"
        >
          <Text>
            <b>Musterfirma</b>
          </Text>
          <Text>
            <b>Etage 0815</b>
          </Text>
          <Text>
            Maxime Muster
          </Text>
          <Text>
            Musterstraße 16
          </Text>
          <Text> - Zusatz - </Text>
          <Text>
            012<b>34</b> Musterhausen
          </Text>
        </MovableBox>
        <MovableBox
          className="adress"
          enabled={prop.currentTab === "invoiceParam"}
          template={this}
          templateTab={this.invoiceParam}
          {...this.invoiceParam?.pos.DragPos()}
          width={300}
          heigth={150}
          id="invoiceParam"
        >
          <Stack align={"flex-end"} gap={0}>
            <Title order={3}>
              Rechnung
            </Title>
            <Group justify={"space-between"}>
              <Stack align={"flex-end"} gap={0}>
                <Text>Rechnungnr.:</Text>
                <Text>Datum:</Text>
                <Text>Leistungszeitraum:</Text>
                <Text>&nbsp;</Text>
              </Stack>
              <Stack align={"flex-end"} gap={0}>
                <Text>R2025-0001</Text>
                <Text>31.01.2025</Text>
                <Text>01.01.2025</Text>
                <Text>bis 31.01.2025</Text>
              </Stack>
            </Group>
          </Stack>
        </MovableBox>
        <MovableBox id={"salutation"} posVector={{x: 0, y: 300}} sizeVector={{x: 700, y: 100}}>
          <Text fw={700}>Hallo Maxim Mustermann,</Text>
          <Text>ich erlaube mir eine Rechnung für folgende Leistungen zu stellen.</Text>
        </MovableBox>
        <MovableTable
          className="positions"
          enabled={prop.currentTab === "positions"}
          template={this}
          disableMovement={true}
          templateTab={this.positions}
          x={this.positions?.pos.x}
          y={this.positions?.pos.y}
          width={this.positions?.size.x}
          heigth={this.positions?.size.y}
          id="positions"
          enableResizing={false}
          cellStyle={{ border: "3px solid" }}
          headerStyle={{ border: "3px solid" }}
          {...(this.positions?.table.DynamicTable() || { header: [] })}
          rows={[
            {
              elements: [
                { label: "1", accessor: "t1" },
                { label: "Termin Beschreibung", accessor: "t2" },
                { label: "2 x 45 min", accessor: "t3" },
                { label: "50,00€", accessor: "t4" },
                { label: "0,00%", accessor: "t5" },
                { label: "100,00€", accessor: "t6" },
              ],
              accessorControlled: true,
            },

          ]}
        />
        <MovableBox id={"salutation"} posVector={{x: 0, y: 600}} sizeVector={{x: 700, y: 100}}>
          <Text>Vielen Dank für die gute Zusammenarbeit!</Text>
        </MovableBox>
      </Page>
    );
  }
}
