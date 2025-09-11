import { PDFDocument, PDFKitTextOptions } from '../pdf';
import { FontStorage } from '../templates/types';
import {
  checkWebFont,
  cssColorToPDFColor,
  cssFontSizeToPostScriptSize,
  cssPixelToPostScriptPoint,
} from '../utils/util';
import { DrawCellCommand, DrawTextCommand } from './pdfCommands';

export async function generateTextCommandFromCSS(
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
export async function drawCellCommandFromStyle(
  style: CSSStyleDeclaration,
  htmlCell: HTMLTableCellElement,
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
      x: style.textAlign.replace('middle', 'center').replace('beginn', 'left').replace('end', 'right'),
      y: style.verticalAlign.replace('middle', 'center'),
    },
    textStroke: 0.4,
    textStrokeColor: style.color,
    rowSpan: htmlCell.rowSpan,
    colSpan: htmlCell.colSpan,
    //padding cuts of the text, so we can't support html padding for now
  };
  return cell;
}

export async function generateTextStyleFromCSS(
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
