import { ReactElement } from "react";
import { Propertys } from "./properties/property";
import { ViewProperties, Template } from "./types";
import { DefaultView } from "./view/view";
export interface EditorPropertys
{
    view?: ReactElement<ViewProperties>;
    template: Template;
}

export function Editor(properties: EditorPropertys)
{
    return (
        <div id="editor-container">
            <Propertys template={properties.template}/>
            {(properties.view) ? properties.view : <DefaultView template={properties.template}/>}
        </div>
    );
}