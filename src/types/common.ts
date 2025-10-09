import { LucideIcon } from "lucide-react";

export interface SidebarTab {
    title:string;
    url:string;
    icon:LucideIcon;
}

export interface NavLink {
    link: string;
    text: string;
}