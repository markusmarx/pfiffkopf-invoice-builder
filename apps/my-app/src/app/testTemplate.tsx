import { FileInput, Text, TextInput } from "@mantine/core";
import { Template, TemplateTab } from "./editor/types";
import React, { JSX } from "react";
export class LetterpaperSection extends TemplateTab{
    bold?: boolean;
    watermark?: string;
    test?: number;
    testText?: string;
    
    DrawUI(template: Template): JSX.Element {
        return <div>
            <FileInput
                label="Briefpapier hochladen"
            />
            <TextInput label="dummy text" defaultValue={this.testText} onChange={(v) => {this.testText = v.target.value; template.Redraw();}}/>
        </div>
    }
    DisplayName() : string{
        return "Briefpapier";
    }
}
export class HeaderSection extends TemplateTab{
    boldX?: boolean;
    watermarkX?: string;
    testX? : number;
    DrawUI(template: Template): JSX.Element {
        return <div>
            
        </div>
    }
    DisplayName() : string{
        return "Anrede";
    }
}
export class TestTemplate extends Template{
    letterpaper?: LetterpaperSection;
    header?: HeaderSection;
    DrawPaper(): JSX.Element {
        return <div>
          <Text>Hello Paper</Text>  
          <Text>This is dynamic {this.letterpaper?.testText}</Text>
        </div>
    }
}