import { createRoot } from 'react-dom/client';
import {
  FontStorage,
  Template,
  WebFont,
  PageProperties,
} from '../templates/types';
import {
  PDFDocument,
  PDFKitTextOptions,
  PDFKitCellOptions,
  PDFKitDocumentConstructorOptions,
} from '../pdf';
import { ReactNode } from 'react';
import {
  calculatePageHeight,
  cssCMToPostScriptPoint,
  cssColorToPDFColor,
  cssFontSizeToPostScriptSize,
  cssPixelToPostScriptPoint,
  cssScaleToPostScriptPoint,
  fetchBuffer,
} from '../utils/util';
import { parsePositionFromHTML } from './htmlPositionParser';
import { JSX } from 'react/jsx-runtime';
import React from 'react';
import {
  PDFEmbeddedPage,
  PDFDocument as PDFLibDocument,
  StandardFonts,
  rgb,
} from 'pdf-lib';

abstract class DrawCommand {
  childs: DrawCommand[];
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
  constructor(x: number, y: number, width: number, heigth: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.heigth = heigth;
  }
  public shouldKeep(command: DrawCommand) {
    return !(command instanceof SplitCommand);
  }
  abstract draw(pdf: PDFDocument, commands: Array<DrawCommand>): void;
}
//this class is a simple node that get's stripped during drawing but is required to build the pdf command tree
class SplitCommand extends DrawCommand {}
class DrawTextCommand extends DrawCommand {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  style: PDFKitTextOptions;
  constructor(text: string) {
    super();
    this.text = text;
    this.fontSize = 11;
    this.font = 'Arial';
    this.color = 'black';
    this.style = {};
  }
}
class StartDrawTextCommand extends GroupCommand {
  override shouldKeep(command: DrawCommand): boolean {
    return super.shouldKeep(command) && command instanceof DrawTextCommand;
  }
  draw(pdf: PDFDocument, commands: Array<DrawCommand>) {
    for (let i = 0; i < commands.length; i++) {
      const textCommand = commands[i] as DrawTextCommand;
      pdf.fontSize(textCommand.fontSize);
      pdf.font({ fontName: textCommand.font });
      pdf.lineWidth(0.4);
      pdf.text({
        text: textCommand.text,
        x: this.x,
        y: this.y,
        options: {
          ...textCommand.style,
          width: this.width + 1,
          height: this.heigth,
          continued: commands.length - 1 !== i,
        },
      });
    }
  }
}
class StartDrawTableCommand extends GroupCommand {
  draw(pdf: PDFDocument, commands: Array<DrawCommand>): void {
    if (commands.length === 0) {
      //we try to draw a empty table, this shouldn't be visible
      return;
    }

    const table = new Array<Array<PDFKitCellOptions>>(0);
    const collumnSize = new Array<number>(0);
    const rowSizes = new Array<number>(0);
    let row = null;
    for (let i = 0; i < commands.length; i++) {
      if (commands[i] instanceof DrawRowCommand) {
        const drawRow = commands[i] as DrawRowCommand;
        rowSizes.push(drawRow.heigth);
        if (row) {
          table.push(row);
        }
        row = new Array<PDFKitCellOptions>();
      } else if (commands[i] instanceof DrawCellCommand && row) {
        const cell = commands[i] as DrawCellCommand;
        if (table.length === 0) {
          collumnSize.push(cell.width);
        }
        //extract text
        const text = cell.childs.find((x) => x instanceof DrawTextCommand);
        row.push({
          text: text?.text || 'Error, was unable to find text to render!',
          ...cell.cellStyle,
          textOptions: text?.style,
        });
      }
    }
    //the last row is never ended with a beginn new row marker, so always push the last
    if (row) {
      table.push(row);
    }
    pdf.table({
      position: { x: this.x, y: this.y },
      columnStyles: collumnSize,
      rowStyles: rowSizes,
      data: table,
      maxWidth: this.width,
    });
  }
  override shouldKeep(command: DrawCommand): boolean {
    return (
      super.shouldKeep(command) &&
      (command instanceof DrawTextCommand ||
        command instanceof DrawRowCommand ||
        command instanceof DrawCellCommand)
    );
  }
}
class DrawRowCommand extends DrawCommand {
  heigth: number;
  constructor(height: number) {
    super();
    this.heigth = height;
  }
}
class DrawCellCommand extends DrawCommand {
  width: number;
  cellStyle: PDFKitCellOptions;
  constructor(width: number) {
    super();
    this.width = width;
    this.cellStyle = {};
  }
}
async function generateTextCommandFromCSS(
  style: CSSStyleDeclaration,
  text: string | null,
  pdf: PDFDocument,
  storage: FontStorage,
): Promise<DrawTextCommand> {
  const command = new DrawTextCommand(text || 'Error');
  const textOptions = await generateTextStyleFromCSS(style, storage, pdf);
  command.style = textOptions.style;
  command.color = style.color;
  command.font = textOptions.fontFamily;
  command.fontSize = cssFontSizeToPostScriptSize(style.fontSize);
  return command;
}
async function drawCellCommandFromStyle(
  style: CSSStyleDeclaration,
  width: number,
  pdf: PDFDocument,
  storage: FontStorage,
): Promise<DrawCellCommand> {
  const cell = new DrawCellCommand(width);
  const textOptions = await generateTextStyleFromCSS(style, storage, pdf);
  cell.cellStyle = {
    textOptions: textOptions.style,
    border: {
      top: cssPixelToPostScriptPoint(style.borderTopWidth),
      left: cssPixelToPostScriptPoint(style.borderLeftWidth),
      right: cssPixelToPostScriptPoint(style.borderRightWidth),
      bottom: cssPixelToPostScriptPoint(style.borderBottomWidth),
    },
    borderColor: cssColorToPDFColor(style.borderColor),
    font: {
      size: cssFontSizeToPostScriptSize(style.fontSize),
      src: textOptions.fontFamily,
    },
    backgroundColor: cssColorToPDFColor(style.backgroundColor),
    align: {
      x: style.textAlign.replace('middle', 'center'),
      y: style.verticalAlign.replace('middle', 'center'),
    },
    textStroke: 0.4,
    textStrokeColor: style.color,
    //padding cuts of the text, so we can't support html padding for now
  };
  return cell;
}
async function checkWebFont(font: WebFont, doc: PDFDocument) {
  if (!doc.isFontRegistered(font.name + 'Embed')) {
    if (!font.file) {
      font.file = await fetchBuffer(font.url);
    }
    doc.embedFont(font.name + 'Embed', font.file);
  }
}
async function generateTextStyleFromCSS(
  style: CSSStyleDeclaration,
  storage: FontStorage,
  pdf: PDFDocument,
): Promise<{ style: PDFKitTextOptions; fontFamily: string }> {
  const family = storage.getByFamily(style.fontFamily);
  let oblique =
    style.fontStyle.includes('italic') || style.fontStyle.includes('oblique');
  let bold = style.fontWeight === 'bold' || Number(style.fontWeight) >= 700;

  let font = family?.value || 'Helvetica';
  if (family) {
    if (family.boldItalic && bold && oblique) {
      await checkWebFont(family.boldItalic, pdf);
      font = family.boldItalic.name + 'Embed';
      oblique = false;
      bold = false;
    } else if (family.bold && bold && !oblique) {
      await checkWebFont(family.bold, pdf);
      font = family.bold.name + 'Embed';
      bold = false;
    } else if (family.italic && !bold && oblique) {
      await checkWebFont(family.italic, pdf);
      font = family.italic.name + 'Embed';
      oblique = false;
    } else {
      font = family.regular.name + 'Embed';
      await checkWebFont(family.regular, pdf);
    }
  }
  return {
    style: {
      underline: style.textDecoration.includes('underline'),
      strike: style.textDecoration.includes('line-through'),
      stroke: bold,
      oblique: oblique,
      wordSpacing: cssPixelToPostScriptPoint(style.wordSpacing),
      characterSpacing: style.letterSpacing.includes('normal')
        ? undefined
        : cssPixelToPostScriptPoint(style.letterSpacing),
      lineGap:
        cssPixelToPostScriptPoint(style.lineHeight) -
        cssPixelToPostScriptPoint(style.fontSize),
      lineBreak: !style.whiteSpace.includes('nowrap'),
      baseline: style.alignmentBaseline
        ? style.alignmentBaseline
            .replace('mathematical', 'baseline')
            .replace('central', 'baseline')
            .replace('text-top', 'top')
            .replace('text-bottom', 'bottom')
        : 'baseline',
      align: style.textAlign.replace('start', 'left').replace('end', 'right'),
      fill: true,
    },
    fontFamily: font,
  };
}
export async function renderToPDF(options: {
  template: Template;
  wrapper?: (template: ReactNode) => ReactNode;
  pdfCreationOptions?: PDFKitDocumentConstructorOptions;
  onFinishPDFCreation?: (pdfFile: Uint8Array) => unknown;
}) {
  //general data
  const fontStorage = options.template.fontStorage;
  //setup pdf document
  const documentPDF = await PDFLibDocument.create({});
  //get jsx elements from template and find pages
  const renderTemplate = options.template.drawPaper({
    currentTab: 'RENDER_PDF',
    pdfRenderer: true,
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
          expectedPages += pageCount;
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
                documentPDF.embedPage(load.getPage(0)).then((embed) => {
                  const page = documentPDF.addPage([
                    pageDescriptor.width,
                    pageDescriptor.height,
                  ]);
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
                    documentPDF.save().then((buffer) => {
                      if (options.onFinishPDFCreation) {
                        options.onFinishPDFCreation(buffer);
                      }
                    });
                  }
                });
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
        command = await drawCellCommandFromStyle(
          computedStyle,
          position.width,
          pdf,
          storage,
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
}
