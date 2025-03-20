import { JSX } from "react";
export interface Template
{
    draw() : JSX.Element;
}
export interface ViewProperties{
    template : Template;
}