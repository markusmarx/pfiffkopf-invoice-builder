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
import { useReducer, useState } from 'react';
import { IconMail } from '@tabler/icons-react';
import * as pdfjsLib from 'pdfjs-dist';
import Cropper from 'react-easy-crop';

interface PDFPageData {
  img: string;
  //page: PDFPAge,
  pageNumber: number;
  aspectRatio: number;
}
export function LogoCategory(properties: {
  properties: TemplateTabDrawProperties;
  self: LogoSection;
}) {
  const isMobile = properties.properties.isMobile;
  const self = properties.self;
  const template = properties.properties.template;
  const spacing = isMobile ? 'sm' : 'lg';
  const paperPadding = properties.properties.isMobile ? 'md' : 'lg';
  interface PageSelectionData {
    display: boolean;
    images: PDFPageData[];
    step2?: boolean;
  }

  const [pageSelectionUI, setPageSelectionUI] = useState<PageSelectionData>({
    display: false,
    images: [],
  });
  const [imageSelection, setImageSelection] = useState(-1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const a4dimension = 210 / 297;
  return (
    <Stack gap={spacing} p={properties.properties.isMobile ? 'sm' : 'md'}>
      {/*Background Page selection*/}
      <Modal
        opened={
          pageSelectionUI.display || (pageSelectionUI.images || []).length > 0
        }
        onClose={() => {
          properties.self.doc = null;
          properties.self.docAsImage = null;
          setPageSelectionUI({
            display: false,
            images: [],
          });
        }}
        fullScreen
      >
        {pageSelectionUI.display && pageSelectionUI.images.length === 0 && (
          <LoadingOverlay
            visible
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          ></LoadingOverlay>
        )}{' '}
        :{' '}
        {
          <Stack>
            <Center>
              <Title>Briefpapier</Title>
            </Center>
            <Center>
              <Text>
                {pageSelectionUI.step2
                  ? 'Schneide die Seite zurecht'
                  : 'Wähle eine Seite als Briefpapier aus.'}
              </Text>
            </Center>
            {!pageSelectionUI.step2 && (
              <ScrollArea>
                <Flex>
                  {pageSelectionUI.images.map((page, idx) => {
                    return (
                      <Stack>
                        <img
                          src={page.img}
                          alt={`Seite ${page.pageNumber}`}
                          onClick={() => {
                            setImageSelection(idx);
                          }}
                        />
                        <Center>
                          <Text>Seite {page.pageNumber}</Text>
                        </Center>
                      </Stack>
                    );
                  })}
                </Flex>
              </ScrollArea>
            )}
            {pageSelectionUI.step2 && (
              <Cropper
                image={pageSelectionUI.images[imageSelection].img}
                crop={crop}
                zoom={zoom}
                aspect={a4dimension}
                onCropChange={setCrop}
                onCropComplete={(croppedArea, croppedAreaPixels) => {
                  properties.self.imgArea = croppedAreaPixels;
                  properties.self.pdfArea = croppedArea;
                }}
                onZoomChange={setZoom}
              />
            )}
            <Flex justify={'end'}>
              <Button
                disabled={imageSelection === -1}
                onClick={() => {
                  if (pageSelectionUI.step2) {
                    //
                    const canvas = document.createElement('canvas');
                    canvas.width = self.imgArea.width;
                    canvas.height = self.imgArea.height;
                    const context = canvas.getContext('2d');
                    if (context) {
                      //
                      const img = new Image();
                      img.src = pageSelectionUI.images[imageSelection].img;
                      img.decode().then(() => {
                     context.drawImage(img, -self.imgArea.x, -self.imgArea.y);
                      self.docAsImage = canvas.toDataURL();
                      setPageSelectionUI({
                        display: false,
                        images: [],
                      });
                      template.redrawView();
                      });
                     
                    }
                  } else {
                    //check if the page has the a4 dimension
                    const aspect =
                      pageSelectionUI.images[imageSelection].aspectRatio;
                    if (
                      a4dimension < aspect + 0.01 &&
                      a4dimension > aspect - 0.01
                    ) {
                      //render single page to pdf
                      setPageSelectionUI({
                        display: false,
                        images: [],
                      });
                      self.docAsImage =
                        pageSelectionUI.images[imageSelection].img;
                      template.redrawView();
                    } else {
                      //show crop ui
                      setPageSelectionUI({
                        display: true,
                        images: pageSelectionUI.images,
                        step2: true,
                      });
                    }
                  }
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
                setPageSelectionUI({ display: true, images: [] });
                convertPFDToImageArray(file).then(
                  (imgs) => {
                    setPageSelectionUI({
                      display: true,
                      images: imgs,
                      step2: false,
                    });
                  },
                  (err) => {
                    alert(err);
                    setPageSelectionUI({ display: false, images: [] });
                  },
                );
              } else {
                properties.self.doc = null;
                properties.self.docAsImage = null;
                template.redrawView();
                setPageSelectionUI({ display: false, images: [] });
              }
            }}
          />
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
async function convertPFDToImageArray(pdf: File): Promise<PDFPageData[]> {
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
    const images: PDFPageData[] = [];
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
        images.push({
          img: canvas.toDataURL(),
          pageNumber: page.pageNumber,
          aspectRatio: canvas.width / canvas.height,
        });
      }
      return Promise.resolve(images);
    } else {
      return Promise.reject('Javascript Error');
    }
  }
}
