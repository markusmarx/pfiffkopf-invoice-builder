import { createRoot } from "react-dom/client";
import { Template } from "../types";
import { MantineProvider } from "@mantine/core";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { saveAs } from 'file-saver';

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
    return 1000;
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
                        console.log(`Changing page format to width: ${basePage.style.width} height: ${basePage.style.height} and padding ${basePage.style.padding}`);
                    }else if (element.id !== "paper-container-expand"){
                        i++;
                        continue;
                    }
                    pdfDoc.addPage({size: [pageDescriptor.width, pageDescriptor.height], margin: [0,0,0,0]});
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
    function recursivFindPaperRoot(searchElement: Element | null, parrent: Element | null, index: number, pdfDoc: any) : [any, boolean]{
        if(searchElement === null){
            return [pdfDoc, false];
        }
        if(searchElement.id === "real_paper"){
            //found starting paper, start render procedur
            let basePage : HTMLElement = searchElement as HTMLElement;
            let i = index;
            console.log(i);
            console.log((parrent?.children.length || 0));
            while(i < (parrent?.children.length || 0)){
                const element = parrent?.children[i] as HTMLElement;
                console.log(element);
                i++;
                /*
                if(element){
                    if(element.id === "real_paper"){
                        basePage = parrent?.children[i] as HTMLElement;
                        console.log(basePage.style);
                        console.log(`Changing page format to width: ${basePage.style.width} height: ${basePage.style.height} and padding ${basePage.style.padding}`);
                    }else if (element.id !== "paper-container-expand"){
                        i++;
                        continue;
                    }
                    pdfDoc.addPage({size: [20, 30], margin: [0,0,0,0]});
                }else{
                    break;
                }
                i++;*/
            }
            return [pdfDoc, true];
        }else{
            for(let i = 0; i < searchElement.children.length; i++){
                pdfDoc = recursivFindPaperRoot(searchElement.children.item(i), searchElement, i, pdfDoc);
            }
        }
        return [pdfDoc, false];
    }
}
