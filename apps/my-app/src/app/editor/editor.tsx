import { ReactElement, useReducer, useState } from "react";
import { Propertys } from "./properties/property";
import { ViewProperties, Template } from "./types";
import { DefaultView } from "./view/view";
import { AppShell, Group } from "@mantine/core";
export interface EditorPropertys {
  view?: ReactElement<ViewProperties>;
  template: Template;
}

export function Editor(properties: EditorPropertys) {
    const [currentPropertiesTab, setCurrentPropertiesTab] = useState<string|null>("");
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    return (
        <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm" }}>
        <AppShell.Header>
            <Group h="100%" px="md">
            Template Editor
            </Group>
        </AppShell.Header>
        <AppShell.Navbar>
            <Propertys
            template={properties.template}
            onTabChanges={(n) => {if(currentPropertiesTab !== n) setCurrentPropertiesTab(n) } }
            />
        </AppShell.Navbar>
        <AppShell.Main>
            {properties.view ? (
            properties.view
            ) : (
            <DefaultView 
                template={properties.template} 
                currentSelectedPropertiesTab={currentPropertiesTab}
                onValueChanged={forceUpdate}
            />
            )}
        </AppShell.Main>
        </AppShell>
    );
}
