import { RenderableBlockParams } from '../../templates/types';
import { BaseMovableBox } from '../baseMovable';

export function MovableBox(properties: RenderableBlockParams) {
  return (
    <BaseMovableBox
      template={properties.template}
      templateTab={properties.templateTab}
      id={properties.id}
      enabled={properties.enabled}
      className={properties.className}
      enableResizing={properties.enableResizing}
      width={properties.width}
      heigth={properties.heigth}
      sizeVector={properties.sizeVector}
      autoBreakOverMultiplePages={properties.autoBreakOverMultiplePages}
      onResize={properties.onResize}
      onSubmitSizeChange={properties.onSubmitSizeChange}
      disableMovement={properties.disableMovement}
      x={properties.x}
      y={properties.y}
      posVector={properties.posVector}
      onSubmitPositionChange={properties.onSubmitPositionChange}
      onDrag={properties.onDrag}
    >
      <div
        id={properties.id}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100%',
          maxHeight: '100%',
        }}
      >
        {properties.children}
      </div>
    </BaseMovableBox>
  );
}
