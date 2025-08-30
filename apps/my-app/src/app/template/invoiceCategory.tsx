import { TemplateTabDrawProperties } from '@pfiffkopf-webapp-office/pfk-pdf';
import { InvoiceSection } from './pfkInvoiceTemplate';
import { Stack } from '@mantine/core';
import DragVectorInput from '../template_components/dragVectorInput/dragVectorInput';

export function InvoiceCategory(properties: {
  properties: TemplateTabDrawProperties;
  self: InvoiceSection;
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
