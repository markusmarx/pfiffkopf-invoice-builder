import { Select, Group, Text, Button } from "@mantine/core";
import { FontSelector, Template } from "../types";
import { IconCheck } from "@tabler/icons-react";
import { useReducer, useRef } from "react";
import FontName from 'fontname';

interface FontSelectorUIProps{
    allowCustomFontUpload: boolean;
    fontSelector: FontSelector;
    template: Template;
}

export function FontSelectorUI(properties: FontSelectorUIProps){
    
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const fileUpload = useRef<HTMLInputElement | null>(null);
    return (
        <>
        <input id='fontUpload' type='file' hidden ref={fileUpload} multiple={false} accept=".ttf, .otf, .woff, .woff2" onChange={(ev) => {
            if(ev.target?.files && ev.target.files[0])
              {
                const file = ev.target.files[0];
                const fileBuffer = ev.target.files[0].arrayBuffer();
                fileBuffer.then((buffer) => {
                    const meta = FontName.parse(buffer);
                    properties.fontSelector.TryUpload(file, meta[0].fullName, meta[0].fullName, () => {
                    properties.template.RedrawView();
                    forceUpdate();
                });
                });
                
              }
        }}/>
        <Select
            allowDeselect={false}
            label="Schriftart auswählen"
            data={properties.allowCustomFontUpload ? [...properties.fontSelector.GetList(), {value: "new", label: "Neue Importieren"}] : properties.fontSelector.GetList()}
            searchable
            value={properties.fontSelector.Family()}
            onChange={(value) => {
                if(value !== "new"){
                    properties.fontSelector.Set(value || "Arial");
                    properties.template.RedrawView();
                    forceUpdate();
                }else{
                    if(fileUpload){
                        fileUpload.current?.click();
                    }
                }
            }}
            renderOption={({option, checked}) => (
                <>
                    <Group justify="flex-start" flex="1" gap="xs">
                        <Text  style={{fontFamily: option.value}}>{option.label}</Text>
                    </Group>
                    <Group>
                        <Button variant="subtle">...</Button>
                    </Group>
                </>
            )}
            styles={{input: {fontFamily: properties.fontSelector.Family()}}}
        />
    </>);
}