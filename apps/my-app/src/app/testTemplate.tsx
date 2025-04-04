import { FileInput, Title } from "@mantine/core";
import { Template, TemplateTab } from "./editor/types";
import React, { JSX } from "react";
import { useForm } from "@mantine/form";
export class LetterpaperSection implements TemplateTab{
    //@inspectableBool()
    bold?: boolean;
    //@inspectableString()
    watermark?: string;
    test?: number;
    drawUI(): JSX.Element {

        return <div>
            <FileInput
                label="Briefpapier hochladen"
            />
        </div>
    }
    displayName() : string{
        return "Briefpapier";
    }
}
export class HeaderSection implements TemplateTab{
    boldX?: boolean;
    watermarkX?: string;
    testX? : number;

    drawUI(): JSX.Element {
        return <div>
            
        </div>
    }
    displayName() : string{
        return "Anrede";
    }
}
export class TestTemplate implements Template{
    letterpaper?: LetterpaperSection;
    header?: HeaderSection;
    draw(): JSX.Element {
        return <div>
            
        </div>
    }
}