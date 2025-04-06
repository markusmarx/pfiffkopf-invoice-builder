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

export interface PropertysProperty {
  template: Template;
}

export function Propertys(properties: PropertysProperty) {
  const tabs = Object.keys(properties.template);
  const values = Object.values(properties.template);
  return (
    <Tabs orientation="vertical" defaultValue={tabs[0]}>
      <Tabs.List>
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
        return (
          <Tabs.Panel value={id}>
            <Center>
              <Title>{(values[idx] as TemplateTab).DisplayName()}</Title>
            </Center>
            <Space h="xs" />
            <Divider/>
            <ScrollArea scrollbars="y">
                {(values[idx] as TemplateTab).DrawUI(properties.template)}
            </ScrollArea>
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
}
