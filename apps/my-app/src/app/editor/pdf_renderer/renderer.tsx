import { createRoot } from "react-dom/client";
import { Template } from "../types";
import { MantineProvider } from "@mantine/core";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { saveAs } from 'file-saver';

interface DrawingAreaContext{
    left: number,
    top: number,
    width: number,
    heigth: number,
    paddingTop: number,
    paddingLeft: number
}
interface DrawCommand{
    area: DrawingAreaContext,
    childCommands: Array<DrawCommand>
}
interface DrawTextCommand extends DrawCommand{
    bold: boolean,
    underline: boolean
}
interface DrawEmptyCommand extends DrawCommand{
    marker: DrawingAreaContext;
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


function cssScaleToPostScriptPoint(value: string, self?: HTMLElement | null, name?: string) : number{
    function percentRecursive(node: HTMLElement, read: string){
        const percent = Number(read.substring(0, read.length - 1)) / 100;
        console.log(read + " " + percent);
         if(!node || !name || !node.parentElement)
            return 0;
        return percent * cssScaleToPostScriptPointWithCallback(node.parentElement.style.getPropertyValue(name), node.parentElement, percentRecursive);
    }
    
    return cssScaleToPostScriptPointWithCallback(value, self, percentRecursive);
}
function cssScaleToPostScriptPointWithCallback(value: string, self?: HTMLElement | null, getParrentSize?: (node: HTMLElement, read: string) => number) : number{
    const without_unit = value.substring(0, value.length - 2);
    if (!value){
        return 0;
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
            return 0;

        /*const percent = Number(without_unit) / 100;
        if(!self || !name || !self.parentElement)
            return 0;
        return percent * cssScaleToPostScriptPoint(self.parentElement.style.getPropertyValue(name), self.parentElement, name);*/

    }
    console.log(`Can't convert ${value} to PostScript Point`);
    return NaN;
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
                currentTab: "RENDER_ENGINE"
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
                        pageDescriptor.width = cssScaleToPostScriptPoint(basePage.style.width);
                        pageDescriptor.height = cssScaleToPostScriptPoint(basePage.style.height);
                        pageDescriptor.margin_left = cssScaleToPostScriptPoint(basePage.style.paddingLeft);
                        pageDescriptor.margin_right = cssScaleToPostScriptPoint(basePage.style.paddingRight);
                        pageDescriptor.margin_top = cssScaleToPostScriptPoint(basePage.style.paddingTop);
                        //TODO: Reconstruct margin bottom
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
                        const drawAreaHeight = cssScaleToPostScriptPoint((basePage.children[0] as HTMLElement).style.height); 
                        const add = drawAreaHeight + pageDescriptor.margin_top <= drawAreaPagesCover * pageDescriptor.height ? 0 : 1
                        pageDescriptor.margin_bottom = pageDescriptor.height*(drawAreaPagesCover+add)-pageDescriptor.margin_top-drawAreaHeight;

                        console.log(`Changing page format to width: ${basePage.style.width} height: ${basePage.style.height}`);
                    }else if (element.id !== "paper-container-expand"){
                        i++;
                        continue;
                    }
                    pdfDoc.addPage({size: [pageDescriptor.width, pageDescriptor.height], margins: {top: pageDescriptor.margin_top, bottom: pageDescriptor.margin_bottom, left: pageDescriptor.margin_left, right: pageDescriptor.margin_right}});
                    for(let i = 0; i < basePage.children[0].children.length; i++){
                        RenderHTMLNodeRecursive(pdfDoc, basePage, basePage.children[0].children[i] as HTMLElement, {childCommands: new Array<DrawCommand>(), area: {left: 0, top: 0, paddingLeft: pageDescriptor.margin_left, paddingTop: pageDescriptor.margin_top,  width: pageDescriptor.width - pageDescriptor.margin_left - pageDescriptor.margin_right, heigth: pageDescriptor.height - pageDescriptor.margin_bottom - pageDescriptor.margin_top } });
                    }
                    return [pdfDoc, true];
                    console.log("Finish Rendering a page");
                    
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
    function RenderHTMLNodeRecursive(pdf: any, page: HTMLElement, node: HTMLElement, command: DrawCommand) : DrawCommand{
        //render current element
        //nodes that start a pdf command
        if(node instanceof HTMLParagraphElement){
            //insert text
            const paragraph = node as HTMLParagraphElement;
            console.log("Start a paragraph");
        }else if (node instanceof HTMLAnchorElement){
            //insert link
            console.log("Start a anchor");
        }else if(node instanceof HTMLDivElement){
            //change drawing rect
            console.log("Start a div");
            //x-offset,y-offset,width,heigth
            
        }else if (node instanceof HTMLTableElement){
            //start drawing table
        }
        //nodes who alter a pdf command
        else if (node instanceof HTMLBRElement){
            //start a new line
        }
        
        let xPos = cssScaleToPostScriptPoint(node.style.left, node, "left") + command.area.left + command.area.paddingLeft;
        let yPos = cssScaleToPostScriptPoint(node.style.top, node, "top") + command.area.top + command.area.paddingTop;
        const width = cssScaleToPostScriptPoint(node.style.width, node, "width");
        const height = cssScaleToPostScriptPoint(node.style.height, node, "height");
        //calculate transform
        const transform = convertCSSTransformToPostScriptTransform(node);
        if(transform.left && transform.top){
            xPos += transform.left - command.area.paddingLeft;
            yPos += transform.top - command.area.paddingTop;
        }
        console.log(`Resizing drawing area to x: ${xPos} y: ${yPos} width: ${width} height: ${height}`);
        pdf.rect(xPos, yPos, width, height).stroke();
        //iterate over all children and render them
        for(let i = 0; i < node.children.length; i++){
            const area = command.area;
            area.left = xPos;
            area.top = yPos;
            area.width = width;
            area.heigth = height;
            command = RenderHTMLNodeRecursive(pdf, page, node.children[i] as HTMLElement, command);
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

        ret.left = left;
        ret.top = top;
    }
    return ret;
}

