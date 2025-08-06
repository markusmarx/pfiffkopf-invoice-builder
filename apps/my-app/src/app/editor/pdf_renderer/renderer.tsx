import { createRoot } from "react-dom/client";
import { Template } from "../types";
import { MantineProvider } from "@mantine/core";
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { saveAs } from 'file-saver';


export function RenderToPDF(template: Template){
  
    const container: HTMLDivElement = document.createElement("div");
    container.className = "pdf_render_node";
    container.style.position = 'absolute';
    //container.style.left = '-9999px';
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
           doc = recursivFindPaper(container.children.item(i), container, doc);
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


    function recursivFindPaper(searchElement: Element | null, parrent: Element | null, index: number, pdfDoc: any) : any{
        if(searchElement === null){
            return pdfDoc;
        }
        if(searchElement.id === "real_paper"){
            //found starting paper, start render procedur
            let basePage : Element = searchElement;
            let i = 0;
            while(i < (parrent?.children.length || 0)){
                const element = parrent?.children[i];
                if(element){
                    if(element.id === "real_paper"){
                        basePage = element.children[i];
                    }
                    pdfDoc.addPage({size: [20, 30], margin: [0,0,0,0]});
                }else{
                    break;
                }
                i++;
            }
        }else{
            for(let i = 0; i < searchElement.children.length; i++){
                pdfDoc = recursivFindPaper(searchElement.children.item(i), searchElement, i, pdfDoc);
            }
        }
        return pdfDoc;
    }
}
