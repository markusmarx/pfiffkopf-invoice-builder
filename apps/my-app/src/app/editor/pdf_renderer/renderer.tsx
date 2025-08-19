import { createRoot } from "react-dom/client";
import { Template } from "../types";
import { MantineProvider } from "@mantine/core";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { saveAs } from 'file-saver';

abstract class DrawCommand {
    childs : DrawCommand[];
    constructor() {
        this.childs = new Array<DrawCommand>();
    }
}
//this tells the drawing system to execute the draw command in all children
abstract class GroupCommand extends DrawCommand {
    width: number;
    heigth: number;
    x: number;
    y: number;
    constructor(width: number, heigth: number, x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.heigth = heigth;
    }
    public ShouldKeep(command: DrawCommand){
        return !(command instanceof SplitCommand);
    }
    abstract Draw(pdf: any, commands: Array<DrawCommand>) : void;
}
//this class is a simple node that get's stripped during drawing but is required to build the pdf command tree
class SplitCommand extends DrawCommand{
    
}


class DrawTextCommand extends DrawCommand{
    text: string;
    //family and size
    fontSize = 11;
    font = "Arial";
    //align
    textAllign = "left";
    //decoration
    color = "black";
    bold = false; //TODO: We need to change the font for that
    underline = false;
    strike = false;
    constructor(text: string){
        super();
        this.text = text;
    }
}

class StartDrawTextCommand extends GroupCommand{
    constructor(x: number, y: number, width: number, heigth: number) {
        super(width, heigth, x, y);
    }
    override ShouldKeep(command: DrawCommand): boolean {
        return super.ShouldKeep(command) && (command instanceof DrawTextCommand);
    }
    Draw(pdf: any, commands: Array<DrawCommand>){
        for(let i = 0; i < commands.length; i++){
            const textCommand = commands[i] as DrawTextCommand;
            if(i === 0){
                pdf.text(textCommand.text, this.x, this.y, {width: this.width, height: this.heigth, continued: commands.length !== 1, underline: textCommand.underline, strike: textCommand.strike});
            }else{
                pdf.text(textCommand.text, {continued: commands.length -1 !== i, underline: textCommand.underline, strike: textCommand.strike});
            }
        }
    }
}
/*
class StartDrawTableCommand implements DrawCommand, DrawStartCommand{
    childs : DrawCommand[];
    typeIdentifierStartDrawTableCommand  = true;
    width: number;
    heigth: number;
    x: number;
    y: number;
    subCommandCalls = 0;
     constructor(x: number, y: number, width: number, heigth: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.heigth = heigth;
        this.childs = new Array<DrawCommand>(0);
    }
    Draw(pdf: any, group: DrawStartCommand | null): void {
        console.log(this);
        const table = pdf.table({position: {x: this.x, y: this.y}});
        this.childs.forEach(element => {
            element.Draw(table, this);
        });
    }
}
class StartDrawRowCommand implements DrawCommand, DrawStartCommand{
    childs : DrawCommand[];
    width: number;
    heigth: number;
    x: number;
    y: number;
    subCommandCalls = 0;
    cells: StartDrawCellCommand[];
    constructor(x: number, y: number, width: number, heigth: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.heigth = heigth;
        this.childs = new Array<DrawCommand>(0);
        this.cells = new Array<StartDrawCellCommand>(0);
    }
    Draw(pdf: any, group: DrawStartCommand | null): void {
        //
        this.childs.forEach(element => {
            element.Draw(pdf, this);
        });
        const row = new Array<string>();
        for(let i = 0; i < this.cells.length; i++){
            row.push("text");
        }
        pdf.row(row);

    }
}
class StartDrawCellCommand implements DrawCommand, DrawStartCommand{
    childs: DrawCommand[];
    width: number;
    heigth: number;
    x: number;
    y: number;
    subCommandCalls: number;
    text = "";
    allign: {x: string, y: string};
    font = "";
    textColor: string;

    constructor(width: number, height: number){
        this.childs = new Array<DrawCommand>(0);
        this.width = width;
        this.heigth = height;
        this.x = 0;
        this.y = 0;
        this.subCommandCalls = 0;
        this.textColor = "black";
        this.allign = {x: "left", y: "middle"}
    }
    Draw(pdf: any, group: DrawStartCommand | null): void {
        if(group instanceof StartDrawRowCommand){
            const drawStartCommand = group as StartDrawRowCommand;
            drawStartCommand.cells.push(this);
        }
        this.childs.forEach(element => {
            element.Draw(pdf, this);
        });
    }
    
}*/
function getCmInPixels(): number {
  const div = document.createElement("div");
  div.style.width = "1cm";
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  document.body.appendChild(div);

  const pixels = div.getBoundingClientRect().width;
  document.body.removeChild(div);

  return pixels;
}

