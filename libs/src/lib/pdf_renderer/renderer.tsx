import { createRoot } from 'react-dom/client';
import {
  FontStorage,
  Template,
  PageProperties,
  DataSet,
} from '../templates/types';
import { PDFDocument, PDFKitDocumentConstructorOptions } from '../pdf';
import { ReactNode } from 'react';
import {
  calculatePageHeight,
  cssCMToPostScriptPoint,
  fetchBuffer,
  resolveImageAsBase64,
} from '../utils/util';
import { parsePositionFromHTML } from './htmlPositionParser';
import { JSX } from 'react/jsx-runtime';
import React from 'react';
import {
  PDFEmbeddedPage,
  PDFDocument as PDFLibDocument,
  PDFName,
  PDFString,
} from 'pdf-lib';
import {
  DrawCommand,
  DrawRowCommand,
  GroupCommand,
  SplitCommand,
  StartDrawImageCommand,
  StartDrawTableCommand,
  StartDrawTextCommand,
} from './pdfCommands';
import {
  drawCellCommandFromStyle,
  generateTextCommandFromCSS,
} from './cssStyleParser';
import { EInvoice, generateEInvoiceXML } from '../e-invoice/e_invoice';
import { PDFHexString } from 'pdf-lib';
//dates need to be in utc timezone
interface PDFADescriptor {
  author: string;
  title: string;
  date: Date;
  version: number;
  conformance: "A" | "B";
}

