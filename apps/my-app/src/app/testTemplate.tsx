import { Template } from "./editor/types";
import React, { JSX } from "react";
interface LetterpaperSection{
    bold: boolean;
    watermark: string;
    test: number;
}

export class TestTemplate implements Template{
    letterpaper?: LetterpaperSection;
    draw(): JSX.Element {
        return <div>
            
        </div>
    }
}