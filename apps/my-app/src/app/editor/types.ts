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
    private refreshView?: () => void;
    public abstract DrawPaper(properties: TemplateDrawProperties) : JSX.Element;
    public RedrawProperties() {
        if(this.refreshUI){
            this.refreshUI();
        }
    }
    public SetDataProperties(refreshUI: () => void){
        this.refreshUI = refreshUI;
    }

    public RedrawView() {
        if(this.refreshView){
            this.refreshView();
        }
    }
    public SetDataView(refreshView: () => void){
        this.refreshView = refreshView;
    }
}

export abstract class TemplateTab
{
    public drawUI? : (properties: TemplateTabDrawProperties) => JSX.Element;
    public abstract DisplayName() : string;
    
    private refreshUI?: () => void;
    public RedrawProperties() {
        if(this.refreshUI){
            this.refreshUI();
        }
    }
    public SetDataProperties(refreshUI: () => void){
        this.refreshUI = refreshUI;
    }
}

export interface ViewProperties
{
    template : Template;
    currentSelectedPropertiesTab?: string | null;
    onValueChanged?: () => void;
}