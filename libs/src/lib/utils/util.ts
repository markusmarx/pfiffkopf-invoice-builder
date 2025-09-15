/* eslint-disable no-loss-of-precision */

import { PDFDocument } from '../pdf';
import { PageFormat, WebFont } from '../templates/types';

//generic utils
export async function fetchBuffer(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return buffer;
}
export function cssColorToPDFColor(color: string): string | undefined {
  if (color.startsWith('#')) {
    return color;
  } else if (color.startsWith('rgb')) {
    const rgba = color
      .substring(color.indexOf('(') + 1, color.lastIndexOf(')'))
      .split(',');
    const redHex = Number(rgba[0]).toString(16).padStart(2, '0');
    const greenHex = Number(rgba[1]).toString(16).padStart(2, '0');
    const blueHex = Number(rgba[2]).toString(16).padStart(2, '0');
    if (rgba.length === 4) {
      const alpha = Number(rgba[3]);
      return alpha > 0.5 ? `${redHex}${greenHex}${blueHex}` : undefined;
    } else {
      return `${redHex}${greenHex}${blueHex}`;
    }
  } else if (color.startsWith('hsl')) {
    return undefined;
  } else if (color.startsWith('hsla')) {
    return undefined;
  }
  return color;
}

function getCmInPixels(): number {
  const div = document.createElement('div');
  div.style.width = '1cm';
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  document.body.appendChild(div);

  const pixels = div.getBoundingClientRect().width;
  document.body.removeChild(div);

  return pixels;
}
export const cmToPixels = getCmInPixels();

//css pixel to psp
export function cssPixelToPostScriptPoint(value: string): number {
  return cssPixelNumberToPostScriptPoint(
    Number(value.substring(0, value.length - 2)),
  );
}
export function cssPixelNumberToPostScriptPoint(value: number): number {
  return Number(
    ((value / cmToPixels) * 5.6692857142857142857142857142857 * 5).toFixed(2),
  );
}
export function cssCMToPostScriptPoint(cmNumber: number | undefined) {
  return cmNumber
    ? Number((cmNumber * 5.6692857142857142857142857142857 * 5).toFixed(2))
    : 0;
}
//any unit to psp
export function cssScaleToPostScriptPointWithCallback(
  value: string,
  self?: HTMLElement | null,
  getParrentSize?: (node: HTMLElement, read: string) => number,
): number | null {
  const without_unit = value.substring(0, value.length - 2);
  if (!value) {
    return null;
  } else if (value.endsWith('cm')) {
    const cmNumber = Number(without_unit);
    return Number(
      (cmNumber * 5.6692857142857142857142857142857 * 5).toFixed(2),
    );
  } else if (value.endsWith('mm')) {
    const mmNumber = Number(without_unit);
    return Number(
      ((mmNumber * 5.6692857142857142857142857142857 * 5) / 100).toFixed(2),
    );
  } else if (value.endsWith('in')) {
    const inchNumber = Number(without_unit);
    return Number(
      (inchNumber * 143.99984905143705330020367170284 * 5).toFixed(2),
    );
  } else if (value.endsWith('pt')) {
    const ptNumber = Number(without_unit);
    return Number(
      ((ptNumber * 143.99984905143705330020367170284 * 5) / 72).toFixed(2),
    );
  } else if (value.endsWith('pc')) {
    const pcNumber = Number(without_unit);
    return Number(
      ((pcNumber * 143.99984905143705330020367170284 * 5) / 6).toFixed(2),
    );
  } else if (value.endsWith('px')) {
    const pxNumber = Number(without_unit);
    return cssScaleToPostScriptPoint((pxNumber / cmToPixels).toFixed(2) + 'cm');
  } else if (value.endsWith('%')) {
    if (self && getParrentSize) return getParrentSize(self, value);
    else return null;
  }
  console.log(`Can't convert ${value} to PostScript Point`);
  return null;
}
export function cssScaleToPostScriptPoint(
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
export function cssFontSizeToPostScriptSize(value: string): number {
  return Number(value.substring(0, value.length - 2)) * (72 / 96);
}
export function calculatePageHeight(
  format: PageFormat,
  landscape?: boolean,
  customWidthInCm?: number,
  customHeigthInCm?: number,
): [width: number, height: number] {
  const widths = [customWidthInCm, 59.5, 42, 29.7, 21, 14.8, 10.5];
  const heights = [customHeigthInCm, 84.1, 59.4, 42, 29.7, 21, 14.8];

  const width = (landscape ? heights[format] : widths[format]) || 1;
  const height = (landscape ? widths[format] : heights[format]) || 1;
  return [width, height];
}
export async function checkWebFont(font: WebFont, doc: PDFDocument) {
  if (!doc.isFontRegistered(font.name + 'Embed')) {
    if (!font.file) {
      font.file = await fetchBuffer(font.url);
    }
    doc.embedFont(font.name + 'Embed', font.file);
  }
}
export enum Unit {px, cm, mm, inch}
export function pxToUnit(value: number, unitTo: Unit) : number{
  switch(unitTo){
    case Unit.cm:
      return value / cmToPixels;
    case Unit.inch:
      return value / cmToPixels * 0.393701;
      case Unit.mm:
        return value / cmToPixels * 10;
    default:
      return value;
  }
}
export function pxfromUnit(value: number, unitFrom: Unit) : number{
  switch(unitFrom){
    case Unit.cm:
      return value * cmToPixels;
    case Unit.inch:
      return value / 2.54 * cmToPixels;
      case Unit.mm:
        return value * cmToPixels / 10;
    default:
      return value;
  }
}
export function unitToGermanLanguageString(unit: Unit){
  switch(unit){
    case Unit.cm:
      return "cm";
    case Unit.inch:
      return "Zoll";
    case Unit.mm: 
      return "mm"
    default:
      return "px";
  }
}
export function RoundToTwo(value: number){
  return Number(value.toFixed(2));
}
export async function resolveImageAsBase64(src:string) : Promise<string> {
  if(src.startsWith("data:image/")){
    return src;
  }else{
    if(FileReader){
      const blob = await fetch(src).then((r => r.blob()));
      return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }else{
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if(context){
        context.drawImage(image, 0, 0);
        return canvas.toDataURL();
      }
    } 
  }
  return "";
  
}