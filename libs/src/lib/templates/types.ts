import { JSX, ReactElement, ReactNode } from 'react';

export interface TemplateDrawProperties {
  currentTab: string;
  pdfRenderer: boolean;
  templateValuesChanged?: () => void;
}

export interface TemplateTabDrawProperties {
  currentTab: string;
  template: Template;
  isMobile: boolean;
}

export abstract class Template {
  fontStorage: FontStorage;
  constructor() {
    this.fontStorage = new FontStorage();
  }

  private refreshUI?: () => void;
  private refreshView?: () => void;

  public abstract drawPaper(
    prop: TemplateDrawProperties,
  ): JSX.Element | Array<JSX.Element>;

  public getFontStorage() {
    return this.fontStorage;
  }

  public redrawProperties() {
    if (this.refreshUI) {
      this.refreshUI();
    }
  }

  public setDataProperties(refreshUI: () => void) {
    this.refreshUI = refreshUI;
  }

  public redrawView() {
    if (this.refreshView) {
      this.refreshView();
    }
  }

  public setDataView(refreshView: () => void) {
    this.refreshView = refreshView;
  }
}

export abstract class TemplateTab {
  public drawUI?: (properties: TemplateTabDrawProperties) => JSX.Element;

  public abstract get id(): string;
  public abstract get displayName(): string;
  public abstract get shortDisplayName(): string;
  public abstract get description(): string;
  public abstract get pageNumbers(): number | number[];

  private refreshUI?: () => void;

  public redrawProperties() {
    if (this.refreshUI) {
      this.refreshUI();
    }
  }

  public setDataProperties(refreshUI: () => void) {
    this.refreshUI = refreshUI;
  }
}

export interface ViewProperties {
  template: Template;
  currentPage: number;
  currentSelectedPropertiesTab?: string | null;
  onValueChanged?: () => void;
}

export interface TableEntry {
  accessor: string;
  label: string;
  enabled?: boolean;
  width?: number;
}

export class TableData {
  public tableEntries: TableEntry[];

  constructor(data: TableEntry[], width: number) {
    this.tableEntries = data;
    this.tableEntries.forEach((element) => {
      element.enabled = true;
      element.width = width / this.tableEntries.length;
    });
  }

  public dynamicTable() {
    return {
      header:
        this.tableEntries.map((v) => {
          if (v.enabled) {
            return v;
          }
          return null;
        }) || [],
      onTableResize: (
        delta: number,
        accesor: string,
        template?: Template,
        tab?: TemplateTab,
      ) => {
        this.tableEntries.forEach((element) => {
          if (element.accessor === accesor) {
            if (element.width) {
              element.width += delta;
            } else {
              element.width = 100;
            }
          }
        });
        template?.redrawView();
        tab?.redrawProperties();
      },
    };
  }
}
export interface Vector {
  x: number;
  y: number;
}
export class DragVector implements Vector {
  public x = 0;
  public y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public dragPos() {
    return {
      onDrag: (x: number, y: number, tab?: TemplateTab) => {
        this.x = x;
        this.y = y;
        tab?.redrawProperties();
      },
      onSubmitPositionChange: (
        x: number,
        y: number,
        template?: Template,
        tab?: TemplateTab,
      ) => {
        this.x = x;
        this.y = y;
        tab?.redrawProperties();
        template?.redrawView();
      },
      x: this.x,
      y: this.y,
    };
  }

  public getInputPropsX(template?: Template) {
    return {
      value: this.x,
      onChange: (v: string | number) => {
        this.x = v as number;
        template?.redrawView();
      },
    };
  }

  public getInputPropsY(template?: Template) {
    return {
      value: this.y,
      onChange: (v: string | number) => {
        this.y = v as number;
        template?.redrawView();
      },
    };
  }

