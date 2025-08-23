import { ReactElement, useReducer, useState } from "react";
import { Propertys } from "./properties/property";
import { ViewProperties, Template } from "./types";
import { DefaultView } from "./view/view";
import {
  AppShell,
  Button,
  Flex,
  Group,
  NumberInput,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Divider,
  Title,
  MantineProvider,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconFileTypePdf,
  IconPalette,
} from "@tabler/icons-react";
import { renderToPDF } from "./pdf_renderer/renderer";
import { PDFKitPDFSubset, PDFKitPDFVersion } from "./pdf";
import saveAs from "file-saver";

export interface EditorPropertys {
  view?: ReactElement<ViewProperties>;
  template: Template;
}

export function Editor(properties: EditorPropertys) {
  const [currentPropertiesTab, setCurrentPropertiesTab] = useState<
    string | null
  >("");
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [currentPage, setCurrentPage] = useState(1);

  const pages = properties.template.DrawPaper({
    currentTab: "",
    pdfRenderer: false,
  });
  const maxPages = pages instanceof Array ? pages.length : 1;

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 520, breakpoint: "sm" }}
      styles={{
        main: {
          backgroundColor: "var(--mantine-color-gray-0)",
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="xl" justify="space-between">
          <Group>
            <IconPalette size={28} color="var(--mantine-color-primary-6)" />
            <Title order={2} c="primary.7" fw={600}>
              Template Editor
            </Title>
            <Badge variant="light" color="primary" size="sm">
              v1.0
            </Badge>
          </Group>

          <Group>
            {maxPages !== 1 && (
              <>
                <Text size="sm" c="gray.6" fw={500}>
                  Seite {currentPage} von {maxPages}
                </Text>
                <Flex gap="xs">
                  <Button.Group>
                    <Tooltip label="Erste Seite">
                      <ActionIcon
                        variant="light"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <IconChevronsLeft size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Vorherige Seite">
                      <ActionIcon
                        variant="light"
                        onClick={() =>
                          setCurrentPage(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <IconChevronLeft size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <NumberInput
                      styles={{
                        input: {
                          textAlign: "center",
                          width: 60,
                          borderRadius: "var(--mantine-radius-sm)",
                        },
                      }}
                      variant="filled"
                      size="sm"
                      clampBehavior="strict"
                      min={1}
                      max={maxPages}
                      decimalScale={0}
                      hideControls
                      value={currentPage}
                      onValueChange={(v) =>
                        setCurrentPage(v.floatValue ? v.floatValue : 1)
                      }
                    />
                    <Tooltip label="Nächste Seite">
                      <ActionIcon
                        variant="light"
                        onClick={() =>
                          setCurrentPage(Math.min(currentPage + 1, maxPages))
                        }
                        disabled={currentPage === maxPages}
                      >
                        <IconChevronRight size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Letzte Seite">
                      <ActionIcon
                        variant="light"
                        onClick={() => setCurrentPage(maxPages)}
                        disabled={currentPage === maxPages}
                      >
                        <IconChevronsRight size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Button.Group>
                </Flex>
                <Divider orientation="vertical" />
              </>
            )}

            <Button
              leftSection={<IconFileTypePdf size={18} />}
              onClick={() =>
                renderToPDF({
                  template: properties.template,
                  wrapper: (template) => {
                    return <MantineProvider>{template}</MantineProvider>;
                  },
                  pdfCreationOptions: {subset: PDFKitPDFSubset.pdfA_oneA, pdfVersion: PDFKitPDFVersion.oneDFour, tagged: true},
                  onFinishPDFCreation: (chunks) => {
                    const blob = new Blob(chunks as BlobPart[], { type: "application/pdf" });
                    saveAs(blob, "generierte Rechnung.pdf");
                  }
                })
              }
              variant="gradient"
              gradient={{ from: "primary", to: "accent", deg: 45 }}
              size="sm"
              radius="md"
            >
              PDF Export
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Propertys
          template={properties.template}
          pageIndex={currentPage}
          onTabChanges={(n) => {
            if (currentPropertiesTab !== n) setCurrentPropertiesTab(n);
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main p="md">
        {properties.view ? (
          properties.view
        ) : (
          <DefaultView
            template={properties.template}
            currentSelectedPropertiesTab={currentPropertiesTab}
            onValueChanged={forceUpdate}
            currentPage={currentPage}
          />
        )}
      </AppShell.Main>
    </AppShell>
  );
}
