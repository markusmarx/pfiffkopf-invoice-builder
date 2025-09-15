import { TemplateTabDrawProperties } from '@pfiffkopf-webapp-office/pfk-pdf';
import { LogoSection } from './pfkInvoiceTemplate';
import {
  Stack,
  Text,
  Paper,
  Group,
  SimpleGrid,
  FileInput,
} from '@mantine/core';
import { IconMail, IconPhoto } from '@tabler/icons-react';
import { PDFBackgroundInput } from '../template_components/pdfBackgroundInput/pdfBackgroundInput';
import DragVectorInput from '../template_components/dragVectorInput/dragVectorInput';

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
            isMobile={properties.properties.isMobile}
          />
        </SimpleGrid>
      </Paper>
      {/* Logo Section */}
      <Paper p={paperPadding} shadow="xs" radius="md">
        <Group gap="md" mb="md">
          <IconPhoto
            size={20}
            style={{ color: 'var(--mantine-color-orange-6)' }}
          />
          <Text
            size={properties.properties.isMobile ? 'sm' : 'md'}
            fw={600}
            c="dark"
          >
            Logo
          </Text>
        </Group>
        <Stack
        >
          <FileInput
            accept="image/png, image/jpeg"
            label="Logo hochladen"
            placeholder="Logo auswählen"
            onChange={(file) => {
              if(!FileReader){
                alert("Dein Browser unterstützt das Feature File Reader nicht, aktualisiere ihn auf mindestens \n IE 10 \n Safari 6.0.2 \n Chrome 7 \n Firefox 3.6 \n Opera 12.02");
              }
              if(file){
                const reader = new FileReader();
                reader.onerror = () => {
                  alert("Fehler beim laden des Bildes");
                }
                reader.onload = (ev) => { 
                  if(typeof reader.result === "string" || reader.result instanceof String){
                    properties.self.logo = reader.result as string;
                    properties.properties.template.redrawView();
                  }
                };
                reader.readAsDataURL(file);
              }else{
                properties.self.logo = undefined;
                properties.properties.template.redrawView();
              }
            }}
          ></FileInput>
          <DragVectorInput
            template={properties.properties.template}
            isMobile={properties.properties.isMobile}
            positionVector={properties.self.positionLogo}
            sizeVector={properties.self.sizeLogo}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
