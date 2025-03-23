import { Tabs, Text, TextInput, Title } from "@mantine/core";
import { Template } from "../types";
import { JSX } from "react";

export interface PropertysProperty{
    template: Template
}
export function Propertys(properties: PropertysProperty)
{
    const tabs = Object.keys(properties.template);
    const values = Object.values(properties.template);
    return(
        <Tabs orientation="vertical" defaultValue={tabs[0]}>
            <Tabs.List>
                {
                    tabs.map((name, idx) => {
                        
                        if(typeof values[idx] !== "object" || values[idx] === null){
                            return (""); 
                        }
                        
                        console.log(Reflect.getMetadataKeys(values[idx]));
                        return(
                            <Tabs.Tab value={name}>
                                <Text>{name}</Text>
                            </Tabs.Tab>
                        );
                    })
                }
            </Tabs.List>
            {
                tabs.map((id, idx) => {
                    if(typeof values[idx] !== "object" || values[idx] === null){
                        return (""); 
                    }
                    const entries = Object.keys(values[idx]);      
                    const entriesValues = Object.values(values[idx]);           
                    return(
                        <Tabs.Panel value={id}>
                            <Title>
                                {id}
                            </Title>
                            {
                                entries.map((propertyName, idxEntry) => {
                                    let inputValue : JSX.Element = <Text>{propertyName}</Text>;
                                    if(typeof entriesValues[idxEntry] === "string"){
                                        inputValue = <TextInput label={propertyName}></TextInput>;
                                    }else{
                                        //inputValue = "";
                                    }
                                    return(
                                        inputValue
                                    );
                                })
                            }
                        </Tabs.Panel>
                    );
                })
            }
        </Tabs>
    );
}