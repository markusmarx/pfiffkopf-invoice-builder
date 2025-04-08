import { FileInput, NumberInput, Text, TextInput } from "@mantine/core";
import { Template, TemplateDrawProperties, TemplateTab, TemplateTabDrawProperties } from "./editor/types";
import React, { JSX, useEffect } from "react";
import { MovableBox } from "./editor/movable/movableBox";
import { useForm } from "@mantine/form";
export class LetterpaperSection extends TemplateTab{
    bold?: boolean;
    watermark?: string;
    test?: number;
    testText?: string;
    public constructor(){
        super();
        this.drawUI = (properties: TemplateTabDrawProperties) => {
            return <div>
                <FileInput
                    label="Briefpapier hochladen"
                />
                <TextInput label="dummy text" defaultValue={this.testText} onChange={(v) => {this.testText = v.target.value; properties.template.Redraw();}}/>
            </div>
        };
    }
    DisplayName() : string{
        return "Briefpapier";
    }
}

function AdressSectionDraw(properties: {self: AdressSection, props: TemplateTabDrawProperties}){
    const form = useForm(
        {
            mode: 'uncontrolled',
            initialValues: {
              posX: properties.self.recipentPositionX,
              posY: properties.self.recipentPositionY,
            },
            onValuesChange: () => {
                if(form.values.posX !== properties.self.recipentPositionX || form.values.posY !== properties.self.recipentPositionY){
                    properties.self.recipentPositionX = form.values.posX;
                    properties.self.recipentPositionY = form.values.posY;
                    properties.props.template.Redraw();
                }
            }
        }
    );
    useEffect(() => {
        if(properties.self.recipentPositionX !== form.values.posX || properties.self.recipentPositionY !== form.values.posY){
            form.setValues( {
               posX: properties.self.recipentPositionX,
               posY: properties.self.recipentPositionY 
            });
        }
    }, [properties.self.recipentPositionX, properties.self.recipentPositionY, form]);

    console.log(properties.self.recipentPositionX);
    return <div>
        <NumberInput 
            decimalSeparator="," defaultChecked={true} suffix=" px" label="X-Position" step={0.1}
            key={form.key('posX')}
            {...form.getInputProps('posX')}
        />
        <NumberInput 
            decimalSeparator="," defaultChecked={true} suffix=" px" label="Y-Position" step={0.1}
            key={form.key('posY')}
            {...form.getInputProps('posY')}
        />
    </div>
}
export class AdressSection extends TemplateTab{
    public recipentPositionX = 0;
    public recipentPositionY = 0;
    public constructor(){
        super();
        this.drawUI = (properties: TemplateTabDrawProperties) => {
            return <AdressSectionDraw self={this} props={properties}/>
        };
    }
    DisplayName() : string{
        return "Adressen";
    }
}
export class TestTemplate extends Template{
    letterpaper?: LetterpaperSection;
    adress?: AdressSection;
    DrawPaper(prop: TemplateDrawProperties): JSX.Element {
        return <div>
          <Text>Hello Paper</Text>  
          <Text>This is dynamic {this.letterpaper?.testText}</Text>
          <MovableBox enabled={prop.currentTab === "adress"} onDrag={(xPos: number, yPos : number) => {
            if(this.adress){
                this.adress.recipentPositionX = xPos;
                this.adress.recipentPositionY = yPos;
                if(prop.templateValuesChanged){
                    prop.templateValuesChanged();
                }
            }
          }}>
                This is moving text
          </MovableBox>
        </div>
    }
}