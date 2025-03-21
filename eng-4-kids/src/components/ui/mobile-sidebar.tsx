/* 
    Frontend component: sidebar cho phép người dùng chuyển hướng giữa các trang trên mobile 
*/

import {
    Sheet, 
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SideBar } from "./sidebar";

export const MobileSideBar = () => {
    return(
        <Sheet>
            <SheetTrigger>
                <Menu className="text-white cursor-pointer"/>
            </SheetTrigger>
            <SheetContent>
                <SideBar/>
            </SheetContent>
        </Sheet>
    )
}