const cmToPixels = getCmInPixels();


function cssScaleToPostScriptPoint(value: string, self?: HTMLElement | null, name?: string) : number| null{
    function percentRecursive(node: HTMLElement, read: string){
        const percent = Number(read.substring(0, read.length - 1)) / 100;
         if(!node || !name || !node.parentElement)
            return 0;
        return percent * (cssScaleToPostScriptPointWithCallback(node.parentElement.style.getPropertyValue(name), node.parentElement, percentRecursive) || 1);
    }
    
    return cssScaleToPostScriptPointWithCallback(value, self, percentRecursive);
}
function cssPixelToPostScriptPoint(value: number) : number{
    // eslint-disable-next-line no-loss-of-precision
    return Number(((value / cmToPixels) * 5.6692857142857142857142857142857 * 5).toFixed(2));
}

function cssScaleToPostScriptPointWithCallback(value: string, self?: HTMLElement | null, getParrentSize?: (node: HTMLElement, read: string) => number) : number | null{
    const without_unit = value.substring(0, value.length - 2);
    if (!value){
        return null;
    }
    else if(value.endsWith("cm")){
        const cmNumber = Number(without_unit);
        // eslint-disable-next-line no-loss-of-precision
        return Number((cmNumber * 5.6692857142857142857142857142857 * 5).toFixed(2));
    }else if (value.endsWith("mm")){
        const mmNumber = Number(without_unit);  
        // eslint-disable-next-line no-loss-of-precision
        return Number((mmNumber * 5.6692857142857142857142857142857 * 5 / 100).toFixed(2));
    }else if (value.endsWith("in")){
        const inchNumber = Number(without_unit);  
        // eslint-disable-next-line no-loss-of-precision
        return Number((inchNumber * 143.99984905143705330020367170284 * 5).toFixed(2));
    }else if (value.endsWith("pt")){
        const ptNumber = Number(without_unit);  
        // eslint-disable-next-line no-loss-of-precision
        return Number((ptNumber * 143.99984905143705330020367170284 * 5 / 72).toFixed(2));
    }else if (value.endsWith("pc")){
        const pcNumber = Number(without_unit);  
        // eslint-disable-next-line no-loss-of-precision
        return Number((pcNumber * 143.99984905143705330020367170284 * 5 / 6).toFixed(2));
    }else if (value.endsWith("px")){
        const pxNumber = Number(without_unit);
        return cssScaleToPostScriptPoint((pxNumber / cmToPixels).toFixed(2) + "cm")
    }else if(value.endsWith("%")){
        if(self && getParrentSize)
            return getParrentSize(self, value);
        else 
            return null;
    }
    console.log(`Can't convert ${value} to PostScript Point`);
    return null;
}

