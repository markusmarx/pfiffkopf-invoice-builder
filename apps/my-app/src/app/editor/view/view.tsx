import { Container, Paper, ScrollArea } from "@mantine/core";
import { ViewProperties} from "../types";
import { useState } from "react";

export function DefaultView(properties: ViewProperties)
{
    const xPosition = useState(10);
    const yPosition = useState(10);
    const offsetY = `calc(var(--app-shell-header-height, 0px) + ${yPosition}px)`;
    const offsetX = `calc(var(--app-shell-navbar-width) + ${xPosition}px)`;
    return(
        <div style={{backgroundColor: "gray", width: "100%", height: "calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))"}}>
            <div style={{backgroundColor: "white", width: "21cm", height: "27cm", position: "fixed", top: offsetY, left: offsetX}}>

            </div>
        </div>
        
    );
}