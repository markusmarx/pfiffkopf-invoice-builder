/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pdf from 'pdfkit/js/pdfkit.standalone.js';
type sn = string | number;
export interface PDFKitUserPermissions {
  printing?: string;
  modifying: boolean;
  copying: boolean;
  annotating: boolean;
  fillingForms: boolean;
  contentAccessibility: boolean;
  documentAssembly: boolean;
}
export interface PDFKitDocumentConstructorOptions {
  autoFirstPage?: boolean;
  info?: PDFKitMetadata;
  userPassword?: string;
  ownerPassword?: string;
  pdfVersion?: PDFKitPDFVersion;
  permissions?: PDFKitUserPermissions;
  subset?: PDFKitPDFSubset;
  tagged?: boolean;
}
export interface PDFKitMetadata {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  CreationDate?: string;
  ModDate?: string;
}
export interface PDFKitAddPageProps {
  size?: string | number[];
  margins?: PDFKitSide | sn;
  fontSize?: number;
  font?: string;
}
export interface PDFKitSide {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
export interface PDFKitTextOptions {
  lineBreak?: boolean;
  width?: number;
  height?: number;
  rotation?: number;
  ellipsis?: boolean | string;
  columns?: number;
  columnGap?: number;
  indent?: number;
  indentAllLines?: boolean;
  paragraphGap?: number;
  lineGap?: number;
  wordSpacing?: number;
  characterSpacing?: number;
  horizontalScaling?: number;
  fill?: boolean;
  stroke?: boolean;
  link?: string;
  goTo?: string;
  destination?: string;
  underline?: boolean;
  strike?: boolean;
  oblique?: boolean | number;
  baseline?: string;
  continued?: boolean;
  features?: unknown[];
  align?: string;
}
export interface PFFKitTextProps {
  text: string;
  x?: number;
  y?: number;
  options?: PDFKitTextOptions;
}
export interface PDFKitCellOptions {
  text?: string;
  colSpan?: number,
  rowSpan?: number,
  padding?: PDFKitSide | sn;
  border?: PDFKitSide | sn; //pt
  borderColor?: string;
  font?: PDFKitCellFontOptions;
  backgroundColor?: string;
  align?: { x: string; y: string };
  textStroke?: number;
  textStrokeColor?: string;
  textOptions?: PDFKitTextOptions;
}
export interface PDFKitCellFontOptions {
  src?: string;
  family?: string;
  size?: number;
}
export interface PDFKitTableOptions {
  position?: { x: number; y: number };
  maxWidth?: number;
  columnStyles?: number | number[] | ((collumn: number) => any);
  rowStyles?: number | number[] | ((row: number) => any);
  data: (PDFKitCellOptions | string)[][];
}
export interface PDFKitSetFontProps {
  fontName: string;
  fontFile?: string;
}
export enum PDFKitPDFVersion {
  oneDThree = '1.3',
  oneDFour = '1.4',
  oneDFive = '1.5',
  oneDSix = '1.6',
  oneDSeven = '1.7',
  oneDSevenExtThree = '1.7ext3',
}
export enum PDFKitPDFSubset {
  pdfA_one = 'PDF/A-1',
  pdfA_oneA = 'PDF/A-1a',
  pdfA_oneB = 'PDF/A-1b',
  pdfA_two = 'PDF/A-2',
  pdfA_twoA = 'PDF/A-2a',
  pdfA_twoB = 'PDF/A-2b',
  pdfA_three = 'PDF/A-3',
  pdfA_threeA = 'PDF/A-3a',
  pdfA_threeB = 'PDF/A-3b',
}

export class PDFDocument {
  doc: any;
  registeredFonts: string[];
  public constructor(props: PDFKitDocumentConstructorOptions) {
    this.doc = new pdf.default(props);
    this.registeredFonts = new Array<string>();
  }
  public on(event: string, action: unknown) {
    this.doc.on(event, action);
    return this;
  }
  public end() {
    this.doc.end();
    return this;
  }
  public addPage(props?: PDFKitAddPageProps) {
    this.doc.addPage(props);
    return this;
  }
  public moveTo(x: number, y: number) {
    this.doc.moveTo(x, y);
    return this;
  }
  //shapes
  public lineWidth(width: number) {
    this.doc.lineWidth(width);
    return this;
  }
  public rect(x: number, y: number, width: number, height: number) {
    this.doc.rect(x, y, width, height);
    return this;
  }
  public stroke() {
    this.doc.stroke();
    return this;
  }
  //font
  public embedFont(id: string, file: string | BufferSource, fontName?: string) {
    this.doc.registerFont(id, file, fontName);
    this.registeredFonts.push(id);
    return this;
  }

  public isFontRegistered(fontFamily: string) {
    return this.registeredFonts.includes(fontFamily);
  }
  //text
  public fontSize(size: number) {
    this.doc.fontSize(size);
    return this;
  }
  public font(options: PDFKitSetFontProps) {
    if (options.fontFile) {
      this.doc.font(options.fontFile, options.fontName);
    } else {
      this.doc.font(options.fontName);
    }
    return this;
  }
  public text(options?: PFFKitTextProps) {
    this.doc.text(options?.text, options?.x, options?.y, options?.options);
    return this;
  }

  //tables
  public table(options?: PDFKitTableOptions) {
    this.doc.table(options);
    return this;
  }
}
