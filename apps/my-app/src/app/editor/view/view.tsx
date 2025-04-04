import { Container, Paper, ScrollArea } from "@mantine/core";
import { ViewProperties} from "../types";
import { useEffect, useRef, useState } from "react";
class EditorUtil{
    public static xPos: number;
    public static yPos: number;
    public static zoomFactor = 1;
    public static middleMousePress: boolean;
    public static overEditor: boolean;
}
export function DefaultView(properties: ViewProperties)
{
    const editorWindow = useRef<HTMLDivElement | null>(null);
    const paperElement = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if(editorWindow.current != null && paperElement.current != null){
            EditorUtil.xPos = 10;
            EditorUtil.yPos = 10;
            document.onmousemove = (event) => {
                if(!EditorUtil.middleMousePress || !EditorUtil.overEditor)
                    return;
                EditorUtil.xPos += event.movementX;
                EditorUtil.yPos += event.movementY;
                
                if(paperElement.current != null){
                    paperElement.current.style.left = `calc(var(--app-shell-navbar-width) + ${EditorUtil.xPos}px)`;
                    paperElement.current.style.top = `calc(var(--app-shell-header-height, 0px) + ${EditorUtil.yPos}px)`;
                }
    
            }
            if(paperElement.current != null){
                editorWindow.current.onmouseleave = () => {
                    EditorUtil.overEditor = false;
                }
                editorWindow.current.onmouseenter = () => {
                    EditorUtil.overEditor = true;
                }
            }
            document.onmousedown = () => {
                EditorUtil.middleMousePress = true;
            };
            document.onmouseup = () => {
                EditorUtil.middleMousePress = false;
            }
            document.onwheel = (event) => {
                if(EditorUtil.overEditor && paperElement.current != null){
                    if(event.deltaY > 0){
                        //scroll out
                        EditorUtil.zoomFactor -= 0.1;
                    }else{
                        //scroll in
                        EditorUtil.zoomFactor += 0.1;
                    }
                    EditorUtil.zoomFactor = Math.max(0.1, EditorUtil.zoomFactor);
                    paperElement.current.style.width = `calc(21cm * ${EditorUtil.zoomFactor})`;
                    paperElement.current.style.height =  `calc(27cm * ${EditorUtil.zoomFactor})`;
                }
                
            }
        }
    }, [editorWindow, paperElement]);
    const offsetY = `calc(var(--app-shell-header-height, 0px) + ${EditorUtil.yPos}px)`;
    const offsetX = `calc(var(--app-shell-navbar-width) + ${EditorUtil.xPos}px)`;
    return(
        <div ref={editorWindow} style={{backgroundColor: "gray", width: "100%", height: "calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))"}}>
            <div ref={paperElement} id="paper" style={{backgroundColor: "white", width: `calc(21cm * ${EditorUtil.zoomFactor})`, height: `calc(27cm * ${EditorUtil.zoomFactor})`, position: "fixed", top: offsetY, left: offsetX}}>

            </div>
        </div>
        
    );
}