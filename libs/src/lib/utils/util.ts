/* eslint-disable no-loss-of-precision */
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