  public dragSize() {
    return {
      onResize: (x: number, y: number, tab?: TemplateTab) => {
        this.x = x;
        this.y = y;
        tab?.redrawProperties();
      },
      onSubmitSizeChange: (
        x: number,
        y: number,
        template?: Template,
        tab?: TemplateTab,
      ) => {
        this.x = x;
        this.y = y;
        tab?.redrawProperties();
        template?.redrawView();
      },
      width: this.x,
      heigth: this.y,
    };
  }
}
export interface WebFont {
  name: string;
  url: string;
  file?: ArrayBuffer;
}
export interface FontStorageEntry {
  value: string; //font family
  label: string;
  regular: WebFont;
  bold?: WebFont;
  italic?: WebFont;
  boldItalic?: WebFont;
}
export class FontSelector {
  private fontFace: string;
  private storage: FontStorage;
  constructor(storage: FontStorage) {
    this.storage = storage;
    this.fontFace = storage.getDefault();
  }
  public family(): string {
    return this.fontFace;
  }
  public set(font: string) {
    this.fontFace = font;
  }
  public tryUpload(
    file: File,
    displayName?: string,
    id?: string,
    onSucces?: (fontName: string) => void,
    onFail?: (error: Error) => void,
  ) {
    const promise = this.storage.loadCustomFontFromFile(file, displayName, id);
    promise.then(
      (value) => {
        this.fontFace = value;
        if (onSucces) {
          onSucces(this.fontFace);
        }
      },
      (error) => {
        if (onFail) {
          onFail(error);
        }
      },
    );
  }
  public getList() {
    return this.storage.list();
  }
}
const SYSTEM_FONT = 'Helvetica';
export class FontStorage {
  private fontFace: string;
  private customFont: null | FontFace;
  private fonts: FontStorageEntry[];
  constructor() {
    this.customFont = null;
    this.fontFace = SYSTEM_FONT;
    this.fonts = Array<FontStorageEntry>();
    const testFontUrl =
      'https://raw.githubusercontent.com/coderiver/cubitssuperlanding/master/css/fonts/Helvetica-Regular.ttf';
    this.fonts.push({
      value: 'Courier',
      label: 'Courier',
      regular: {
        name: 'Courier',
        url: testFontUrl,
      },
      /*postScriptName: "Courier",
      boldVersion: "Courier-Bold",
      italicVersion: "Courier-Oblique",
      boldItalicVersion: "Courier-BoldOblique",*/
    });
    this.fonts.push({
      value: 'Helvetica',
      label: 'Helvetica',
      regular: {
        name: 'Helvetica',
        url: testFontUrl,
      },

      bold: {
        name: 'Helvetica-Bold',
        url: testFontUrl,
      },
      /*postScriptName: "Helvetica",
      boldVersion: "Helvetica-Bold",
      italicVersion: "Helvetica-Oblique",
      boldItalicVersion: "Helvetica-BoldOblique",*/
    });
    this.fonts.push({
      value: 'Times-Roman',
      label: 'Times-Roman',
      regular: {
        name: 'Times-Roman',
        url: testFontUrl,
      },
      /*
      boldVersion: "Times-Bold",
      italicVersion: "Times-Italic",
      boldItalicVersion: "Times-BoldItalic",
      */
    });
  }
  public getDefault(): string {
    return SYSTEM_FONT;
  }

  public list() {
    return this.fonts;
  }
  public async crawlFromURL(
    fontURL: string,
    displayName: string,
    id: string,
  ): Promise<string> {
    if (this.fonts.find((x) => x.value === id)) {
      return Promise.reject('Font already upploaded');
    }

    const fontFace = new FontFace(displayName, `url(${fontURL})`);
    try {
      await fontFace.load();
      await (document.fonts as any).add(fontFace);
      this.fonts.push({
        value: id,
        label: displayName,
        regular: { name: id, url: fontURL },
      });
      return Promise.resolve(id);
    } catch (error) {
      console.error('An error is occured loading a font!');
      this.fontFace = SYSTEM_FONT;
      return Promise.reject(error);
    }
  }
  public setCSSFont(fontName: string) {
    this.fontFace = fontName;
    if (this.customFont) {
      (document.fonts as any).delete(this.customFont);
    }
  }
  public getByFamily(family: string) {
    return this.fonts.find((x) => x.value === family);
  }

  public loadCustomFontFromFile(
    file: File,
    displayName?: string,
    id?: string,
  ): Promise<string> {
    const fontURL = URL.createObjectURL(file);
    return this.crawlFromURL(
      fontURL,
      displayName || file.name,
      id || file.name,
    );
  }
}

export interface RenderableBlockParams {
  template?: Template;
  templateTab?: TemplateTab;
  id: string;
  enabled?: boolean;
  className?: string;
  children?: ReactNode;
  //size
  width?: number;
  heigth?: number;
  renderingBlocks?: Array<number>;
  enableResizing?: boolean;
  autoBreakOverMultiplePages?: boolean;
  onResize?: (xSize: number, ySize: number, tab?: TemplateTab) => void;
  onSubmitSizeChange?: (
    ySize: number,
    xSize: number,
    template?: Template,
    tab?: TemplateTab,
  ) => void;
  //position
  x?: number;
  y?: number;
  disableMovement?: boolean;
  onDrag?: (xPos: number, yPos: number, tab?: TemplateTab) => void;
  onSubmitPositionChange?: (
    xPos: number,
    yPos: number,
    template?: Template,
    tab?: TemplateTab,
  ) => void;
}
export class BackgroundPDF {
  doc: null | File;
  docAsImage: null | string;
  pdfArea: { x: number; y: number; width: number; height: number };
  imgArea: { x: number; y: number; width: number; height: number };
  constructor() {
    this.doc = null;
    this.docAsImage = null;
    this.pdfArea = { x: 0, y: 0, height: 0, width: 0 };
    this.imgArea = { x: 0, y: 0, height: 0, width: 0 };
  }
}
export enum PageFormat {
  Custom = 0,
  A1 = 1,
  A2 = 2,
  A3 = 3,
  A4 = 4,
  A5 = 5,
  A6 = 6,
}
export interface PageProperties {
  autoExpand?: boolean;
  alwaysBreakToNewPage?: boolean;
  format: PageFormat;
  landscape?: boolean;
  customWidthInCm?: number;
  customHeigthInCm?: number;
  children?: ReactElement | ReactElement[];
  render?: boolean;
  borderLeft?: number;
  borderRight?: number;
  borderTop?: number;
  borderBottom?: number;
  style?: React.CSSProperties;
  background?: BackgroundPDF;
}