async function renderHTMLNodeRecursive(
  pdf: PDFDocument,
  storage: FontStorage,
  page: HTMLElement,
  pageIndex: number,
  xOffset: number,
  yOffset: number,
  paddingLeft: number,
  paddingTop: number,
  node: ChildNode,
  parrent: HTMLElement,
  element?: HTMLElement,
): Promise<DrawCommand> {
  //read/calculate position and size from html dom
  let command: DrawCommand = new SplitCommand();

  if (element) {
    const computedStyle = getComputedStyle(element);
    const position = parsePositionFromHTML(
      element,
      computedStyle,
      xOffset,
      yOffset,
      paddingLeft,
      paddingTop,
    );
    xOffset = position.xOffset;
    yOffset = position.yOffset;
    //interpret html node type to define what to render:
    //nodes that start a pdf command
    if (element instanceof HTMLParagraphElement) {
      command = new StartDrawTextCommand(
        position.x,
        position.y - pageIndex,
        position.width,
        position.height,
      );
    } else if (element instanceof HTMLHeadingElement) {
      command = new StartDrawTextCommand(
        position.x,
        position.y - pageIndex,
        position.width,
        position.height,
      );
    } else if (element instanceof HTMLAnchorElement) {
      command = new StartDrawTextCommand(
        position.x,
        position.y - pageIndex,
        position.width,
        position.height,
      );
    } else if (element instanceof HTMLDivElement) {
      //draw if required a box
    } else if (element instanceof HTMLTableElement) {
      command = new StartDrawTableCommand(
        position.x,
        position.y - pageIndex,
        position.width,
        position.height,
      );
    } else if (element instanceof HTMLTableRowElement) {
      command = new DrawRowCommand(position.height);
    } else if (element instanceof HTMLTableColElement) {
      console.error('collumn elements are currently not supported!');
    } else if (element instanceof HTMLTableCellElement) {
      const cell = element as HTMLTableCellElement;
      command = await drawCellCommandFromStyle(
        computedStyle,
        cell,
        position.width,
        pdf,
        storage,
      );
    } else if (element instanceof HTMLImageElement) {
      const image = element as HTMLImageElement;
      command = new StartDrawImageCommand(
        position.x,
        position.y - pageIndex,
        position.width,
        position.height,
        await resolveImageAsBase64(image.src),
      );
    }
    //iterate over all childs recursive
    let elementCounter = 0;
    //iterate over all children and render them
    for (let i = 0; i < element.childNodes.length; i++) {
      const childNode = element.childNodes.item(i);
      let childElement = undefined;
      if (childNode.nodeName !== '#text') {
        childElement = element.children[elementCounter];
        elementCounter++;
      }
      const childCommand = await renderHTMLNodeRecursive(
        pdf,
        storage,
        page,
        pageIndex,
        xOffset,
        yOffset,
        0,
        0,
        childNode,
        element,
        childElement as HTMLElement,
      );
      command.childs.push(childCommand);
    }
  } else {
    if (node.nodeName === '#text') {
      //draw a text
      return await generateTextCommandFromCSS(
        getComputedStyle(parrent),
        node.textContent,
        pdf,
        storage,
      );
    } else {
      console.warn(`Unsupported node ${node}`);
    }
  }
  //rendered all the childs, now in case we have a group, render the commands to the pdf buffer
  if (command instanceof GroupCommand) {
    const groupCommand = command as GroupCommand;
    //build a straight command list
    const commandList = new Array<DrawCommand>();
    function recursiveBuild(command: DrawCommand) {
      if (groupCommand.shouldKeep(command)) {
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
    groupCommand.draw(pdf, commandList);
  }
  return command;
}
type pdfCallback =
  | {
      kind: 'buffer';
      callback: (pdfFile: Uint8Array) =>  unknown;
    }
  | {
      kind: 'pdf';
      callback: (pdfFile: PDFLibDocument) => unknown;
    };
function fireEndPDFCallback(data: PDFLibDocument, callback?: pdfCallback) {
  if (callback) {
    if (callback.kind === 'buffer') {
      data.save().then((buffer) => {
        callback.callback(buffer);
      });
    } else {
      callback.callback(data);
    }
  }
}
export async function renderToPDF(options: {
  template: Template;
  wrapper?: (template: ReactNode) => ReactNode;
  pdfCreationOptions?: PDFKitDocumentConstructorOptions;
  onFinishPDFCreation?: pdfCallback;
  data?: DataSet;
}) {
  //general data
  const fontStorage = options.template.fontStorage;
  //setup pdf document
  const documentPDF = await PDFLibDocument.create({});
  //get jsx elements from template and find pages
  const renderTemplate = options.template.drawPaper({
    currentTab: 'RENDER_PDF',
    pdfRenderer: true,
    dataset: options.data,
  });
  let expectedPages = 0;
  let addedPages = 0;
  const pages =
    renderTemplate instanceof Array
      ? (renderTemplate as JSX.Element[])
      : new Array<JSX.Element>(renderTemplate as JSX.Element);
  for (
    let pagesToRenderIndex = 0;
    pagesToRenderIndex < pages.length;
    pagesToRenderIndex++
  ) {
    const page = pages[pagesToRenderIndex];
    const pageProperties = page.props as PageProperties;
    if (pageProperties) {
      //extract size, margins, ...
      const [width, height] = calculatePageHeight(
        pageProperties.format,
        pageProperties.landscape,
        pageProperties.customWidthInCm,
        pageProperties.customHeigthInCm,
      );
      const pageDescriptor = {
        width: cssCMToPostScriptPoint(width),
        height: cssCMToPostScriptPoint(height),
        margin_bottom: cssCMToPostScriptPoint(pageProperties.borderBottom),
        margin_top: cssCMToPostScriptPoint(pageProperties.borderTop),
        margin_left: cssCMToPostScriptPoint(pageProperties.borderLeft),
        margin_right: cssCMToPostScriptPoint(pageProperties.borderRight),
      };
      let backgroundPDF: null | PDFEmbeddedPage = null;
      let backgroundOffset = { x: 0, y: 0, width: 100, height: 100 };
      //let backgroundDimensions = null;
      if (pageProperties.background && pageProperties.background.doc) {
        const pdfBackground = (
          await PDFLibDocument.load(
            await pageProperties.background.doc.arrayBuffer(),
          )
        ).getPage(0);

        let widthFactor = 1;
        let heigthFactor = 1;
        if (pageProperties.background.pdfArea.width < 100) {
          widthFactor = 100 / pageProperties.background.pdfArea.width;
        }
        if (pageProperties.background.pdfArea.height < 100) {
          heigthFactor = 100 / pageProperties.background.pdfArea.height;
        }
        const transformedPageWidth = pageDescriptor.width * widthFactor;
        const transformedPageHeigth = pageDescriptor.height * heigthFactor;
        backgroundPDF = await documentPDF.embedPage(pdfBackground);
        backgroundOffset = {
          x:
            -(pageProperties.background.pdfArea.x / 100) *
            pageDescriptor.width *
            widthFactor,
          y:
            -(pageProperties.background.pdfArea.y / 100) *
            pageDescriptor.height *
            heigthFactor,
          width: transformedPageWidth,
          height: transformedPageHeigth,
        };
      }

      //render page as html
      const container: HTMLDivElement = document.createElement('div');
      container.className = 'pdf_render_node';
      container.style.position = 'absolute';
      document.body.appendChild(container);
      const observer = new MutationObserver(async () => {
        //render html to pdf
        function findRoot(element: Element): Node | null {
          if (element.id === 'pageIsolator') {
            return element;
          } else {
            for (let i = 0; i < element.children.length; i++) {
              const el = findRoot(element.children[i]);
              if (el) {
                return el;
              }
            }
          }
          return null;
        }
        const page = findRoot(container);
        if (page) {
          const pageCount = page.childNodes.length || 0;
          const pageContainer = (page as HTMLElement)
            .children[0] as HTMLElement;
          for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
            const pdfPage = new PDFDocument({
              ...options.pdfCreationOptions,
              autoFirstPage: false,
            });
            const chunks: Uint8Array[] = [];
            //setup writing to buffer
            pdfPage.on('data', (chunk: Uint8Array<ArrayBufferLike>) =>
              chunks.push(chunk),
            );
            pdfPage.on('end', () => {
              //copy pdfkit array array buffer to buffer array/(flatten buffer)
              let bufferSize = 0;
              chunks.forEach((val) => {
                bufferSize += val.byteLength;
              });
              const arrayData = new Uint8Array(bufferSize);
              let index = 0;
              chunks.forEach((val) => {
                arrayData.set(val, index);
                index += val.byteLength;
              });
              //on end is a non async function, so we need to use callbacks
              //we can't do this directly after generating the page (and use async code),
              // because the data is not directly written after the end call
              PDFLibDocument.load(arrayData).then((load) => {
                const count = load.getPageCount();
                expectedPages += count;
                for (let index = 0; index < count; index++) {
                  documentPDF.embedPage(load.getPage(index)).then((embed) => {
                    const page = documentPDF.addPage([
                      pageDescriptor.width,
                      pageDescriptor.height,
                    ]);
                    //PDF/A Confirmance
                    page.setTrimBox(0, 0, page.getWidth(), page.getHeight());
                    if (backgroundPDF) {
                      console.log(backgroundOffset);
                      page.drawPage(backgroundPDF, {
                        x: backgroundOffset.x,
                        y: backgroundOffset.y,
                        width: backgroundOffset.width,
                        height: backgroundOffset.height,
                      });
                    }
                    page.drawPage(embed);
                    addedPages++;
                    if (addedPages === expectedPages) {
                      fireEndPDFCallback(
                        documentPDF,
                        options.onFinishPDFCreation,
                      );
                    }
                  });
                }
              });
            });
            pdfPage.addPage({
              size: [pageDescriptor.width, pageDescriptor.height],
              margins: {
                bottom: pageDescriptor.margin_bottom,
                left: pageDescriptor.margin_left,
                right: pageDescriptor.margin_right,
                top: pageDescriptor.margin_top,
              },
            });
            //render html to pdf nodes
            let elementIndex = 0;
            for (
              let nodeIndex = 0;
              nodeIndex < pageContainer.childNodes.length;
              nodeIndex++
            ) {
              const node = pageContainer.childNodes[nodeIndex];
              let htmlNode = undefined;
              if (node instanceof HTMLElement) {
                htmlNode = pageContainer.children[elementIndex] as HTMLElement;
                elementIndex++;
              }
              await renderHTMLNodeRecursive(
                pdfPage,
                fontStorage,
                pageContainer,
                pageIndex * pageDescriptor.height,
                0,
                0,
                pageDescriptor.margin_left,
                pageDescriptor.margin_top,
                node,
                pageContainer,
                htmlNode,
              );
            }
            pdfPage.end();
          }
        } else {
          throw 'Critical Error, was not able to find a page beginn inside the html structure!';
        }
        observer.disconnect();
        container.remove();
      });
      observer.observe(container, { childList: true });
      const root = createRoot(container);
      root.render(
        options.wrapper ? (
          options.wrapper(<div id="pageIsolator">{page}</div>)
        ) : (
          <div id="pageIsolator">{page}</div>
        ),
      );
    }
  }
}
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay() + 1}T${date.getHours()}:${date.getMinutes()}:00Z`;
}
export async function generatePDFA(options: {
  template: Template;
  wrapper?: (template: ReactNode) => ReactNode;
  pdfCreationOptions?: PDFKitDocumentConstructorOptions;
  onFinishPDFCreation?: pdfCallback;
  data?: DataSet;
  pdfAData: PDFADescriptor;
}) {
  await renderToPDF({
    template: options.template,
    wrapper: options.wrapper,
    pdfCreationOptions: options.pdfCreationOptions,
    onFinishPDFCreation: {
      kind: 'pdf',
      callback: async (pdf) => {
        //attach pdfa data
        //generate pdf id
        const randomBuffer = crypto.getRandomValues( new Uint8Array(16));
        let documentId = ""; //PDF/A asks for an even number of characters
        randomBuffer.forEach((value) => {
          documentId += value.toString(16).padStart(2, "0");
        });
        const id = PDFHexString.of(documentId);
        pdf.context.trailerInfo.ID = pdf.context.obj([id, id]);
        const iccBuffer = new Uint8Array(await fetchBuffer("sRGB2014.icc"));
        const iccStream = pdf.context.stream(iccBuffer, {
          Length: iccBuffer.length,
          N: 3,
        })
        const outputIntent = pdf.context.obj({
          Type: "OutputIntent",
          S: "GTS_PDFA1",
          OutputConditionIdentifier: PDFString.of("sRGB"),
          DestOutputProfile: pdf.context.register(iccStream),
        })
        const outputIntentRef = pdf.context.register(outputIntent)
        pdf.catalog.set(PDFName.of("OutputIntents"), pdf.context.obj([outputIntentRef]))
        //Native Metadata
        pdf.setAuthor(options.pdfAData.author);
        pdf.setProducer(options.pdfAData.author);
        pdf.setCreator(options.pdfAData.author);
        pdf.setTitle(options.pdfAData.title);
        pdf.setCreationDate(options.pdfAData.date);
        pdf.setModificationDate(options.pdfAData.date);
        //Metadata pdfa
        const metadataXML = `
    <?xpacket begin="" id="${documentId}"?>
      <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26        ">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  
          <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:format>application/pdf</dc:format>
            <dc:creator>
              <rdf:Seq>
                <rdf:li>${options.pdfAData.author}</rdf:li>
              </rdf:Seq>
            </dc:creator>
            <dc:title>
               <rdf:Alt>
                  <rdf:li xml:lang="x-default">${options.pdfAData.title}</rdf:li>
               </rdf:Alt>
            </dc:title>
          </rdf:Description>
  
          <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
            <xmp:CreatorTool>Pfiffkopf</xmp:CreatorTool>
            <xmp:CreateDate>${formatDate(options.pdfAData.date)}</xmp:CreateDate>
            <xmp:ModifyDate>${formatDate(options.pdfAData.date)}</xmp:ModifyDate>
            <xmp:MetadataDate>${formatDate(options.pdfAData.date)}</xmp:MetadataDate>
          </rdf:Description>
  
          <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
            <pdf:Producer>${options.pdfAData.author}</pdf:Producer>
          </rdf:Description>
  
          <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
            <pdfaid:part>${options.pdfAData.version}</pdfaid:part>
            <pdfaid:conformance>${options.pdfAData.conformance}</pdfaid:conformance>
          </rdf:Description>
        </rdf:RDF>
      </x:xmpmeta>
    <?xpacket end="w"?>
    `.trim();
        const metadataStream = pdf.context.stream(metadataXML, {
          Type: 'Metadata',
          Subtype: 'XML',
          Length: metadataXML.length,
        });
        const metadataStreamRef = pdf.context.register(metadataStream);
        pdf.catalog.set(PDFName.of('Metadata'), metadataStreamRef);

        fireEndPDFCallback(pdf, options.onFinishPDFCreation);
      },
    },
    data: options.data as DataSet,
  });
}

export async function generateEInvoice(options: {
  template: Template;
  wrapper?: (template: ReactNode) => ReactNode;
  pdfCreationOptions?: PDFKitDocumentConstructorOptions;
  onFinishPDFCreation?: pdfCallback;
  data: EInvoice;
  pdfAData: PDFADescriptor;
}) {
  const eInvoice = generateEInvoiceXML({
    prepaid: 0,
    data: options.data,
  });
  console.log(eInvoice);
  await renderToPDF({
    template: options.template,
    wrapper: options.wrapper,
    pdfCreationOptions: options.pdfCreationOptions,
    onFinishPDFCreation: {
      kind: 'pdf',
      callback: async (pdf) => {
        const encoder = new TextEncoder();
        pdf.attach(encoder.encode(eInvoice), 'einvoice.xml');
        fireEndPDFCallback(pdf, options.onFinishPDFCreation);
      },
    },
    //pdfAData: options.pdfAData,
    data: options.data as DataSet,
  });
}
