/* eslint-disable no-loss-of-precision */
import { createRoot } from "react-dom/client";
import { Template } from "../types";
import { MantineProvider } from "@mantine/core";
import { saveAs } from "file-saver";
import { PDFDocument, PDFKitTextOptions, PDFKitCellOptions } from "../pdf";

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
    this.font = "Arial";
    this.color = "black";
    this.style = {
        stroke: false,
        underline: false,
        strike: false,
        oblique: false,
        characterSpacing: 0,
        wordSpacing: 0,
        lineGap: 0,
        lineBreak: true,
        baseline: "baseline"
    }
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
      pdf.lineWidth(0.4); //emulate bold text, is triggered by enabeling stroke
      if (i === 0) {
        pdf.moveTo(this.x, this.y);
        pdf.text(
          {
            text: textCommand.text,
            x: this.x,
            y: this.y,
            options: {
              ...textCommand.style, 
              continued: commands.length !== 1,
            }
          });
      } else {
        pdf.text(
          {
            text: textCommand.text,
            options: {
              ...textCommand.style, 
              continued: commands.length - 1 !== i,
            }
          });
      }
      pdf.lineWidth(0);
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
        const text = cell.childs.find(x => x instanceof DrawTextCommand);
        if(text){
            row.push({text: text.text || "0", ...cell.cellStyle, textOptions: text.style});
        }else{
            row.push({text: ""});
        }
      }
    }
    //the last row is never ended with a beginn new row marker, so always push the last
    if (row) {
      table.push(row);
    }
    pdf.table({
      position: {x: this.x, y: this.y},
      columnStyles: (collumnIndex : number) => { return {width: collumnSize[collumnIndex]}},
      rowStyles: rowSizes,
      data: table,
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
function cssScaleToPostScriptPoint(
  value: string,
  self?: HTMLElement | null,
  name?: string,
): number | null {
  function percentRecursive(node: HTMLElement, read: string) {
    const percent = Number(read.substring(0, read.length - 1)) / 100;
    if (!node || !name || !node.parentElement) return 0;
    return (
      percent *
      (cssScaleToPostScriptPointWithCallback(
        node.parentElement.style.getPropertyValue(name),
        node.parentElement,
        percentRecursive,
      ) || 1)
    );
  }

  return cssScaleToPostScriptPointWithCallback(value, self, percentRecursive);
}

function cssPixelToPostScriptPoint(value: string): number {
  return cssPixelNumberToPostScriptPoint(Number(value.substring(0, value.length - 2)))
}
function cssPixelNumberToPostScriptPoint(value: number): number {
  return Number(
    ((value / cmToPixels) * 5.6692857142857142857142857142857 * 5).toFixed(2),
  );
}


function cssScaleToPostScriptPointWithCallback(
  value: string,
  self?: HTMLElement | null,
  getParrentSize?: (node: HTMLElement, read: string) => number,
): number | null {
  const without_unit = value.substring(0, value.length - 2);
  if (!value) {
    return null;
  } else if (value.endsWith("cm")) {
    const cmNumber = Number(without_unit);
    return Number(
      (cmNumber * 5.6692857142857142857142857142857 * 5).toFixed(2),
    );
  } else if (value.endsWith("mm")) {
    const mmNumber = Number(without_unit);
    return Number(
      ((mmNumber * 5.6692857142857142857142857142857 * 5) / 100).toFixed(2),
    );
  } else if (value.endsWith("in")) {
    const inchNumber = Number(without_unit);
    return Number(
      (inchNumber * 143.99984905143705330020367170284 * 5).toFixed(2),
    );
  } else if (value.endsWith("pt")) {
    const ptNumber = Number(without_unit);
    return Number(
      ((ptNumber * 143.99984905143705330020367170284 * 5) / 72).toFixed(2),
    );
  } else if (value.endsWith("pc")) {
    const pcNumber = Number(without_unit);
    return Number(
      ((pcNumber * 143.99984905143705330020367170284 * 5) / 6).toFixed(2),
    );
  } else if (value.endsWith("px")) {
    const pxNumber = Number(without_unit);
    return cssScaleToPostScriptPoint((pxNumber / cmToPixels).toFixed(2) + "cm");
  } else if (value.endsWith("%")) {
    if (self && getParrentSize) return getParrentSize(self, value);
    else return null;
  }
  console.log(`Can't convert ${value} to PostScript Point`);
  return null;
}
export function renderToPDF(template: Template) {
  const container: HTMLDivElement = document.createElement("div");
  container.className = "pdf_render_node";
  container.style.position = "absolute";
  document.body.appendChild(container);
  const observer = new MutationObserver((mutations) => {
    console.log("finished rendering pdf as html, convert structure to pdf");
    //setup pdf document
    let doc = new PDFDocument({ autoFirstPage: false });
    const chunks: Uint8Array[] = [];
    //setup writing to buffer
    doc.on("data", (chunk: Uint8Array<ArrayBufferLike>) => chunks.push(chunk));
    doc.on("end", () => {
      const blob = new Blob(chunks as BlobPart[], { type: "application/pdf" });
      saveAs(blob, "example.pdf");
    });
    //register fonts
    const fonts = template.GetFontStorage().List();
    for (let i = 0; i < fonts.length; i++) {
      //   doc.registerFont(fonts[i].label, fonts[i].url);
    }
    //render html to pdf
    for (let i = 0; i < container.children.length; i++) {
      const ret = recursiveFindRotAndCreatePages(
        container.children.item(i),
        container,
        i,
        doc,
      );
      doc = ret[0];
      if (ret[1]) {
        break;
      }
    }
    doc.end();

    console.log("cleaning up the structure");
    observer.disconnect();
    container.remove();
  });
  observer.observe(container, { childList: true });
  const root = createRoot(container);
  root.render(
    <MantineProvider>
      {template.DrawPaper({
        currentTab: "RENDER_ENGINE",
        pdfRenderer: true,
      })}
    </MantineProvider>,
  );

  function recursiveFindRotAndCreatePages(
    searchElement: Element | null,
    parrent: Element | null,
    index: number,
    pdfDoc: PDFDocument,
  ): [PDFDocument, boolean] {
    if (searchElement === null) {
      return [pdfDoc, false];
    } else if (searchElement.id === "real_paper") {
      //start rendering pages
      let basePage: HTMLElement = searchElement as HTMLElement;
      const pageDescriptor = {
        width: 0,
        height: 0,
        margin_bottom: 0,
        margin_top: 0,
        margin_left: 0,
        margin_right: 0,
      };
      for (let i = index; i < (parrent?.children.length || 0); i++) {
        const element = parrent?.children[i] as HTMLElement;
        if (element) {
          if (element.id === "real_paper") {
            basePage = parrent?.children[i] as HTMLElement;
            pageDescriptor.width =
              cssScaleToPostScriptPoint(basePage.style.width) || 1;
            pageDescriptor.height =
              cssScaleToPostScriptPoint(basePage.style.height) || 1;
            pageDescriptor.margin_left =
              cssScaleToPostScriptPoint(basePage.style.paddingLeft) || 0;
            pageDescriptor.margin_right =
              cssScaleToPostScriptPoint(basePage.style.paddingRight) || 0;
            pageDescriptor.margin_top =
              cssScaleToPostScriptPoint(basePage.style.paddingTop) || 0;
            //Reconstruct margin bottom
            let counter = i + 1;
            while (counter < (parrent?.children.length || 0)) {
              const n_element = parrent?.children[counter] as HTMLElement;
              if (n_element.id === "real_paper") {
                break;
              }
              counter++;
            }
            const drawAreaPagesCover = counter - i;
            const drawAreaHeight =
              cssScaleToPostScriptPoint(
                (basePage.children[0] as HTMLElement).style.height,
              ) || 0;
            const add =
              drawAreaHeight + pageDescriptor.margin_top <=
              drawAreaPagesCover * pageDescriptor.height
                ? 0
                : 1;
            pageDescriptor.margin_bottom =
              pageDescriptor.height * (drawAreaPagesCover + add) -
              pageDescriptor.margin_top -
              drawAreaHeight;

            console.log(
              `Changing page format to width: ${basePage.style.width} height: ${basePage.style.height}`,
            );
          } else if (element.id !== "paper-container-expand") {
            i++;
            continue;
          }
          pdfDoc.addPage({
            size: [pageDescriptor.width, pageDescriptor.height],
            margins: {
              top: pageDescriptor.margin_top,
              bottom: pageDescriptor.margin_bottom,
              left: pageDescriptor.margin_left,
              right: pageDescriptor.margin_right,
            },
          });
          let elementCounter = 0;
          const containerElement = basePage.children[0];
          const textGroup = new StartDrawTextCommand(
            pageDescriptor.margin_left,
            pageDescriptor.margin_top,
            pageDescriptor.width,
            pageDescriptor.height,
          );
          for (let i = 0; i < containerElement.childNodes.length; i++) {
            const childNode = containerElement.childNodes.item(i);
            let childElement = undefined;
            if (childNode.nodeName !== "#text") {
              childElement = containerElement.children[elementCounter];
              elementCounter++;
              //just render text as child
            }
            const node = renderHTMLNodeRecursive(
              pdfDoc,
              basePage,
              0,
              0,
              pageDescriptor.margin_left,
              pageDescriptor.margin_top,
              childNode,
              containerElement.children[i] as HTMLElement,
              childElement as HTMLElement,
            );
            if (node instanceof DrawTextCommand) {
              textGroup.childs.push(node);
            }
          }
          textGroup.draw(pdfDoc, textGroup.childs);
          console.log("Finished Rendering a page");
        } else {
          break;
        }
      }
      return [pdfDoc, true];
    } else {
      for (let i = 0; i < searchElement.children.length; i++) {
        const ret = recursiveFindRotAndCreatePages(
          searchElement.children.item(i),
          searchElement,
          i,
          pdfDoc,
        );
        pdfDoc = ret[0];
        if (ret[1]) {
          return [pdfDoc, true];
        }
      }
    }
    return [pdfDoc, false];
  }
  function generateTextCommandFromCSS(
    style: CSSStyleDeclaration,
    text: string | null,
  ): DrawTextCommand {
    const command = new DrawTextCommand(text || "Error");
    command.style = generateTextStyleFromCSS(style);
    command.color = style.color;
    command.font = style.font;
    command.fontSize = Number(style.fontSize.substring(0, style.fontSize.length - 2)) * (72 / 96);
    return command;
  }
  function drawCellCommandFromStyle(style: CSSStyleDeclaration, width: number) : DrawCellCommand{
    const cell = new DrawCellCommand(width);
    const textOptions =  generateTextStyleFromCSS(style);
    console.log(style.backgroundColor);
    cell.cellStyle = {
      textOptions:textOptions,
      //border
      borderColor: style.borderColor,
      font: {size: Number(style.fontSize.substring(0, style.fontSize.length - 2)) * (72 / 96)},
      //backgroundColor: style.backgroundColor,
      align: {x: style.textAlign.replace("middle", "center"), y: style.verticalAlign.replace("middle", "center")},
      textStroke: 0.4,
      textStrokeColor: style.color,
    }; 
    return cell
  }
  function generateTextStyleFromCSS(style: CSSStyleDeclaration) : PDFKitTextOptions{
    return {
        underline: style.textDecoration.includes("underline"),
        strike: style.textDecoration.includes("line-through"),
        stroke: style.fontWeight === "bold" || Number(style.fontWeight) >= 700,
        oblique: style.fontStyle.includes("italic") || style.fontStyle.includes("oblique"),
        wordSpacing: cssPixelToPostScriptPoint(style.wordSpacing),
        characterSpacing: style.letterSpacing.includes("normal") ? undefined : cssPixelToPostScriptPoint(style.letterSpacing),
        lineGap: cssPixelToPostScriptPoint(style.lineHeight) - cssPixelToPostScriptPoint(style.fontSize),
        lineBreak: !style.whiteSpace.includes("nowrap"),
        baseline: style.alignmentBaseline ? style.alignmentBaseline.replace("mathematical", "baseline").replace("central", "baseline").replace("text-top", "top").replace("text-bottom", "bottom") : "baseline",
        align: style.textAlign.replace("start", "left").replace("end", "right"),
        fill: true
      }
  }
  function renderHTMLNodeRecursive(
    pdf: PDFDocument,
    page: HTMLElement,
    xOffset: number,
    yOffset: number,
    paddingLeft: number,
    paddingTop: number,
    node: ChildNode,
    parrent: HTMLElement,
    element?: HTMLElement,
  ): DrawCommand {
    //read/calculate position and size from html dom
    let command: DrawCommand = new SplitCommand();

    if (element) {
      const computedStyle = getComputedStyle(element);

      let xPos = cssPixelNumberToPostScriptPoint(element.offsetLeft) + xOffset;
      let yPos = cssPixelNumberToPostScriptPoint(element.offsetTop) + yOffset;

      const transform = convertCSSTransformToPostScriptTransform(element);

      const positionCss = computedStyle.getPropertyValue("position");
      switch (positionCss) {
        case "static":
          break;
        case "absolute":
          xPos =
            cssScaleToPostScriptPoint(element.style.left, element, "left") ||
            0 + xOffset + paddingLeft;
          yPos =
            cssScaleToPostScriptPoint(element.style.top, element, "top") ||
            0 + yOffset + paddingTop;
          if (transform.left && transform.top) {
            xPos += transform.left - paddingLeft;
            yPos += transform.top - paddingTop;
          }
          xOffset = xPos;
          yOffset = yPos;
          break;
        case "relative":
          xPos +=
            cssScaleToPostScriptPoint(computedStyle.left, element, "left") ||
            0 + (transform.left || 0);
          yPos +=
            cssScaleToPostScriptPoint(computedStyle.top, element, "top") ||
            0 + (transform.left || 0);
          break;
        default:
          console.log(`Unsuported position ${positionCss}`);
          break;
      }

      const width = cssPixelNumberToPostScriptPoint(element.offsetWidth);
      const height = cssPixelNumberToPostScriptPoint(element.offsetHeight);

      //pdf.rect(xPos, yPos, width, height).stroke();
      //interpret html node type to define what to render:
      //nodes that start a pdf command
      if (element instanceof HTMLParagraphElement) {
        //insert text
        command = new StartDrawTextCommand(xPos, yPos, width, height);
      } else if (element instanceof HTMLHeadingElement) {
        command = new StartDrawTextCommand(xPos, yPos, width, height);
      } else if (element instanceof HTMLAnchorElement) {
        command = new StartDrawTextCommand(xPos, yPos, width, height);
      } else if (element instanceof HTMLDivElement) {
        //draw if required a box
      } else if (element instanceof HTMLTableElement) {
        //start drawing table
        command = new StartDrawTableCommand(xPos, yPos, width, height);
      } else if (element instanceof HTMLTableRowElement) {
        command = new DrawRowCommand(height);
      } else if (element instanceof HTMLTableColElement) {
        console.error("collumn elements are currently not supported!");
      } else if (element instanceof HTMLTableCellElement) {
        const cellCommand = drawCellCommandFromStyle(computedStyle, width);
        
        command = cellCommand;
      }

      //iterate over all childs recursive
      let elementCounter = 0;
      //iterate over all children and render them
      for (let i = 0; i < element.childNodes.length; i++) {
        const childNode = element.childNodes.item(i);
        let childElement = undefined;
        if (childNode.nodeName !== "#text") {
          //just render text as child
          childElement = element.children[elementCounter];
          elementCounter++;
        }
        const childCommand = renderHTMLNodeRecursive(
          pdf,
          page,
          xOffset,
          yOffset,
          0,
          0,
          childNode,
          element,
          childElement as HTMLElement,
        );
        if (command) {
          command.childs.push(childCommand);
        }
      }
    } else {
      if (node.nodeName === "#text") {
        //draw a text
        return generateTextCommandFromCSS(
          getComputedStyle(parrent),
          node.textContent,
        );
      } else {
        console.log(`Unsupported node ${node}`);
      }
    }
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
interface PostScriptTransform {
  left?: number;
  top?: number;
}
function readTransformValue(
  transform: string,
  transformOp: string,
): string | null {
  const operationIndex = transform.indexOf(transformOp);
  if (operationIndex === -1) {
    return null;
  }
  return transform.substring(
    operationIndex + transformOp.length + 1,
    transform.indexOf(")", operationIndex),
  );
}
function convertCSSTransformToPostScriptTransform(
  node: HTMLElement,
): PostScriptTransform {
  const ret: PostScriptTransform = {};

  const translate = readTransformValue(node.style.transform, "translate");
  if (translate) {
    const splitTransform = translate.split(",");
    const left = cssScaleToPostScriptPoint(splitTransform[0]);
    const top = cssScaleToPostScriptPoint(splitTransform[1]);

    ret.left = left || 0;
    ret.top = top || 0;
  }
  return ret;
}
