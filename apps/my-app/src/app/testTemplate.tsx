import { FileInput, NumberInput, Text, TextInput } from "@mantine/core";
import {
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
        value={properties.self.recipentPositionXInitial + properties.self.recipentPositionXDrag}
        onChange={(v) => {properties.self.recipentPositionXInitial = (v as number); properties.props.template.RedrawView(); }}
      />
      <NumberInput
        decimalSeparator=","
        defaultChecked={true}
        suffix=" px"
        label="Y-Position"
        value={properties.self.recipentPositionYInitial}
        onChange={(v) => {properties.self.recipentPositionYInitial = (v as number); properties.props.template.RedrawView(); }}
      />
    </div>
  );
}
export class AdressSection extends TemplateTab {
  public recipentPositionXInitial = 0;
  public recipentPositionYInitial = 0;
  public recipentPositionXDrag = 0;
  public recipentPositionYDrag = 0;
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
          xPos={this.adress?.recipentPositionXInitial}
          yPos={this.adress?.recipentPositionYInitial}
          id="adress"
          enabled={prop.currentTab === "adress"}
          onDrag={(left: number, top: number) => {
            if (this.adress) {
              this.adress.recipentPositionXInitial = left;
              this.adress.recipentPositionYInitial = top;
              this.RedrawView();
              this.adress.RedrawProperties();
            }
          }}
        >
          <Text>Max Musterman</Text>
          <Text>Musterstraße 16</Text>
          <Text>01234 Musterhausen</Text>
        </MovableBox>
      </div>
    );
  }
}
