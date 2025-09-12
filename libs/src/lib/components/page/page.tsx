import { useLayoutEffect, useRef, useState } from 'react';
import { PageProperties, RenderableBlockParams } from '../../templates/types';
import { calculatePageHeight, cmToPixels } from '../../utils/util';
import React from 'react';

export function Page(properties: PageProperties) {
  const [width, height] = calculatePageHeight(
    properties.format,
    properties.landscape,
    properties.customWidthInCm,
    properties.customHeigthInCm,
  );

  const [pagesExpandCount, setPageExpandCount] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    //first, reposition and split content
    //if a element is inside the bottom border zone, move it down
    //const usablePixelsPerPage = height - (properties.borderBottom || 0) * cmToPixels - (properties.borderTop || 0) * cmToPixels

    if (properties.children instanceof Array) {
      properties.children.forEach(
        (element) => {
          const movableBox = element.props as RenderableBlockParams;
          if (movableBox) {
            const currentRect = {
              x: movableBox.x,
              y: movableBox.y,
              height: movableBox.heigth || 100,
              width: movableBox.width || 100,
            };
            let hasChangePos = false;
            let hasChangeWidth = false;
            const usableWidth =
              (width -
                (properties.borderRight || 0) -
                (properties.borderLeft || 0)) *
              cmToPixels;
            if (movableBox.stretchToFullWidth) {
              if(currentRect.x !== usableWidth){
                currentRect.width = usableWidth;
                currentRect.x = 0;
                hasChangeWidth = true;
              }
            } else {
              if (currentRect.x) {
                if (usableWidth < currentRect.width + currentRect.x) {
                  const dif = usableWidth - currentRect.width - currentRect.x;
                  currentRect.x += dif;
                  hasChangePos = true;
                }
              }
            }

            if (currentRect.y) {
              if (!properties.autoExpand) {
                const usableHeigth =
                  (height -
                    (properties.borderTop || 0) -
                    (properties.borderBottom || 0)) *
                  cmToPixels;
                if (usableHeigth < currentRect.height + currentRect.y) {
                  const dif = usableHeigth - currentRect.height - currentRect.y;
                  currentRect.y += dif;
                  hasChangePos = true;
                }
              } else {
                const currentPage = Math.ceil(
                  currentRect.y / (height * cmToPixels),
                );
                const threshold =
                  (currentPage * height -
                    (properties.borderTop || 0) -
                    (properties.borderBottom || 0)) *
                  cmToPixels;
                if (
                  currentRect.y > threshold ||
                  (currentRect.y + currentRect.height > threshold &&
                    !movableBox.autoBreakOverMultiplePages)
                ) {
                  if (movableBox.onSubmitPositionChange) {
                    const newYPos =
                      !properties.alwaysBreakToNewPage &&
                      (currentPage * height - (properties.borderTop || 0)) *
                        cmToPixels >
                        currentRect.y + currentRect.height
                        ? (currentPage * height -
                            (properties.borderTop || 0) -
                            (properties.borderBottom || 0)) *
                            cmToPixels -
                          currentRect.height -
                          1 //break up
                        : currentPage * height * cmToPixels; //break down
                    currentRect.y = Math.ceil(newYPos);
                    hasChangePos = true;
                  }
                } else if (
                  movableBox.autoBreakOverMultiplePages &&
                  currentRect.y + currentRect.height > threshold
                ) {
                  console.log('Break over multiple pages');
                  //const remainingHeight = elementHeight -  (threshold - positionY);
                }
              }
            }
            if(hasChangeWidth && movableBox.onSubmitSizeChange){
              movableBox.onSubmitSizeChange(currentRect.height, currentRect.width, movableBox.template, movableBox.templateTab);
            }
            if (hasChangePos && movableBox.onSubmitPositionChange) {
              movableBox.onSubmitPositionChange(
                currentRect.x || 0,
                currentRect.y || 0,
                movableBox.template,
                movableBox.templateTab,
              );
            }
          }
        },
        [properties.children, setPageExpandCount, pagesExpandCount],
      );
    }

    if (properties.autoExpand && properties.children instanceof Array) {
      let pagesRequired = 1;
      properties.children.forEach((element) => {
        const movableBox = element.props as RenderableBlockParams;
        if (movableBox) {
          const top = movableBox.y || 0;
          const elementHeight = movableBox.heigth || 100;
          pagesRequired = Math.max(
            (top + elementHeight) /
              (cmToPixels * (height ? height : Number.EPSILON)),
            pagesRequired,
          );
        }
      });
      pagesRequired = Math.ceil(pagesRequired);
      if (pagesRequired !== pagesExpandCount) {
        setPageExpandCount(pagesRequired);
      }
    }
  }, [
    properties.children,
    cmToPixels,
    height,
    pagesExpandCount,
    properties.alwaysBreakToNewPage,
    properties.autoExpand,
    properties.borderBottom,
    properties.borderTop,
  ]);

  if (properties.render !== undefined && !properties.render) {
    return '';
  }
  const maxWorplaceHeight = properties.autoExpand
    ? (
        (pagesExpandCount + 0.3) * height -
        (properties.borderTop || 0) -
        (properties.borderBottom || 0)
      ).toString() + 'cm'
    : `${pagesExpandCount * height - (properties.borderTop || 0) - (properties.borderBottom || 0)}cm`;

  return (
    <>
      <div
        id="real_paper"
        style={Object.assign(
          {
            minHeight: `${height}cm`,
            maxHeight: `${width}cm`,
            height: `${height}cm`,
            width: `${width}cm`,
            backgroundColor: 'white',
            paddingBottom: properties.autoExpand
              ? '0cm'
              : `${properties.borderBottom || 0}cm`,
            paddingTop: `${properties.borderTop || 0}cm`,
            paddingLeft: `${properties.borderLeft || 0}cm`,
            paddingRight: `${properties.borderRight || 0}cm`,
            backgroundImage: properties.background?.docAsImage
              ? `url(${properties.background.docAsImage})`
              : undefined,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          },
          properties.style,
        )}
      >
        <div
          id="paper-container"
          ref={containerRef}
          style={{
            width: '100%',
            height: `${maxWorplaceHeight}`,
            minHeight: `100%`,
            minWidth: '100%',
          }}
        >
          {properties.children}
        </div>
      </div>
      {[...Array(pagesExpandCount - 1)].map(() => {
        return (
          <div
            id="paper-container-expand"
            style={{
              minHeight: `${height}cm`,
              maxHeight: `${width}cm`,
              height: `${height}cm`,
              width: `${width}cm`,
              backgroundColor: 'white',
              borderTop: 'dashed black',
              backgroundImage: properties.background?.docAsImage
                ? `url(${properties.background.docAsImage})`
                : undefined,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
        );
      })}
    </>
  );
}
