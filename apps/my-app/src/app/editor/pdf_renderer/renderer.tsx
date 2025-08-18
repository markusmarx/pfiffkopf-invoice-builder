import { createRoot } from "react-dom/client";
import { Template } from "../types";
import { MantineProvider } from "@mantine/core";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { saveAs } from 'file-saver';
import { stroke, underline } from "pdfkit";
import { URL } from "url";

interface DrawingAreaContext{
    left: number,
    top: number,
    width: number,
    heigth: number,
    paddingTop: number,
    paddingLeft: number,
    position: string
}
interface DrawCommand{
    childs : DrawCommand[];
    Draw(pdf:any, group: DrawStartCommand | null) : void;
}
interface DrawStartCommand{
    width: number;
    heigth: number;
    x: number;
    y: number;
    subCommandCalls: number;
}
class SplitCommand implements DrawCommand{
    childs : DrawCommand[];
    typeIdentifierSplitCommand  = true;
    constructor() {
        this.childs = new Array<DrawTextCommand>(0);
    }
    Draw(pdf: any, group: DrawStartCommand | null): void {
        if(group){
            group.subCommandCalls--;
        }
        this.childs.forEach(element => {
            element.Draw(pdf, group);
        });
    }
}
class DrawTextCommand implements DrawCommand{
    childs : DrawCommand[];    

    //family and size
    fontSize = 11;
    font = "Arial";
    //align
    textAllign = "left";
    //decoration
    color = "black";
    text: string;
    bold = false; //TODO: We need to change the font for that
    underline = false;
    strike = false;
    constructor(text: string){
        this.childs = new Array<DrawTextCommand>(0);
        this.text = text;
    }
    Draw(pdf: any, group: DrawStartCommand | null): void {
        if(group){
            group.subCommandCalls--;
        }

        if(group instanceof StartDrawTextCommand){
            const area = group as StartDrawTextCommand;
            pdf.fontSize(this.fontSize);
            //pdf.font(this.font);
            pdf.text(this.text, area.x, area.y, {width: area.width, height: area.heigth, continued: area.subCommandCalls !== 0, underline: this.underline, strike: this.strike});
        }
        //
        this.childs.forEach(element => {
            element.Draw(pdf, group);
        });
    }
}
class StartDrawTextCommand implements DrawCommand, DrawStartCommand{
    childs : DrawCommand[];
    typeIdentifierStartDrawTextCommand  = true;
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
        this.childs = new Array<DrawTextCommand>(0);
    }
    Draw(pdf: any, group: DrawStartCommand | null): void {
        //
        this.childs.forEach(element => {
            element.Draw(pdf, this);
        });
    }
}
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
                    const command = new SplitCommand();
                    for(let i = 0; i < containerElement.childNodes.length; i++){
                        const childNode = containerElement.childNodes.item(i);
                        let childElement = undefined;
                        if(childNode.nodeName !== "#text"){
                            childElement = containerElement.children[elementCounter];
                            elementCounter++;
                            //just render text as child
                        }
                        command.childs.push(RenderHTMLNodeRecursive(pdfDoc, basePage, 0,0, pageDescriptor.margin_left, pageDescriptor.margin_top, childNode, containerElement.children[i] as HTMLElement, childElement as HTMLElement));
                    }
                    console.log(command);
                    command.Draw(pdfDoc, null);
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
        console.log(`Draw Text ${text}`);
        console.log(style.fontSize);
        const command = new DrawTextCommand(text || "Error");
        command.fontSize = Number(style.fontSize.substring(0, style.fontSize.length - 2)) * (72 / 96);
        console.log(command.fontSize);
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
                const anchor = element as HTMLAnchorElement;
                command = new StartDrawTextCommand(xPos, yPos, width, height);
            }else if(element instanceof HTMLDivElement){
                //draw if required a box
                
            }else if (element instanceof HTMLTableElement){
                //start drawing table
            }
            //nodes who alter a pdf command
            else if (element instanceof HTMLBRElement){
                //start a new line
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
        if(command instanceof StartDrawTextCommand){
            let childCount = 0;
            function recursiveCountChildren(command: DrawCommand){
                command.childs.forEach((com) => {
                    childCount++;
                    recursiveCountChildren(com);
                });
            }
            recursiveCountChildren(command);
            command.subCommandCalls = childCount;
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