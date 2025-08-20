/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pdf from "pdfkit/js/pdfkit.standalone.js";
type sn = string | number
export interface UserPermissions{
  printing?: string;
  modifying: boolean;
  copying: boolean;
  annotating: boolean;
  fillingForms: boolean;
  contentAccessibility: boolean;
  documentAssembly: boolean;
}
export interface PDFKitDocumentConstructorProps{
  autoFirstPage?: boolean;
  info?: PDFKitMetadata;
  userPassword?: string;
  ownerPassword?: string;
  pdfVersion?: string;
  permissions?: UserPermissions;
  subset?: string;
  tagged?: boolean;
}
export interface PDFKitMetadata{
  Title?: string,
  Author?: string,
  Subject?: string,
  Keywords?: string,
  CreationDate?: string,
  ModDate?: string 
}
export interface PDFKitAddPageProps{
  size?: string | number[],
  margins?: {top?: sn, bottom?: sn, left?: sn, right?: sn} | sn,
  fontSize?: number, 
  font?: string,
}
export interface PDFKitBorder{
  top: number,
  right: number,
  bottom: number,
  left: number
}
export interface PDFKitTextOptions{
  lineBreak?: boolean,
  width?: number,
  height?: number,
  rotation?: number,
  ellipsis?: boolean | string,
  columns?: number,
  columnGap?: number,
  indent?: number,
  indentAllLines?: boolean,
  paragraphGap?: number,
  lineGap?: number,
  wordSpacing?: number,
  characterSpacing?: number,
  horizontalScaling?: number,
  fill?: boolean,
  stroke?: boolean,
  link?: string,
  goTo?: string,
  destination?: string,
  underline?: boolean,
  strike ?: boolean,
  oblique?: boolean | number,
  baseline?: string,
  continued?: boolean,
  features?: unknown[],
  align?: string
}
export interface PFFKitTextProps{
  text: string,
  x?: number,
  y?: number,
  options?: PDFKitTextOptions
}
export interface PDFKitCellOptions{
    text?: string,
    padding?: string,
    border?: PDFKitBorder, //pt
    borderColor?: string,
    font?: PDFKitCellFontOptions,
    backgroundColor?: string,
    align?: {x: string, y: string},
    textStroke?: number,
    textStrokeColor?: string,
    textOptions?: PDFKitTextOptions
}
export interface PDFKitCellFontOptions{
  src?: string,
  family?: string,
  size?: number
}
export interface PDFKitTableOptions{
  position?: {x: number, y: number};
  columnStyles: number | number[] | ((collumn: number) => any);
  rowStyles: number | number[] | ((row: number) => any)
  data: string[][] | PDFKitCellOptions[][];
}
export class PDFDocument{
  doc: any;
  public constructor(props: PDFKitDocumentConstructorProps){
    this.doc = new pdf.default(props);
    console.log(this.doc);
  }
  public on(event: string, action: unknown){
    this.doc.on(event, action);
  }
  public end(){
    this.doc.end();
  }
  public addPage(props?: PDFKitAddPageProps){
    this.doc.addPage(props);
  }
  public moveTo(x: number, y: number){
    this.doc.moveTo(x,y);
  }
  //shapes
  public lineWidth(width: number){
    this.doc.lineWidth(width);
  }
  public rect(x: number, y: number, width: number, height: number){
    this.doc.rect(x,y,width, height);
  }
  public stroke(){
    this.doc.stroke();
  }
  
  //text
  public fontSize(size: number){
    this.doc.fontSize(size);
  }
  public text(options?: PFFKitTextProps){
    console.log(options);
    this.doc.text(options?.text, options?.x, options?.y, options?.options);
  }

  //tables
  public table(options?: PDFKitTableOptions){
    this.doc.table(options);
  }
}