export function RenderToPDF(template: Template){
  
    const container: HTMLDivElement = document.createElement("div");
    container.className = "pdf_render_node";
    container.style.position = 'absolute';
    document.body.appendChild(container);
    const observer = new MutationObserver((mutations) => {
        console.log("finished rendering pdf as html, convert structure to pdf");
        //setup pdf document
        let doc = new PDFDocument({ autoFirstPage: false });
        const chunks: Uint8Array[] = [];
        //setup writing to buffer
        doc.on('data', (chunk: Uint8Array<ArrayBufferLike>) => chunks.push(chunk));
        doc.on('end', () => {
            const blob = new Blob(chunks as BlobPart[], { type: 'application/pdf' });
            saveAs(blob, 'example.pdf');
        });
        //register fonts
        const fonts = template.GetFontStorage().List();
        for(let i = 0; i < fonts.length; i++){
         //   doc.registerFont(fonts[i].label, fonts[i].url);
        }
        //render html to pdf
        for(let i = 0; i < container.children.length; i++){
           const ret = recursiveFindRotAndCreatePages(container.children.item(i), container, i, doc);
           doc = ret[0];
           if(ret[1]){
                break;
           }
        }
        doc.end();

        console.log("cleaning up the structure")
        observer.disconnect();
        container.remove();
    });
    observer.observe(container, { childList: true });
    const root = createRoot(container);
    root.render(<MantineProvider>
            {template.DrawPaper({
                currentTab: "RENDER_ENGINE",
                pdfRenderer: true
            })}
        </MantineProvider>);

    function recursiveFindRotAndCreatePages(searchElement: Element | null, parrent: Element | null, index: number, pdfDoc: any) : [any, boolean]{
        if(searchElement === null){
            return [pdfDoc, false];
        }else if (searchElement.id === "real_paper"){
            //start rendering pages
            let basePage : HTMLElement = searchElement as HTMLElement;
            const pageDescriptor = {
                width: 0,
                height: 0,
                margin_bottom: 0,
                margin_top: 0,
                margin_left: 0,
                margin_right: 0
            }
            for(let i = index; i < (parrent?.children.length || 0); i++){
                 const element = parrent?.children[i] as HTMLElement;
                 if(element){
                    if(element.id === "real_paper"){
                        basePage = parrent?.children[i] as HTMLElement;
                        pageDescriptor.width = cssScaleToPostScriptPoint(basePage.style.width) || 1;
                        pageDescriptor.height = cssScaleToPostScriptPoint(basePage.style.height) || 1;
                        pageDescriptor.margin_left = cssScaleToPostScriptPoint(basePage.style.paddingLeft) || 0;
                        pageDescriptor.margin_right = cssScaleToPostScriptPoint(basePage.style.paddingRight) || 0;
                        pageDescriptor.margin_top = cssScaleToPostScriptPoint(basePage.style.paddingTop) || 0;
                        //Reconstruct margin bottom
                        let counter = i+1;
                        while (counter < (parrent?.children.length || 0))
                        {
                            const n_element = parrent?.children[counter] as HTMLElement;
                            if(n_element.id === "real_paper"){
                                break;
                            }
                            counter++;
                        }
                        const drawAreaPagesCover = counter - i;
                        const drawAreaHeight = cssScaleToPostScriptPoint((basePage.children[0] as HTMLElement).style.height) || 0; 
                        const add = drawAreaHeight + pageDescriptor.margin_top <= drawAreaPagesCover * pageDescriptor.height ? 0 : 1
                        pageDescriptor.margin_bottom = pageDescriptor.height*(drawAreaPagesCover+add)-pageDescriptor.margin_top-drawAreaHeight;

                        console.log(`Changing page format to width: ${basePage.style.width} height: ${basePage.style.height}`);
                    }else if (element.id !== "paper-container-expand"){
                        i++;
                        continue;
                    }
                    pdfDoc.addPage({size: [pageDescriptor.width, pageDescriptor.height], margins: {top: pageDescriptor.margin_top, bottom: pageDescriptor.margin_bottom, left: pageDescriptor.margin_left, right: pageDescriptor.margin_right}});
                    let elementCounter = 0;
                    const containerElement = basePage.children[0];
                    const textGroup = new StartDrawTextCommand(pageDescriptor.margin_left, pageDescriptor.margin_top, pageDescriptor.width, pageDescriptor.height);
                    for(let i = 0; i < containerElement.childNodes.length; i++){
                        const childNode = containerElement.childNodes.item(i);
                        let childElement = undefined;
                        if(childNode.nodeName !== "#text"){
                            childElement = containerElement.children[elementCounter];
                            elementCounter++;
                            //just render text as child
                        }
                        const node = RenderHTMLNodeRecursive(pdfDoc, basePage, 0,0, pageDescriptor.margin_left, pageDescriptor.margin_top, childNode, containerElement.children[i] as HTMLElement, childElement as HTMLElement);
                        if(node instanceof DrawTextCommand){
                            textGroup.childs.push(node);
                        }
                    }
                    textGroup.Draw(pdfDoc, textGroup.childs);
                    //command.Draw(pdfDoc, null);
                    console.log("Finished Rendering a page");
                }else{
                    break;
                }
            }
            return [pdfDoc, true];
        }else{
            for(let i = 0; i < searchElement.children.length; i++){
                const ret = recursiveFindRotAndCreatePages(searchElement.children.item(i), searchElement, i, pdfDoc);
                pdfDoc = ret[0];
                if(ret[1]){
                    return [pdfDoc, true];
                }
            }
        }
       
        return [pdfDoc, false];
    }
    function GenerateTextCommandFromCSS(style: CSSStyleDeclaration, text: string | null) : DrawTextCommand{
        const command = new DrawTextCommand(text || "Error");
        command.fontSize = Number(style.fontSize.substring(0, style.fontSize.length - 2)) * (72 / 96);
        command.color = style.color;
        command.font = style.fontFamily;
        command.underline = style.textDecoration.includes("underline");
        command.strike = style.textDecoration.includes("line-through");
        command.bold = style.fontWeight === "bold" || Number(style.fontWeight) >= 700;
        return command;
    }
    function RenderHTMLNodeRecursive(pdf: any, page: HTMLElement, xOffset: number, yOffset: number, paddingLeft: number, paddingTop: number, node:ChildNode, parrent: HTMLElement, element?: HTMLElement) : DrawCommand{
        //read/calculate position and size from html dom
        let command : DrawCommand = new SplitCommand();

        if(element){
            const computedStyle = getComputedStyle(element);

            let xPos = cssPixelToPostScriptPoint(element.offsetLeft) + xOffset; 
            let yPos = cssPixelToPostScriptPoint(element.offsetTop) +  yOffset; 

            const transform = convertCSSTransformToPostScriptTransform(element);
            
            const positionCss = computedStyle.getPropertyValue("position");
            switch(positionCss){
                case "static":
                    break;
                case "absolute":
                    xPos = cssScaleToPostScriptPoint(element.style.left, element, "left") || 0 + xOffset + paddingLeft;
                    yPos = cssScaleToPostScriptPoint(element.style.top, element, "top") || 0 + yOffset + paddingTop;
                    if(transform.left && transform.top){
                        xPos += transform.left - paddingLeft;
                        yPos += transform.top - paddingTop;
                    }
                    xOffset = xPos;
                    yOffset = yPos;
                    break;
                case "relative":
                    xPos += cssScaleToPostScriptPoint(computedStyle.left, element, "left") || 0 + (transform.left || 0);
                    yPos += cssScaleToPostScriptPoint(computedStyle.top, element, "top") || 0 + (transform.left || 0);
                    break;
                default:
                    console.log(`Unsuported position ${positionCss}`);
                    break;
            }

            const width = cssPixelToPostScriptPoint(element.offsetWidth);
            const height = cssPixelToPostScriptPoint(element.offsetHeight);
            
            //pdf.rect(xPos, yPos, width, height).stroke();
            //interpret html node type to define what to render:
            //nodes that start a pdf command
            if(element instanceof HTMLParagraphElement){
                //insert text
                command = new StartDrawTextCommand(xPos, yPos, width, height);
            }else if(element instanceof HTMLHeadingElement){
                command = new StartDrawTextCommand(xPos, yPos, width, height);
            }
            else if (element instanceof HTMLAnchorElement){
                command = new StartDrawTextCommand(xPos, yPos, width, height);
            }else if(element instanceof HTMLDivElement){
                //draw if required a box
                
            }else if (element instanceof HTMLTableElement){
                //start drawing table
                //command = new StartDrawTableCommand(xPos, yPos, width, height);
            }else if (element instanceof HTMLTableRowElement){
                console.log("start row");
                //command = new StartDrawRowCommand(xPos, yPos, width, height);
            }else if (element instanceof HTMLTableColElement){
                console.error("collumn elements are currently not supported!");
            }
            else if (element instanceof HTMLTableCellElement){
                console.log("cell element");
                //command = new StartDrawCellCommand(width, height);
            }

            //iterate over all childs recursive
            let elementCounter = 0;
            //iterate over all children and render them
            for(let i = 0; i < element.childNodes.length; i++){
                const childNode = element.childNodes.item(i);
                let childElement = undefined;
                if(childNode.nodeName !== "#text"){
                    //just render text as child
                    childElement = element.children[elementCounter];
                    elementCounter++;
                }
                const childCommand = RenderHTMLNodeRecursive(pdf, page, xOffset, yOffset, 0, 0, childNode, element, childElement as HTMLElement);
                if(command){
                    command.childs.push(childCommand);
                }
            }
        }else{
            if(node.nodeName === "#text"){
                //draw a text
                return GenerateTextCommandFromCSS(getComputedStyle(parrent), node.textContent);
            }else{
                console.log(`Unsupported node ${node}`);
            }
        }
        if(command instanceof GroupCommand){
            const groupCommand = command as GroupCommand;
            //build a straight command list
            const commandList = new Array<DrawCommand>();
            function recursiveBuild(command: DrawCommand){
                if(groupCommand.ShouldKeep(command)){
                    commandList.push(command);
                }
                command.childs.forEach((com) => {
                    recursiveBuild(com);
                });
            }
            command.childs.forEach((child) => {
                recursiveBuild(child);
            });
            //now that we have a simple list, draw it
            console.log(commandList);
            groupCommand.Draw(pdf, commandList);
        }
        return command;
    }
}
interface PostScriptTransform{
    left?: number,
    top?: number,
}
function readTransformValue(transform: string, transformOp: string) : string | null{
    const operationIndex = transform.indexOf(transformOp);
    if(operationIndex === -1){
        return null;
    }
    return transform.substring(operationIndex + transformOp.length + 1, transform.indexOf(")", operationIndex));
}
function convertCSSTransformToPostScriptTransform(node: HTMLElement) : PostScriptTransform {
    const ret : PostScriptTransform = {};
   
    const translate = readTransformValue(node.style.transform, "translate");
    if(translate){
        const splitTransform = translate.split(",");
        const left = cssScaleToPostScriptPoint(splitTransform[0]);
        const top = cssScaleToPostScriptPoint(splitTransform[1]);

        ret.left = left || 0;
        ret.top = top || 0;
    }
    return ret;
}