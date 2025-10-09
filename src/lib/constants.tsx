import { SidebarTab } from "@/types/common";
import { Cloud, HomeIcon, LucideBriefcaseBusiness, LucideGroup, NotepadTextDashedIcon } from "lucide-react";

export const SidebarTabs: SidebarTab[]=[
    {title:"Dashboard", url:"/dashboard/dashboard",icon:HomeIcon},
    {title:"Weather",url:"/dashboard/weather",icon:Cloud},
    {title:"Requests",url:"/dashboard/requests",icon:NotepadTextDashedIcon},
    {title:"Finances",url:"/dashboard/finances",icon:LucideBriefcaseBusiness},
    {title:"Admin",url:"/dashboard/admin",icon:LucideGroup},
]

export const PAGE_TITLES: Record<string, string> = {
    "/dashboard/dashboard":"Dashboard",
    "/dashboard/weather":"Weather",
    "/dashboard/requests":"Requests",
    "/dashboard/finances":"Finances",
    "/dashboard/admin":"Admin",

}