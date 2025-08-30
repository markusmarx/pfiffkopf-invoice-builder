import { TemplateTabDrawProperties } from "@pfiffkopf-webapp-office/pfk-pdf";
import { TableSection } from "./pfkInvoiceTemplate";
import { Stack } from "@mantine/core";
import { TableDataInput } from "../template_components/tableDataInput/tableDataInput";

export function TableCategory(properties: {
  properties: TemplateTabDrawProperties;
  self: TableSection;
}) {
  const isMobile = properties.properties.isMobile;
  const self = properties.self;
  const template = properties.properties.template;
  const spacing = isMobile ? 'sm' : 'lg';
      return (
        <Stack gap={spacing} p={isMobile ? 'sm' : 'md'}>
          <TableDataInput
            tableData={self.table}
            template={template}
            isMobile={isMobile}
            labelEditing={true}
            enableEditing={true}
            widthEditing={true}
            reorderEditing={true}
          />
        </Stack>
      );
}