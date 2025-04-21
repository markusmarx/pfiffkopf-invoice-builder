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
    function updateVis(){
        console.log("update");
        const target = document.getElementById("adress");

        if(target){
            console.log(target);
          //target.style.transform = `translate(${properties.self.recipentPositionX}px, ${properties.self.recipentPositionY}px)`;
            //target.style.left = `${properties.self.recipentPositionX}px`;
            target.style.cssText += `left: ${properties.self.recipentPositionX}px;top: ${properties.self.recipentPositionY}px`;
        }
    }
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      posX: properties.self.recipentPositionX,
      posY: properties.self.recipentPositionY,
    },

    onValuesChange: () => {

      //properties.self.recipentPositionX = form.values.posX;
      //properties.self.recipentPositionY = form.values.posY;
      
      /*if (
        properties.self.recipentPositionX !== form.values.posX ||
        properties.self.recipentPositionY !== form.values.posY
      ) {
        properties.self.recipentPositionX = form.values.posX;
        properties.self.recipentPositionY = form.values.posY;
        //properties.props.template.RedrawView();
      }*/
    },
  });
  
  function getInputProps(name: string) {
    const value = form.getInputProps(name);
    const onChange = value.onChange;
    value.onChange = (v: any) => {
      TemplateUtil.changeInUI = true;
      onChange(v);
    };
    return value;
  }
  useEffect(() => {
    /*if (
        form.values.posX !== properties.self.recipentPositionX  ||
        form.values.posY !== properties.self.recipentPositionY
    ) {
      TemplateUtil.changeInUI = false;
      form.setValues({
        posX: properties.self.recipentPositionX,
        posY: properties.self.recipentPositionY,
      });
      console.log( properties.self.recipentPositionX);
      console.log(form.values.posX);
    }*/
      
  }, [
    properties.self.recipentPositionX,
    properties.self.recipentPositionY,
    form,
  ]);

  return (
    <div>
      <NumberInput
        decimalSeparator=","
        defaultChecked={true}
        suffix=" px"
        label="X-Position"
        step={0.1}
        key={form.key("posX")}
        value={properties.self.recipentPositionX}
        onChange={(v) => properties.self.recipentPositionX = v as number}
        //{...form.getInputProps("posX")}
      />
      <NumberInput
        decimalSeparator=","
        defaultChecked={true}
        suffix=" px"
        label="Y-Position"
        step={0.1}
        key={form.key("posY")}
        value={properties.self.recipentPositionY}
        onChange={(v) => {properties.self.recipentPositionY = v as number; updateVis(); }}
      />
    </div>
  );
}
export class AdressSection extends TemplateTab {
  public recipentPositionX = 0;
  public recipentPositionY = 0;
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
          xPos={this.adress?.recipentPositionX}
          yPos={this.adress?.recipentPositionY}
          id="adress"
          enabled={prop.currentTab === "adress"}
          onDrag={(left: number, top: number) => {
            if (this.adress) {
              this.adress.recipentPositionX = left;
              this.adress.recipentPositionY = top;
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
