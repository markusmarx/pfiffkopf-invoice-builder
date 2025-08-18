import { Select, Text, Group } from "@mantine/core";
import { FontStorage, Template } from "../types";
import { IconCheck } from "@tabler/icons-react";
import { useRef } from "react";

interface FontSelectorProps{
    fonts: string[];
    allowCustomFontUpload: boolean;
    fontStorage: FontStorage;
    template: Template;
}

export function FontSelector(properties: FontSelectorProps){
    const fileUpload = useRef<HTMLInputElement | null>(null);
    return (
        <>
        <input id='fontUpload' type='file' hidden ref={fileUpload} multiple={false} accept=".ttf, .otf, .woff, .woff2" onChange={(ev) => {
            if(ev.target?.files && ev.target.files[0])
              {
                properties.fontStorage.LoadCustomFontFromFile(ev.target.files[0]).then(() => {
                    properties.template.RedrawView();
                });
              }
        }}/>
        <Select
            allowDeselect={false}
            label="Schriftart auswählen"
            data={properties.allowCustomFontUpload ? [...properties.fonts, "Eigene Auswählen"] : properties.fonts}
            searchable
            defaultValue={properties.fontStorage.Get()}
            onChange={(value) => {
                if(value !== "Eigene Auswählen"){
                    properties.fontStorage.SetCSSFont(value || "Arial");
                    properties.template.RedrawView();
                }else{
                    if(fileUpload){
                        fileUpload.current?.click();
                    }
                }
            }}
            renderOption={({option, checked}) => (
                <Group style={{fontFamily: option.value}} flex="1" gap="xs">
                    {option.label}
                    {checked && <IconCheck style={{ marginInlineStart: 'auto' }} />}
                </Group>
        )}
        />
    </>);
}