import { inspectableBool, inspectableFloat, inspectableString } from "./editor/decorators";
import { Template } from "./editor/types";
import React, { JSX } from "react";
class LetterpaperSection{
    @inspectableBool()
    bold?: boolean;
    @inspectableString()
    watermark?: string;
    test?: number;
}
class HeaderSection{
    boldX?: boolean;
    watermarkX?: string;
    @inspectableFloat()
    testX? : number;
}
export class TestTemplate implements Template{
    @inspectableFloat()
    letterpaper?: LetterpaperSection;
    @inspectableString()
    header?: HeaderSection;
    draw(): JSX.Element {
        return <div>
            
        </div>
    }
}