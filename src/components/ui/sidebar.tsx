"use client"; // Add this directive for client-side hooks

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "@/components/ui/sidebar-items";
// Removed Clerk imports
import { useSession, signOut } from "next-auth/react"; // Import NextAuth hooks
import { Loader, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming you have an Avatar component
import { Button } from "@/components/ui/button"; // Import Button for logout

type Props = {
    className?: string;
}

export const SideBar = ({ className }: Props) => {
    const { data: session, status } = useSession(); // Use NextAuth session hook
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    return (
        <div className={cn("flex flex-col lg:w-[256px] min-h-screen lg:fixed left-0 top-0 px-4 border-r-2 bg-cyan-100", className)}>
            {/* Logo Section */}
            <div className="hidden lg:flex pl-4 pt-8 items-center gap-x-3">
                <Image src="/anime-girl-reading.gif" height={40} width={40} alt="mascot image" />
                <h1 className="lg:text-xl text-2xl font-extrabold text-amber-300 tracking-wide">
                    <Link href="/home">ANIMENG</Link>
                </h1>
            </div>

            {/* Sidebar Items - Grow to push User Info/Logout down */}
            <div className="flex flex-col gap-y-4 pt-8 flex-grow">
                <SidebarItem label="Học" href="/learning" iconSrc="/learn.svg"/>
                <SidebarItem label="Xếp hạng" href="/leaderboard" iconSrc="/leaderboard.svg"/>
                <SidebarItem label="Cửa hàng" href="/shop" iconSrc="/shop.svg"/>
                <SidebarItem label="Nhiệm vụ" href="/quests" iconSrc="/quests.svg"/>
                <SidebarItem label="Chat with waifu" href="/chat" iconSrc="/waifu1.png"/>
            </div>

            {/* User Info / Logout Button - Stays at the bottom */}
            <div className="p-4 mt-auto">
                {isLoading && (
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin"/>
                )}
                {!isLoading && isAuthenticated && session?.user && (
                    <div className="flex items-center gap-x-2">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User Avatar"} />
                            <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{session.user.name ?? "User"}</span>
                        {/* Optional: Add logout button here as well or rely on header */} 
                        {/* <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/home" })}> 
                            <LogOut className="h-5 w-5"/>
                        </Button> */} 
                    </div>
                )}
                 {/* Optionally show a login button if not authenticated, though sidebar might only be for logged-in users */}
                 {/* {!isLoading && !isAuthenticated && (
                    <Button variant="outline" onClick={() => signIn("google")}>Login</Button>
                 )} */} 
            </div>
        </div>
    )
}

