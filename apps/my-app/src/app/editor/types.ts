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
    public abstract DrawPaper(prop: TemplateDrawProperties) : JSX.Element | Array<JSX.Element>;
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
    public abstract PageNumbers() : number | number[];
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
    currentPage: number;
    currentSelectedPropertiesTab?: string | null;
    onValueChanged?: () => void;
}
export class DragVector{
    public x = 0;
    public y = 0;
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
    
    public DragPos(){
        return{
            onDrag: (x: number, y: number, tab?: TemplateTab) =>{
                this.x = x;
                this.y = y;
                tab?.RedrawProperties();
            },
            onSubmitPositionChange: (x: number, y: number, template?: Template, tab?: TemplateTab) => {
                this.x = x;
                this.y = y;
                tab?.RedrawProperties();
                template?.RedrawView();
            },
            posVector: this,
        }
    }
    public getInputPropsX(template?: Template){
        return {
            value: this.x,
            onChange: (v: string | number) => {
                this.x = v as number;
                template?.RedrawView();
            }
        };
    }
    public getInputPropsY(template?: Template){
        return {
            value: this.y,
            onChange: (v: string | number) => {
                this.y = v as number;
                template?.RedrawView();
            }
        };
    }
}
export interface RenderableBlockParams{
    template?: Template;
    templateTab?: TemplateTab;
    width?: number;
    heigth?: number;
    x?: number;
    y?: number;
    posVector?: DragVector;
    onSubmitPositionChange?: (
        xPos: number,
        yPos: number,
        template?: Template,
        tab?: TemplateTab
    ) => void;

}