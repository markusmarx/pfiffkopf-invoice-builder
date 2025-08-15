import {JSX, ReactNode} from "react";

export interface TemplateDrawProperties {
  currentTab: string,
  templateValuesChanged?: () => void
}

export interface TemplateTabDrawProperties {
  currentTab: string,
  edited: boolean,
  template: Template
}

export abstract class Template {
  private refreshUI?: () => void;
  private refreshView?: () => void;

  public abstract DrawPaper(prop: TemplateDrawProperties): JSX.Element | Array<JSX.Element>;

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
  enabled?: boolean,
  width?: number
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
      header: this.tableEntries.map((v) => {
        if (v.enabled) {
          return v;
        }
        return null;
      }) || [],
      onTableResize: (delta: number, accesor: string, template?: Template, tab?: TemplateTab) => {
        this.tableEntries.forEach(element => {
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
      }
    }
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
      onSubmitPositionChange: (x: number, y: number, template?: Template, tab?: TemplateTab) => {
        this.x = x;
        this.y = y;
        tab?.RedrawProperties();
        template?.RedrawView();
      },
      posVector: this,
    }
  }

  public getInputPropsX(template?: Template) {
    return {
      value: this.x,
      onChange: (v: string | number) => {
        this.x = v as number;
        template?.RedrawView();
      }
    };
  }

  public getInputPropsY(template?: Template) {
    return {
      value: this.y,
      onChange: (v: string | number) => {
        this.y = v as number;
        template?.RedrawView();
      }
    };
  }

  public DragSize() {
    return {
      onResize: (x: number, y: number, tab?: TemplateTab) => {
        this.x = x;
        this.y = y;
        tab?.RedrawProperties();
      },
      onSubmitSizeChange: (x: number, y: number, template?: Template, tab?: TemplateTab) => {
        this.x = x;
        this.y = y;
        tab?.RedrawProperties();
        template?.RedrawView();
      },
      sizeVector: this,
    }
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
    tab?: TemplateTab
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
    tab?: TemplateTab
  ) => void;
}
