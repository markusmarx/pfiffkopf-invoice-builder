import { JSX } from "react";
export abstract class Template
{
    private refreshUI?: () => void;
    public abstract DrawPaper() : JSX.Element;
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
    public abstract DrawUI(template: Template) : JSX.Element;
    public abstract DisplayName() : string;    
}
export interface ViewProperties
{
    template : Template;
}