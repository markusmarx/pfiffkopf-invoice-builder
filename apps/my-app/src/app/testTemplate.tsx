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
}
export class TestTemplate extends Template {
  letterpaper?: LetterpaperSection;
  adress?: AdressSection;
  DrawPaper(prop: TemplateDrawProperties): JSX.Element {
    return (
      <div>
        <Text>Hello Paper</Text>
        <Text>This is dynamic {this.letterpaper?.testText}</Text>
        <MovableBox
          className="adress"
          enabled={prop.currentTab === "adress"}
          template={this}
          templateTab={this.adress}
          { ...this.adress?.pos.DragPos() }
        >
          <Text>Max Musterman</Text>
          <Text>Musterstraße 16</Text>
          <Text>01234 Musterhausen</Text>
        </MovableBox>
      </div>
    );
  }
}
