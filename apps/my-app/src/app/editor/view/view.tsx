import { ViewProperties} from "../types";
import { useEffect, useReducer, useRef } from "react";
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
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    let currentSelectedPropertiesTab : string | undefined = undefined;
    if(properties.currentSelectedPropertiesTab !== null){
        currentSelectedPropertiesTab = properties.currentSelectedPropertiesTab;
    }

    useEffect(() => {
        if(properties.template != null){
            properties.template.SetDataView(forceUpdate);
        }

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
            document.onmousedown = (event) => {
                EditorUtil.middleMousePress = event.button === 1 || EditorUtil.middleMousePress;
            };
            document.onmouseup = (event) => {
                if(event.button === 1){
                    EditorUtil.middleMousePress = false;
                }
            }
            document.onwheel = (event) => {
                return; //disabled for now
                // eslint-disable-next-line no-unreachable
                if(EditorUtil.overEditor && paperElement.current != null){
                    if(event.deltaY > 0){
                        //scroll out
                        EditorUtil.zoomFactor -= 0.1;
                    }else{
                        //scroll in
                        EditorUtil.zoomFactor += 0.1;
                    }
                    EditorUtil.zoomFactor = Math.max(0.1, EditorUtil.zoomFactor);
                    //paperElement.current.style.width = `calc(21cm * ${EditorUtil.zoomFactor})`;
                    //paperElement.current.style.height =  `calc(27cm * ${EditorUtil.zoomFactor})`;
                }
            }
        }
    }, [editorWindow, paperElement, properties.template]);
    const offsetY = `calc(var(--app-shell-header-height, 0px) + ${EditorUtil.yPos}px)`;
    const offsetX = `calc(var(--app-shell-navbar-width) + ${EditorUtil.xPos}px)`;
    return(
        <div ref={editorWindow} style={{backgroundColor: "gray", width: "100%", height: "calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))"}}>
            <div ref={paperElement} id="paper" style={{boxShadow: "2p 2px 4px #000000", backgroundColor: "white", width: `calc(21cm * ${EditorUtil.zoomFactor})`, height: `calc(27cm * ${EditorUtil.zoomFactor})`, position: "fixed", top: offsetY, left: offsetX}}>
                {properties.template.DrawPaper({
                    currentTab: currentSelectedPropertiesTab !== undefined ? currentSelectedPropertiesTab : "undefined",
                    templateValuesChanged: () => 
                    {
                        if(properties.onValueChanged){
                            properties.onValueChanged();
                        }
                    }
                }
                )}
            </div>
        </div>
        
    );
}