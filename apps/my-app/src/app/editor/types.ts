import { JSX } from "react";
export interface Template
{
    draw() : JSX.Element;
}
export interface TemplateTab
{
    drawUI() : JSX.Element;
    displayName() : string;
}
export interface ViewProperties
{
    template : Template;
}