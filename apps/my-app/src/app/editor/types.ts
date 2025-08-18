import { JSX, ReactNode } from "react";

export interface TemplateDrawProperties {
  currentTab: string;
  pdfRenderer: boolean;
  templateValuesChanged?: () => void;
}

export interface TemplateTabDrawProperties {
  currentTab: string;
  edited: boolean;
  template: Template;
}

export abstract class Template {
  fontStorage: FontStorage;
  constructor(){
    this.fontStorage = new FontStorage();
  }

  private refreshUI?: () => void;
  private refreshView?: () => void;

  public abstract DrawPaper(
    prop: TemplateDrawProperties,
  ): JSX.Element | Array<JSX.Element>;

  public GetFontStorage(){
    return this.fontStorage;
  }

  public RedrawProperties() {
    if (this.refreshUI) {
      this.refreshUI();
    }
  }

  public SetDataProperties(refreshUI: () => void) {
    this.refreshUI = refreshUI;
  }

  public RedrawView() {
    if (this.refreshView) {
      this.refreshView();
    }
  }

  public SetDataView(refreshView: () => void) {
    this.refreshView = refreshView;
  }
}

export abstract class TemplateTab {
  public drawUI?: (properties: TemplateTabDrawProperties) => JSX.Element;

  public abstract DisplayName(): string;

  public abstract PageNumbers(): number | number[];

  private refreshUI?: () => void;

  public RedrawProperties() {
    if (this.refreshUI) {
      this.refreshUI();
    }
  }

  public SetDataProperties(refreshUI: () => void) {
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

  public DynamicTable() {
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
        template?.RedrawView();
        tab?.RedrawProperties();
      },
    };
  }
}

export class DragVector {
  public x = 0;
  public y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public DragPos() {
    return {
      onDrag: (x: number, y: number, tab?: TemplateTab) => {
        this.x = x;
        this.y = y;
        tab?.RedrawProperties();
      },
      onSubmitPositionChange: (
        x: number,
        y: number,
        template?: Template,
        tab?: TemplateTab,
      ) => {
        this.x = x;
        this.y = y;
        tab?.RedrawProperties();
        template?.RedrawView();
      },
      posVector: this,
    };
  }

  public getInputPropsX(template?: Template) {
    return {
      value: this.x,
      onChange: (v: string | number) => {
        this.x = v as number;
        template?.RedrawView();
      },
    };
  }

  public getInputPropsY(template?: Template) {
    return {
      value: this.y,
      onChange: (v: string | number) => {
        this.y = v as number;
        template?.RedrawView();
      },
    };
  }

  public DragSize() {
    return {
      onResize: (x: number, y: number, tab?: TemplateTab) => {
        this.x = x;
        this.y = y;
        tab?.RedrawProperties();
      },
      onSubmitSizeChange: (
        x: number,
        y: number,
        template?: Template,
        tab?: TemplateTab,
      ) => {
        this.x = x;
        this.y = y;
        tab?.RedrawProperties();
        template?.RedrawView();
      },
      sizeVector: this,
    };
  }
}

export interface FontStorageEntry {
  value: string;
  label: string;
  customUpload?: FontFace;
}
export class FontSelector {
  private fontFace: string;
  private storage: FontStorage;
  constructor(storage: FontStorage) {
    this.storage = storage;
    this.fontFace = storage.GetDefault();
  }
  public Family(): string {
    return this.fontFace;
  }
  public Set(font: string) {
    this.fontFace = font;
  }
  //TODO: Rewrite as promise
  public TryUpload(file: File, displayName?: string, id?: string, onSucces?: (fontName: string) => void, onFail?: (error: Error) => void) {
    const promise = this.storage.LoadCustomFontFromFile(file, displayName, id);
    promise.then(
      (value) => {
        this.fontFace = value;
        if(onSucces){
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
  public GetList() {
    return this.storage.List();
  }
}
const SYSTEM_FONT = "Arial";
export class FontStorage {
  private fontFace: string;
  private customFont: null | FontFace;
  private fonts: FontStorageEntry[];
  constructor() {
    this.customFont = null;
    this.fontFace = SYSTEM_FONT;
    this.fonts = Array<FontStorageEntry>();
    this.fonts.push({
      value: SYSTEM_FONT,
      label: SYSTEM_FONT,
    });
  }
  public GetDefault(): string {
    return SYSTEM_FONT;
  }

  public List() {
    return this.fonts;
  }
  public async CrawlFromURL(fontURL: string, displayName: string, id: string): Promise<string> {
    if(this.fonts.find(x => x.value === id)){
      return Promise.reject("Font already upploaded");
    }

    const fontFace = new FontFace(displayName, `url(${fontURL})`);
    console.log(fontFace);
    try {
      await fontFace.load();
      await (document.fonts as any).add(fontFace);
      this.fonts.push({ value: id, label: displayName });
      return Promise.resolve(id);
    } catch (error) {
      console.error("An error is occured!");
      this.fontFace = SYSTEM_FONT;
      return Promise.reject(error);
    }
  }
  public SetCSSFont(fontName: string) {
    this.fontFace = fontName;
    if (this.customFont) {
      (document.fonts as any).delete(this.customFont);
    }
  }

  public LoadCustomFontFromFile(file: File, displayName?: string, id?: string): Promise<string> {
    const fontURL = URL.createObjectURL(file);
    return this.CrawlFromURL(fontURL, displayName || file.name, id || file.name);
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
  sizeVector?: DragVector;
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
  posVector?: DragVector;
  disableMovement?: boolean;
  onDrag?: (xPos: number, yPos: number, tab?: TemplateTab) => void;
  onSubmitPositionChange?: (
    xPos: number,
    yPos: number,
    template?: Template,
    tab?: TemplateTab,
  ) => void;
}
