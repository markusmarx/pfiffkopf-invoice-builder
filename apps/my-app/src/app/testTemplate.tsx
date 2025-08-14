import { FileInput, Text, TextInput } from "@mantine/core";
import {
  DragVector,
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

export class LetterpaperSection extends TemplateTab {
  bold?: boolean;
  watermark?: string;
  test?: number;
  testText?: string;
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return (
        <div>
          <FileInput label="Briefpapier hochladen" />
          <TextInput
            label="dummy text"
            defaultValue={this.testText}
            onChange={(v) => {
              this.testText = v.target.value;
              properties.template.RedrawView();
            }}
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
export class AdressSection extends TemplateTab {
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
    return "Adressen";
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
      { accessor: "t1", label: "Table 1" },
      { accessor: "t2", label: "Table 2" },
      { accessor: "t3", label: "Table 3" },
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

export class TestTemplate extends Template {
  letterpaper?: LetterpaperSection;
  adress?: AdressSection;
  positions?: PositionsSection;
  DrawPaper(prop: TemplateDrawProperties): Array<JSX.Element> {
    return Array<JSX.Element>(
      <Page
        format={PageFormat.A4}
        borderTop={1}
        borderBottom={1}
        borderLeft={1}
        borderRight={1}
        autoExpand={true}
        alwaysBreakToNewPage={false}
      >
        <Text>Hello Paper</Text>
        <Text>This is dynamic {this.letterpaper?.testText}</Text>
        <MovableBox
          className="adress"
          enabled={prop.currentTab === "adress"}
          template={this}
          templateTab={this.adress}
          {...this.adress?.pos.DragPos()}
          width={300}
          heigth={80}
          id="adress"
        >
          <Text>
            <b>Max Musterman</b>
          </Text>
          <Text>
            <b>
              <i>Musterstraße </i>16
            </b>
          </Text>
          <Text>
            <i>01234 Musterhausen</i>
            <Text> - Weiter Text</Text>
          </Text>
        </MovableBox>
        <MovableTable
          className="positions"
          enabled={prop.currentTab === "positions"}
          template={this}
          templateTab={this.positions}
          {...this.positions?.pos.DragPos()}
          {...this.positions?.size.DragSize()}
          id="positions"
          enableResizing={true}
          cellStyle={{ border: "3px solid" }}
          headerStyle={{ border: "3px solid" }}
          {...(this.positions?.table.DynamicTable() || { header: [] })}
          rows={[
            {
              elements: [
                { label: "Text 1", accesor: "t1" },
                { label: "Text 2", accesor: "t2" },
                { label: "Text 3", accesor: "t3" },
              ],
              accesorControlled: true,
            },
            {
              elements: [
                { label: "Undynamisch Text 1" },
                { label: "Undynamisch Text 2" },
                { label: "Undynamisch Text 3" },
              ],
              accesorControlled: false,
            },
          ]}
        />
      </Page>,
      <Page format={PageFormat.A6} borderBottom={1}>
        <Text>Secret Page</Text>
      </Page>
    );
  }
}
