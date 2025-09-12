import { TemplateTabDrawProperties } from '@pfiffkopf-webapp-office/pfk-pdf';
import { RecipentSection } from './pfkInvoiceTemplate';
import DragVectorInput from '../template_components/dragVectorInput/dragVectorInput';
import { Stack } from '@mantine/core';

export function RecipentCategory(properties: {
  properties: TemplateTabDrawProperties;
  self: RecipentSection;
}) {
  const isMobile = properties.properties.isMobile;
  const self = properties.self;
  
  const template = properties.properties.template;
  const spacing = isMobile ? 'sm' : 'lg';
  return (
    <Stack gap={spacing} p={isMobile ? 'sm' : 'md'}>
      <DragVectorInput
        template={template}
        isMobile={isMobile}
        positionVector={self.pos}
      />
    </Stack>
  );
}
