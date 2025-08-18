import { Select, Group } from "@mantine/core";
import { FontSelector, Template } from "../types";
import { IconCheck } from "@tabler/icons-react";
import { useRef } from "react";

interface FontSelectorUIProps{
    allowCustomFontUpload: boolean;
    fontSelector: FontSelector;
    template: Template;
}

export function FontSelectorUI(properties: FontSelectorUIProps){
    const fileUpload = useRef<HTMLInputElement | null>(null);
    return (
        <>
        <input id='fontUpload' type='file' hidden ref={fileUpload} multiple={false} accept=".ttf, .otf, .woff, .woff2" onChange={(ev) => {
            if(ev.target?.files && ev.target.files[0])
              {
                properties.fontSelector.TryUpload(ev.target.files[0], "Neue Font", () => {
                    properties.template.RedrawView();
                });
              }
        }}/>
        <Select
            allowDeselect={false}
            label="Schriftart auswählen"
            data={properties.allowCustomFontUpload ? [...properties.fontSelector.GetList(), {value: "new", label: "Neue Importieren"}] : properties.fontSelector.GetList()}
            searchable
            value={properties.fontSelector.Get()}
            onChange={(value) => {
                if(value !== "new"){
                    properties.fontSelector.Set(value || "Arial");
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