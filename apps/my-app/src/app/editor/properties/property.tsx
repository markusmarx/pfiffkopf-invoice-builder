import {
  Center,
  Divider,
  ScrollArea,
  Space,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { Template, TemplateTab } from "../types";
import { useEffect, useReducer, useState } from "react";

export interface PropertysProperty {
  template: Template;
  onTabChanges?: (tabName: string | null) => void;
}
function PropertiesTab(props: {tab: TemplateTab, currentTab: string, template: Template}){
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    props.tab.SetDataProperties(forceUpdate);
  });

  return  props.tab.drawUI ? props.tab.drawUI({
    template: props.template,
    currentTab: props.currentTab,
    edited: false,
  }) : "";
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
      if (typeof values[i] === "object" && values[i] !== null) {
        return tabs[i];
      }
    }

    return "undefined";
  }
  return (
    <Tabs
      orientation="vertical"
      defaultValue={firstTab}
      onChange={(name) => {
        if (properties.onTabChanges) {
          setCurrentTab(name !== null ? name : "");
          properties.onTabChanges(name);
        }
      }}
      styles={{panel: {
        height: "100vh", minHeight: "100vh"
      }}}
    >
      <Tabs.List>
        <Space h="xl" />
        <Space h="xs" />
        <Space h="xs" />
        <Space h="xs" />
        {tabs.map((name, idx) => {
          if (typeof values[idx] !== "object" || values[idx] === null) {
            return "";
          }
          return (
            <Tabs.Tab value={name}>
              <Text>{(values[idx] as TemplateTab).DisplayName()}</Text>
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
      {tabs.map((id, idx) => {
        if (typeof values[idx] !== "object" || values[idx] === null) {
          return "";
        }
        const tabData = values[idx] as TemplateTab;
        return (
          <Tabs.Panel value={id}>
            <Center>
              <Title>{tabData.DisplayName()}</Title>
            </Center>
            <Space h="xs" />
            <Divider />
            <ScrollArea scrollbars="y">
              <PropertiesTab template={properties.template} tab={tabData} currentTab={currentTab}></PropertiesTab>
            </ScrollArea>
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
}
