"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "@/components/ui/sidebar-items";
import { useSession, signOut } from "next-auth/react";
import { Loader, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

type Props = {
    className?: string;
};

export const SideBar = ({ className }: Props) => {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            className={cn(
                "flex flex-col lg:w-[256px] min-h-screen lg:fixed left-0 top-0 px-4 border-r-2 bg-cyan-100",
                className
            )}
        >
            {/* Logo */}
            <div className="hidden lg:flex pl-4 pt-8 items-center gap-x-3">
                <Image
                    src="/anime-girl-reading.gif"
                    height={40}
                    width={40}
                    alt="mascot image"
                />
                <h1 className="lg:text-xl text-2xl font-extrabold text-amber-300 tracking-wide">
                    <Link href="/">ANIMENG</Link>
                </h1>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-y-4 pt-8 flex-grow">
                <SidebarItem label="Học" href="/learning" iconSrc="/learn.svg" />
                <SidebarItem label="Xếp hạng" href="/leaderboard" iconSrc="/leaderboard.svg" />
                <SidebarItem label="Cửa hàng" href="/shop" iconSrc="/shop.svg" />
                <SidebarItem label="Nhiệm vụ" href="/quests" iconSrc="/quests.svg" />
                <SidebarItem label="Chat with waifu" href="/chat" iconSrc="/waifu1.png" />
            </div>

            {/* User Section */}
            <div className="p-4 mt-auto" ref={dropdownRef}>
                {isLoading && (
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                )}

                {!isLoading && isAuthenticated && session?.user && (
                    <div className="relative">
                        <button
                            className="flex items-center gap-x-2 w-full"
                            onClick={() => setDropdownOpen((prev) => !prev)}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={session.user.image ?? ""}
                                    alt={session.user.name ?? "User Avatar"}
                                />
                                <AvatarFallback>
                                    {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate">
                                {session.user.name ?? "User"}
                            </span>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-40 bg-white shadow-lg border rounded-md z-50">
                                <div className="p-3 text-sm text-gray-800 border-b">
                                    {session.user.name}
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
