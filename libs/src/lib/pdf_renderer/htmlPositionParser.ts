import {
  cssPixelNumberToPostScriptPoint,
  cssScaleToPostScriptPoint,
} from '../utils/util';

export interface PostScriptTransform {
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
    transform.indexOf(')', operationIndex),
  );
}
export function convertCSSTransformToPostScriptTransform(
  node: HTMLElement,
): PostScriptTransform {
  const ret: PostScriptTransform = {};
  const translate = readTransformValue(node.style.transform, 'translate');
  if (translate && translate !== '0px') {
    const splitTransform = translate.split(',');
    if (splitTransform.length === 2) {
      const left = cssScaleToPostScriptPoint(splitTransform[0]);
      const top = cssScaleToPostScriptPoint(splitTransform[1]);
      ret.left = left || 0;
      ret.top = top || 0;
    }
  }
  const matrix = readTransformValue(node.style.transform, 'matrix');
  if (matrix) {
    const splitMatrix = matrix.split(',');
    if (splitMatrix.length === 6) {
      const xMatrix = cssPixelNumberToPostScriptPoint(Number(splitMatrix[4]));
      const yMatrix = cssPixelNumberToPostScriptPoint(Number(splitMatrix[4]));
      ret.left = xMatrix || 0;
      ret.top = yMatrix || 0;
    }
  }
  return ret;
}

export function parsePositionFromHTML(
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration,
  xOffset: number,
  yOffset: number,
  paddingLeft: number,
  paddingTop: number,
) {
  let x = cssPixelNumberToPostScriptPoint(element.offsetLeft) + xOffset;
  let y = cssPixelNumberToPostScriptPoint(element.offsetTop) + yOffset;

  const transform = convertCSSTransformToPostScriptTransform(element);

  const positionCss = computedStyle.getPropertyValue('position');
  switch (positionCss) {
    case 'static':
      break;
    case 'absolute':
      x =
        cssScaleToPostScriptPoint(element.style.left, element, 'left') ||
        0 + xOffset + paddingLeft;
      y =
        cssScaleToPostScriptPoint(element.style.top, element, 'top') ||
        0 + yOffset + paddingTop;
      if (transform.left && transform.top) {
        x += transform.left - paddingLeft;
        y += transform.top - paddingTop;
      }
      xOffset = x;
      yOffset = y;
      break;
    case 'relative':
      if (transform.left !== undefined && transform.top !== undefined) {
        x += transform.left;
        y += transform.top;
      }
      xOffset = x;
      yOffset = y;
      break;
    default:
      console.log(`Unsuported position ${positionCss}`);
      break;
  }
  return {
    width: cssPixelNumberToPostScriptPoint(element.offsetWidth),
    height: cssPixelNumberToPostScriptPoint(element.offsetHeight),
    x,
    y,
    xOffset,
    yOffset,
  };
}
