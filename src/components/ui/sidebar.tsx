/*
    Frontend component: sidebar cho phép người dùng chuyển hướng giữa các trang
*/

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "@/components/ui/sidebar-items";
import{
    ClerkLoading,
    ClerkLoaded,
    UserButton
} from "@clerk/nextjs";
import { Loader } from "lucide-react";

type Props = {
    className?: string;
}
// Hàm `cn` dùng để kết hợp các class CSS một cách linh hoạt, dựa trên điều kiện.
// Prop `className` cho phép truyền thêm class tùy chỉnh để thay đổi giao diện của `SideBar`.
export const SideBar = ({ className }: Props) => {
    return (
        <div className={cn("flex flex-col lg:w-[256px] min-h-screen lg:fixed left-0 top-0 px-4 border-r-2 bg-cyan-100", className)}>
            {/* Logo Section */}
            <div className="hidden lg:flex pl-4 pt-8 items-center gap-x-3">
                <Image src="/anime-girl-reading.gif" height={40} width={40} alt="mascot image" />
                <h1 className="lg:text-xl text-2xl font-extrabold text-amber-300 tracking-wide">
                    <Link href="/home">ANIMENG</Link>
                </h1>
            </div>

            {/* Sidebar Items - Grow to push UserButton down */}
            <div className="flex flex-col gap-y-4 pt-8 flex-grow">
                <SidebarItem label="Học" href="/learning" iconSrc="/learn.svg"/>
                <SidebarItem label="Xếp hạng" href="/leaderboard" iconSrc="/leaderboard.svg"/>
                <SidebarItem label="Cửa hàng" href="/shop" iconSrc="/shop.svg"/>
                <SidebarItem label="Nhiệm vụ" href="/quests" iconSrc="/quests.svg"/>
                <SidebarItem label="Chat with waifu" href="/chat" iconSrc="/waifu1.png"/>
            </div>

            {/* User Button - Stays at the bottom */}
            <div className="p-4 mt-auto">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin"/>
                </ClerkLoading>
                <ClerkLoaded>
                    <UserButton />
                </ClerkLoaded>
            </div>
        </div>
    )
}
