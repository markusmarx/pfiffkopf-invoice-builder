import {
  ScrollArea,
  Tabs,
  Text,
  Title,
  Box,
  Paper,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconSettings, IconX } from "@tabler/icons-react";
import { Template, TemplateTab } from "../types";
import { useEffect, useReducer, useState } from "react";

export interface PropertysProperty {
  template: Template;
  onTabChanges?: (tabName: string | null) => void;
  pageIndex: number;
  onClose?: () => void; // Optional close handler
}

function PropertiesTab(props: {
  tab: TemplateTab;
  currentTab: string;
  template: Template;
}) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    props.tab.SetDataProperties(forceUpdate);
  });

  return props.tab.drawUI
    ? props.tab.drawUI({
      template: props.template,
      currentTab: props.currentTab,
      edited: false,
    })
    : "";
}

export function Propertys(properties: PropertysProperty) {
  const tabs = Object.keys(properties.template);
  const values = Object.values(properties.template);
  const firstTab = findFirstTab();
  const [currentTab, setCurrentTab] = useState(firstTab);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    properties.template.SetDataProperties(forceUpdate);
  }, [properties.template]);

  function findFirstTab(): string {
    for (let i = 0; i < tabs.length; i++) {
      if (typeof values[i] === "object" && values[i] !== null && values[i] instanceof TemplateTab) {
        const pages = (values[i] as TemplateTab).PageNumbers();
        if (
          (pages instanceof Array &&
            (pages as Array<number>).includes(properties.pageIndex - 1)) ||
          (!(pages instanceof Array) &&
            ((pages as number) === -1 ||
              (pages as number) === properties.pageIndex - 1))
        ) {
          return tabs[i];
        }
      }
    }
    return "undefined";
  }

  function isTabVisible(idx: number): boolean {
    if (typeof values[idx] !== "object" || values[idx] === null|| !(values[idx] instanceof TemplateTab)) {
      return false;
    }
    const pages = (values[idx] as TemplateTab).PageNumbers();
    return (
      (pages instanceof Array &&
        (pages as Array<number>).includes(properties.pageIndex - 1)) ||
      (!(pages instanceof Array) &&
        ((pages as number) === -1 ||
          (pages as number) === properties.pageIndex - 1))
    );
  }

  return (
    <Paper
      shadow="md"
      radius="md"
      withBorder
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--mantine-color-gray-0)",
      }}
    >
      {/* Header */}
      <Box
        p="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          backgroundColor: "var(--mantine-color-white)",
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <IconSettings size={18} color="var(--mantine-color-blue-6)" />
            <Title order={4} c="gray.8">
              Eigenschaften
            </Title>
          </Group>
          {properties.onClose && (
            <Tooltip label="Schließen">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={properties.onClose}
                size="sm"
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Box>

      {/* Tabs */}
      <Box style={{ flex: 1, overflow: "hidden" }}>
        <Tabs
          orientation="vertical"
          defaultValue={firstTab}
          value={currentTab}
          onChange={(name) => {
            if (properties.onTabChanges) {
              setCurrentTab(name !== null ? name : "");
              properties.onTabChanges(name);
            }
          }}
          styles={{
            root: {
              height: "100%",
              display: "flex",
            },
            list: {
              backgroundColor: "var(--mantine-color-gray-1)",
              borderRight: "1px solid var(--mantine-color-gray-3)",
              padding: "var(--mantine-spacing-sm)",
              minWidth: "140px",
              maxWidth: "180px",
            },
            tab: {
              borderRadius: "var(--mantine-radius-sm)",
              marginBottom: "var(--mantine-spacing-xs)",
              padding: "var(--mantine-spacing-sm)",
              fontSize: "var(--mantine-font-size-sm)",
              fontWeight: 500,
              "&[data-active]": {
                backgroundColor: "var(--mantine-color-blue-6)",
                color: "white",
                borderColor: "var(--mantine-color-blue-6)",
              },
              "&:hover:not([data-active])": {
                backgroundColor: "var(--mantine-color-gray-2)",
              },
            },
            panel: {
              flex: 1,
              height: "100%",
              padding: 0,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <Tabs.List>
            {tabs.map((name, idx) => {
              if (!isTabVisible(idx)) return null;

              return (
                <Tabs.Tab key={name} value={name}>
                  <Text size="sm" truncate="end">
                    {(values[idx] as TemplateTab).DisplayName()}
                  </Text>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>

          {tabs.map((id, idx) => {
            if (!isTabVisible(idx)) return null;

            const tabData = values[idx] as TemplateTab;
            return (
              <Tabs.Panel key={id} value={id}>
                {/* Panel Header */}
                <Box
                  p="md"
                  style={{
                    borderBottom: "1px solid var(--mantine-color-gray-2)",
                    backgroundColor: "var(--mantine-color-white)",
                  }}
                >
                  <Title order={5} c="gray.7">
                    {tabData.DisplayName()}
                  </Title>
                </Box>

                {/* Panel Content */}
                <ScrollArea
                  style={{ flex: 1 }}
                  scrollbars="y"
                  scrollbarSize={6}
                  p="md"
                >
                  <PropertiesTab
                    template={properties.template}
                    tab={tabData}
                    currentTab={currentTab}
                  />
                </ScrollArea>
              </Tabs.Panel>
            );
          })}
        </Tabs>
      </Box>
    </Paper>
  );
}
