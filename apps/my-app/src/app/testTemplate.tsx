import { FileInput, NumberInput, Text, TextInput } from "@mantine/core";
import {
  DragVector,
  Template,
  TemplateDrawProperties,
  TemplateTab,
  TemplateTabDrawProperties,
} from "./editor/types";
import React, { JSX } from "react";
import { MovableBox } from "./editor/movable/movableBox";
import { Page, PageFormat } from "./editor/page/page";
import { MovableTable } from "./editor/movableTable/movableTable";

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
        return <>
        <NumberInput
          decimalSeparator=","
          defaultChecked={true}
          suffix=" px"
          label="X-Position"
          {...this.pos.getInputPropsX(properties.template)}
        />
        <NumberInput
          decimalSeparator=","
          defaultChecked={true}
          suffix=" px"
          label="Y-Position"
          {...this.pos.getInputPropsY(properties.template)}
        />
      </>;
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
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
        return <>
        <NumberInput
          decimalSeparator=","
          defaultChecked={true}
          suffix=" px"
          label="X-Position"
          {...this.pos.getInputPropsX(properties.template)}
        />
        <NumberInput
          decimalSeparator=","
          defaultChecked={true}
          suffix=" px"
          label="Y-Position"
          {...this.pos.getInputPropsY(properties.template)}
        />

        <NumberInput
          decimalSeparator=","
          defaultChecked={true}
          suffix=" px"
          label="Weite"
          {...this.size.getInputPropsX(properties.template)}
        />
        <NumberInput
          decimalSeparator=","
          defaultChecked={true}
          suffix=" px"
          label="Höhe"
          {...this.size.getInputPropsY(properties.template)}
        />
      </>;
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
    return Array<JSX.Element> (
      <Page format={PageFormat.A4} borderTop={1} borderBottom={1} borderLeft={1} borderRight={1} autoExpand={true} alwaysBreakToNewPage={false}>
        <Text>Hello Paper</Text>
        <Text>This is dynamic {this.letterpaper?.testText}</Text>
        <MovableBox
          className="adress"
          enabled={prop.currentTab === "adress"}
          template={this}
          templateTab={this.adress}
          { ...this.adress?.pos.DragPos() }
          width={300}
          heigth={80}
          id="adress"
        >
          <Text>Max Musterman</Text>
          <Text>Musterstraße 16</Text>
          <Text>01234 Musterhausen</Text>
        </MovableBox>
        <MovableTable
          className="positions"
          enabled={prop.currentTab === "positions"}
          template={this}
          templateTab={this.positions}
          { ...this.positions?.pos.DragPos() }
          {... this.positions?.size.DragSize()}
          collums={["Pos.", "Beschreibung", "Menge", "Einzelpreis", "Gesamtpreis"]}
          id="positions"
          enableResizing={true}
        />
      </Page>,
      <Page format={PageFormat.A6}>
        <Text>Secret Page</Text>
      </Page>
    );
  }
}