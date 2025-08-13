import { createRoot } from "react-dom/client";
import { Template } from "../types";
import { MantineProvider } from "@mantine/core";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { saveAs } from 'file-saver';

interface DrawingAreaContext{
    left: number,
    top: number,
    width: number,
    heigth: number
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



function cssScaleToPostScriptPoint(value: string) : number{
    const without_unit = value.substring(0, value.length - 2);
    if(value.endsWith("cm")){
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
            const blob = new Blob(chunks, { type: 'application/pdf' });
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
                        RenderPDFPageRecursive(pdfDoc, basePage, basePage.children[0].children[i] as HTMLElement, {childCommands: new Array<DrawCommand>(), area: {left: 0, top: 0, width: 1, heigth: 1 } });
                    }
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
    function RenderPDFPageRecursive(pdf: any, page: HTMLElement, node: HTMLElement, command: DrawCommand) : DrawCommand{
        //render current element
        //nodes who start a pdf command
        if(node instanceof HTMLParagraphElement){
            //insert text
            const paragraph = node as HTMLParagraphElement;
            console.log(paragraph.textContent);
        }else if (node instanceof HTMLAnchorElement){
            //insert link
        }else if(node instanceof HTMLDivElement){
            //change drawing rect
        }else if (node instanceof HTMLTableElement){
            //start drawing table
        }
        //nodes who alter a pdf command
        else if (node instanceof HTMLBRElement){
            //start a new line
        }
        //iterate over all children and render them
        for(let i = 0; i < node.children.length; i++){
            command = RenderPDFPageRecursive(pdf, page, node.children[i] as HTMLElement, command);
        }
        return command;
    }
}
