import { PDFDocument, PDFKitCellOptions, PDFKitTextOptions } from '../pdf';

export abstract class DrawCommand {
  childs: DrawCommand[];
  constructor() {
    this.childs = new Array<DrawCommand>();
  }
}
//this tells the drawing system to execute the draw command in all children
export abstract class GroupCommand extends DrawCommand {
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
export class SplitCommand extends DrawCommand {}
export class DrawTextCommand extends DrawCommand {
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
export class StartDrawTextCommand extends GroupCommand {
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
export class StartDrawTableCommand extends GroupCommand {
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
          text: text?.text || '',
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
export class DrawRowCommand extends DrawCommand {
  heigth: number;
  constructor(height: number) {
    super();
    this.heigth = height;
  }
}
export class DrawCellCommand extends DrawCommand {
  width: number;
  cellStyle: PDFKitCellOptions;
  constructor(width: number) {
    super();
    this.width = width;
    this.cellStyle = {};
  }
}
export class StartDrawImageCommand extends GroupCommand{
  image: string;
  override draw(pdf: PDFDocument, commands: Array<DrawCommand>): void {
    pdf.image({image: this.image, x: this.x, y: this.y, options: {
      width: this.width,
      height: this.heigth
    }});
  }
  constructor(x: number, y: number, width: number, heigth: number, src: string){
    super(x,y,width, heigth);
    this.image = src;

  }
  
}
