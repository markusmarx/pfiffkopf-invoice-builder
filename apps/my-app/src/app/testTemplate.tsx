import { FileInput, NumberInput, Text, TextInput } from "@mantine/core";
import {
  DragVector,
  Template,
  TemplateDrawProperties,
  TemplateTab,
  TemplateTabDrawProperties,
} from "./editor/types";
import React, { JSX, useEffect } from "react";
import { MovableBox } from "./editor/movable/movableBox";
import { useForm } from "@mantine/form";
import { Page, PageFormat } from "./editor/page/page";

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
class TemplateUtil{
    public static changeInUI  = false;
}
function AdressSectionDraw(properties: {
  self: AdressSection;
  props: TemplateTabDrawProperties;
}) {
     

  return (
    <div>
      <NumberInput
        decimalSeparator=","
        defaultChecked={true}
        suffix=" px"
        label="X-Position"
        {...properties.self.pos.getInputPropsX(properties.props.template)}
      />
      <NumberInput
        decimalSeparator=","
        defaultChecked={true}
        suffix=" px"
        label="Y-Position"
        {...properties.self.pos.getInputPropsY(properties.props.template)}
      />
    </div>
  );
}
export class AdressSection extends TemplateTab {
  public pos = new DragVector(100, 100);
  public constructor() {
    super();
    this.drawUI = (properties: TemplateTabDrawProperties) => {
      return <AdressSectionDraw self={this} props={properties} />;
    };
  }
  DisplayName(): string {
    return "Adressen";
  }
  public PageNumbers(): number {
      return 0;
  }
}
export class TestTemplate extends Template {
  letterpaper?: LetterpaperSection;
  adress?: AdressSection;
  DrawPaper(prop: TemplateDrawProperties): Array<JSX.Element> {
    return Array<JSX.Element> (
      <Page format={PageFormat.A4} borderTop={1} borderBottom={1} borderLeft={1} borderRight={1}>
        <Text>Hello Paper</Text>
        <Text>This is dynamic {this.letterpaper?.testText}</Text>
        <MovableBox
          className="adress"
          enabled={prop.currentTab === "adress"}
          template={this}
          templateTab={this.adress}
          { ...this.adress?.pos.DragPos() }
          width={300}
          heigth={200}
        >
          <Text>Max Musterman</Text>
          <Text>Musterstraße 16</Text>
          <Text>01234 Musterhausen</Text>
        </MovableBox>
      </Page>,
      <Page format={PageFormat.A6}>
        <Text>Secret Page</Text>
      </Page>
    );
  }
}