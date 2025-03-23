import { ReactElement } from "react";
import { Propertys } from "./properties/property";
import { ViewProperties, Template } from "./types";
import { DefaultView } from "./view/view";
import { AppShell, Group } from "@mantine/core";
export interface EditorPropertys
{
    view?: ReactElement<ViewProperties>;
    template: Template;
}

export function Editor(properties: EditorPropertys)
{
    return (
        <AppShell
            header={{height: 60}}
            navbar={{ width: 300, breakpoint: 'sm' }}
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    Template Editor
                </Group>
            </AppShell.Header>
            <AppShell.Navbar>
                <Propertys template={properties.template}/>
            </AppShell.Navbar>
            <AppShell.Main>
                {(properties.view) ? properties.view : <DefaultView template={properties.template}/>}
            </AppShell.Main>
        </AppShell>
    );
}