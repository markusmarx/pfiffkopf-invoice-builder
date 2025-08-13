import { ReactElement, useReducer, useState } from "react";
import { Propertys } from "./properties/property";
import { ViewProperties, Template } from "./types";
import { DefaultView } from "./view/view";
import { AppShell, Button, Flex, Group, Input, NumberInput, Space, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { RenderToPDF } from "./pdf_renderer/renderer";
export interface EditorPropertys {
  view?: ReactElement<ViewProperties>;
  template: Template;
}

export function Editor(properties: EditorPropertys) {
    const [currentPropertiesTab, setCurrentPropertiesTab] = useState<string|null>("");
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [currentPage, setCurrentPage] = useState(1);

    const pages = properties.template.DrawPaper({currentTab: ""});
    const maxPages = pages instanceof Array ? pages.length : 1;

    return (
        <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm" }}>
        <AppShell.Header>
            <Group h="100%" px="md">
                <Text>
                    Template Editor
                </Text>
                <Space></Space>
                {maxPages !== 1 &&
                    <Flex>
                        <Button.Group>
                            <Button variant="outline" onClick={() => setCurrentPage(1)}><IconChevronsLeft/></Button>
                            <Button variant="outline" onClick={() => setCurrentPage(currentPage-1 > 0 ? currentPage-1 : 1)}><IconChevronLeft/></Button>
                            <Button.GroupSection variant="default" bg="var(--mantine-color-body)" styles={{groupSection: {width: "15%"}}}>
                                <NumberInput
                                    styles={{input: { textAlign: "center" }}} 
                                    variant="unstyled"
                                    clampBehavior="strict"
                                    min={1}
                                    max={maxPages}
                                    decimalScale={0}
                                    hideControls
                                    value={currentPage}
                                    onValueChange={(v) => setCurrentPage(v.floatValue ? v.floatValue : 1)} 
                                    
                                />
                            </Button.GroupSection>
                            <Button variant="outline" onClick={() => setCurrentPage(currentPage+1 < maxPages ? currentPage+1 : maxPages)}><IconChevronRight/></Button>
                            <Button variant="outline" onClick={() => setCurrentPage(maxPages)}><IconChevronsRight/></Button>
                        </Button.Group>
                        
                    </Flex>
                }
                <Button onClick={() =>RenderToPDF(properties.template)}>Render to pdf</Button>
            </Group>
        </AppShell.Header>
        <AppShell.Navbar w={500}>
            <Propertys
            template={properties.template}
            pageIndex={currentPage}
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
                currentPage={currentPage}
            />
            )}
        </AppShell.Main>
        </AppShell>
    );
}
