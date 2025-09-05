import {
  Button,
  Center,
  FileInput,
  Flex,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Stack,
  Title,
  Text,
  Box,
  Group,
  rem,
  Space,
  Grid,
} from '@mantine/core';
import { Template, BackgroundPDF } from '@pfiffkopf-webapp-office/pfk-pdf';
import { useState } from 'react';
import Cropper from 'react-easy-crop';
import * as pdfjsLib from 'pdfjs-dist';
import { IconFileText } from '@tabler/icons-react';

interface PDFBackgroundInputProps {
  template: Template;
  background: BackgroundPDF;
  isMobile?: boolean;
}

interface PDFPageData {
  img: string;
  //page: PDFPAge,
  pageNumber: number;
  aspectRatio: number;
}
interface PageSelectionData {
  display: boolean;
  images: PDFPageData[];
  step2?: boolean;
}

export function PDFBackgroundInput(properties: PDFBackgroundInputProps) {
  const template = properties.template;

  const [pageSelectionUI, setPageSelectionUI] = useState<PageSelectionData>({
    display: false,
    images: [],
  });
  const [imageSelection, setImageSelection] = useState(-1);
  const [imageHover, setImageHover] = useState(-1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const a4dimension = 210 / 297;
  const isMobile = properties.isMobile;
  function selectionStepOne(selectedImage: number, images: PDFPageData[]) {
    //check if the page has the a4 dimension
    console.log(selectedImage);
    const aspect = images[selectedImage].aspectRatio;
    if (a4dimension < aspect + 0.01 && a4dimension > aspect - 0.01) {
      //render single page to pdf
      properties.background.imgArea = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      properties.background.pdfArea = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      setPageSelectionUI({
        display: false,
        images: [],
      });
      properties.background.docAsImage = images[selectedImage].img;
      template.redrawView();
    } else {
      //show crop ui
      setPageSelectionUI({
        display: true,
        images: images,
        step2: true,
      });
    }
  }

  function onFinishStep(selectedImage: number) {
    if (pageSelectionUI.step2) {
      //
      const canvas = document.createElement('canvas');
      canvas.width = properties.background.imgArea.width;
      canvas.height = properties.background.imgArea.height;
      const context = canvas.getContext('2d');
      if (context) {
        //
        const img = new Image();
        img.src = pageSelectionUI.images[selectedImage].img;
        img.decode().then(() => {
          context.drawImage(
            img,
            -properties.background.imgArea.x,
            -properties.background.imgArea.y,
          );
          properties.background.docAsImage = canvas.toDataURL();
          setPageSelectionUI({
            display: false,
            images: [],
          });
          template.redrawView();
        });
      }
    } else {
      selectionStepOne(selectedImage, pageSelectionUI.images);
    }
  }

  return (
    <>
      {/*Background Page selection*/}
      <Modal
        opened={
          pageSelectionUI.display || (pageSelectionUI.images || []).length > 0
        }
        onClose={() => {
          properties.background.doc = null;
          properties.background.docAsImage = null;
          setPageSelectionUI({
            display: false,
            images: [],
          });
        }}
        fullScreen
        title={
          <Group gap={isMobile ? 'sm' : 'md'}>
            <Box
              p={isMobile ? 'xs' : 'sm'}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: rem(8),
                backdropFilter: 'blur(10px)',
              }}
            >
              <IconFileText size={isMobile ? 20 : 24} />
            </Box>
            <Text
              size={isMobile ? 'lg' : 'xl'}
              fw={600}
              style={{ display: isMobile ? 'none' : 'block' }}
            >
              Briefpapier
            </Text>
            {isMobile && (
              <Text size="sm" fw={600}>
                PDF Editor
              </Text>
            )}
          </Group>
        }
        styles={{
          header: {
            backgroundColor: 'var(--mantine-color-gray-8)',
            color: 'white',
          },
          close: {
            color: 'white',
          },
        }}
      >
        {pageSelectionUI.display && pageSelectionUI.images.length === 0 && (
          <LoadingOverlay
            visible
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          ></LoadingOverlay>
        )}
        {
          <Stack>
            <Space />
            <Center>
              <Title>
                {pageSelectionUI.step2
                  ? 'Schneiden Sie die Seite zurecht. Bestätigen Sie mit dem Button unten.'
                  : 'Wählen Sie eine Seite als Briefpapier aus. Bestätigen Sie mit dem Button unten.'}
              </Title>
            </Center>
            {!pageSelectionUI.step2 && (
              <ScrollArea>
                <Flex>
                  {pageSelectionUI.images.map((page, idx) => {
                    return (
                      <Box
                        style={{
                          backgroundColor: imageHover === idx || imageSelection === idx ? "var(--mantine-color-blue-light-hover)" : undefined,
                          width: "350px",
                          minWidth: "350px",
                          borderRadius: "25px"
                        }}
                        onClick={() => {
                          setImageSelection(idx);
                        }} 
                        onMouseEnter={() => setImageHover(idx)}
                        onMouseLeave={() => setImageHover(-1)}
                      >
                      <Stack
                        align={'center'}
                      >
                        <Space/>
                        <img
                          src={page.img}
                          alt={`Seite ${page.pageNumber}`}
                         
                          style={{
                            maxHeight: '300px',
                            maxWidth: '300px',
                          }}
                        />
                        <Center>
                          <Text>Seite {page.pageNumber}</Text>
                        </Center>
                        <Space/>
                      </Stack>
                      </Box>
                    );
                  })}
                </Flex>
                </ScrollArea>
            )}
            {pageSelectionUI.step2 && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                }}
              >
                <Cropper
                  image={pageSelectionUI.images[imageSelection].img}
                  crop={crop}
                  zoom={zoom}
                  aspect={a4dimension}
                  onCropChange={setCrop}
                  onCropComplete={(croppedArea, croppedAreaPixels) => {
                    properties.background.imgArea = croppedAreaPixels;
                    properties.background.pdfArea = croppedArea;
                  }}
                  onZoomChange={setZoom}
                />
              </div>
            )}
            <Flex justify={'end'}>              
              {pageSelectionUI.step2 &&
                <Button color='red'
                  onClick={() => setPageSelectionUI({
                    step2: false,
                    images: pageSelectionUI.images,
                    display: true
                  })}
                >
                  Zurück
                </Button>
              }
              <Button
                disabled={imageSelection === -1}
                onClick={() => onFinishStep(imageSelection)}
              >
                Bestätigen{' '}
                {imageSelection !== -1 && !pageSelectionUI.step2 && <>Seite {imageSelection + 1}</>}
              </Button>

            </Flex>
          </Stack>
        }
      </Modal>
      <FileInput
        label="Briefpapier hochladen"
        placeholder="PDF auswählen"
        accept="application/pdf"
        clearable
        value={properties.background.doc}
        onChange={(file: File | null) => {
          if (file) {
            properties.background.doc = file;
            setImageSelection(-1);
            setPageSelectionUI({ display: true, images: [] });
            convertPFDToImageArray(file).then(
              (imgs) => {
                if (imgs.length === 1) {
                  setPageSelectionUI({
                    display: true,
                    images: imgs,
                    step2: false,
                  });
                  selectionStepOne(0, imgs);
                  setImageSelection(0);
                } else {
                  setPageSelectionUI({
                    display: true,
                    images: imgs,
                    step2: false,
                  });
                }
              },
              (err) => {
                alert(err);
                setPageSelectionUI({ display: false, images: [] });
              },
            );
          } else {
            properties.background.doc = null;
            properties.background.docAsImage = null;
            template.redrawView();
            setPageSelectionUI({ display: false, images: [] });
          }
        }}
      />
    </>
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
