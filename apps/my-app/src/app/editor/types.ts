import { JSX } from "react";

export interface TemplateDrawProperties{
    currentTab: string,
    templateValuesChanged?: () => void
}
export interface TemplateTabDrawProperties{
    currentTab: string,
    edited: boolean, 
    template: Template
}
export abstract class Template
{
    private refreshUI?: () => void;
    public abstract DrawPaper(properties: TemplateDrawProperties) : JSX.Element;
    public Redraw() {
        if(this.refreshUI){
            this.refreshUI();
        }
    }
    public SetData(refreshUI: () => void){
        this.refreshUI = refreshUI;
    }
}

export abstract class TemplateTab
{
    public drawUI? : (properties: TemplateTabDrawProperties) => JSX.Element;
    public abstract DisplayName() : string;    
}

export interface ViewProperties
{
    template : Template;
    currentSelectedPropertiesTab?: string | null;
    onValueChanged?: () => void;
}