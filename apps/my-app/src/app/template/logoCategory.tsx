import { TemplateTabDrawProperties } from '@pfiffkopf-webapp-office/pfk-pdf';
import { LogoSection } from './pfkInvoiceTemplate';
import {
  Center,
  Flex,
  Modal,
  ScrollArea,
  Stack,
  Title,
  Text,
  Button,
  Paper,
  Group,
  SimpleGrid,
  FileInput,
  LoadingOverlay,
} from '@mantine/core';
import { useState } from 'react';
import { IconMail } from '@tabler/icons-react';
import * as pdfjsLib from 'pdfjs-dist';
export function LogoCategory(properties: {
  properties: TemplateTabDrawProperties;
  self: LogoSection;
}) {
  const isMobile = properties.properties.isMobile;
  const self = properties.self;
  const template = properties.properties.template;
  const spacing = isMobile ? 'sm' : 'lg';
  const paperPadding = properties.properties.isMobile ? 'md' : 'lg';
  interface PageSelectionData{
    display: boolean,
    images: string[],
    step2?: boolean
  }
  const [pageSelectionUI, setPageSelectionUI] = useState<PageSelectionData>({
    display: false,
    images: []
  });
  const [imageSelection, setImageSelection] = useState(-1);
  return (
    <Stack gap={spacing} p={properties.properties.isMobile ? 'sm' : 'md'}>
      {/*Background Page selection*/}
      <Modal
        opened={pageSelectionUI.display || (pageSelectionUI.images || []).length > 0}
        onClose={() => {
          properties.self.doc = null;
          properties.self.docAsImage = null;
          setPageSelectionUI({
            display: false,
            images: []
          });
        }}
        fullScreen
      >
        {pageSelectionUI.display && pageSelectionUI.images.length === 0 &&
          <LoadingOverlay visible
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}>

          </LoadingOverlay>
        } : {
          <Stack>
            <Center>
              <Title>Briefpapier</Title>
            </Center>
            <Center>
              <Text>{pageSelectionUI.step2 ? "Schneide die Seite zurecht" : "Wähle eine Seite als Briefpapier aus." }</Text>
            </Center>
            <ScrollArea>
              <Flex>
                {pageSelectionUI.images.map((img, idx) => {
                  return (
                    <Stack>
                      <img
                        src={img}
                        alt={`Seite ${idx + 1}`}
                        onClick={() => {
                          setImageSelection(idx);
                        }}
                      />
                      <Center>
                        <Text>Seite {idx + 1}</Text>
                      </Center>
                    </Stack>
                  );
                })}
              </Flex>
            </ScrollArea>
            <Flex justify={'end'}>
              <Button
                disabled={imageSelection === -1}
                onClick={() => {
                  //send event that the
                  
                }}
              >
                Bestättigen{' '}
                {imageSelection !== -1 && <>Seite {imageSelection + 1}</>}
              </Button>
            </Flex>
          </Stack>
        }
      </Modal>
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
          <FileInput
            label="Briefpapier hochladen"
            placeholder="PDF auswählen"
            accept="application/pdf"
            clearable
            value={properties.self.doc}
            onChange={(file: File | null) => {
              if (file) {
                properties.self.doc = file;
                setImageSelection(-1);
                setPageSelectionUI({display: true, images: []});
                convertPFDToImageArray(file).then(
                  (imgs) => {
                    setPageSelectionUI({display: true, images: imgs});
                  },
                  (err) => {
                    alert(err);
                    setPageSelectionUI({display: true, images: []});
                  },
                );
              } else {
                properties.self.doc = null;
                properties.self.docAsImage = null;
                properties.properties.template.redrawView();
              }
            }}
          />
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
async function convertPFDToImageArray(pdf: File): Promise<string[]> {
  const buffer = await pdf.arrayBuffer();
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.js`;
  }
  const doc = await pdfjsLib.getDocument({
    data: buffer,
    useSystemFonts: true,
  }).promise;
  if (doc.numPages === 0) {
    return Promise.reject(
      'Nicht genug Seiten, das PDF Dokument benötigt mindestens 1 Seite.',
    );
  } else {
    const images: string[] = [];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, canvas, viewport }).promise;
        images.push(canvas.toDataURL());
      }
      return Promise.resolve(images);
    } else {
      return Promise.reject('Javascript Error');
    }
  }
}