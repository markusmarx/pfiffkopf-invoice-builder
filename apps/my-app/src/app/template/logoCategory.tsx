import { TemplateTabDrawProperties } from '@pfiffkopf-webapp-office/pfk-pdf';
import { LogoSection } from './pfkInvoiceTemplate';
import { Stack, Text, Paper, Group, SimpleGrid } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import { PDFBackgroundInput } from '../template_components/pdfBackgroundInput/pdfBackgroundInput';

export function LogoCategory(properties: {
  properties: TemplateTabDrawProperties;
  self: LogoSection;
}) {
  const isMobile = properties.properties.isMobile;
  const spacing = isMobile ? 'sm' : 'lg';
  const paperPadding = properties.properties.isMobile ? 'md' : 'lg';

  return (
    <Stack gap={spacing} p={properties.properties.isMobile ? 'sm' : 'md'}>
      {/*Background Page selection*/}

      {/* Briefpapier Section */}
      <Paper p={paperPadding} shadow="xs" radius="md">
        <Group gap="md" mb="md">
          <IconMail
            size={20}
            style={{ color: 'var(--mantine-color-orange-6)' }}
          />
          <Text
            size={properties.properties.isMobile ? 'sm' : 'md'}
            fw={600}
            c="dark"
          >
            Briefpapier
          </Text>
        </Group>

        <SimpleGrid
          cols={properties.properties.isMobile ? 1 : 2}
          spacing={properties.properties.isMobile ? 'sm' : 'md'}
        >
          <PDFBackgroundInput
            background={properties.self.letterpaper}
            template={properties.properties.template}
          />
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
