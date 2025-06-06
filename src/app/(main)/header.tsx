/*
    * Component header của trang web
    * Bao gồm logo, tên trang web và nút đăng nhập/đăng xuất
    * Nếu đã đăng nhập thì sẽ hiển thị thông tin người dùng (Avatar, nút đăng xuất)
    * Nếu chưa đăng nhập thì sẽ hiển thị nút đăng nhập
*/
"use client"; // Add this directive for client-side hooks

import Image from "next/image";
import { Loader, ArrowLeft, LogIn, LogOut } from "lucide-react";
// Removed Clerk imports
import { useSession, signIn, signOut } from "next-auth/react"; // Import NextAuth hooks
import { Button } from "@/components/ui/button";
import { MobileSideBar } from "@/components/ui/mobile-sidebar";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming you have an Avatar component

export const Header = () => {
    const { data: session, status } = useSession(); // Use NextAuth session hook
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    return (
        <header className="lg:hidden h-20 w-full border-b-2 border-slate-200 bg-cyan-500">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full px-4">
                <div className="lg:pl-[180px] flex items-center gap-x-3">
                    <Image src="/anime-girl-reading.gif" height={40} width={40} alt="mascot image" unoptimized/>
                    <h1 className="lg:text-xl text-2xl font-extrabold text-[#FFF9C4] tracking-wide">
                        <Link href="/">ANIMENG</Link>
                    </h1>
                </div>
                <div className="hidden lg:flex items-center gap-x-4">
                    {isLoading && (
                        <Loader className="h-5 w-5 text-muted-foreground animate-spin" size={32} />
                    )}
                    {!isLoading && (
                        <>
                            {isAuthenticated ? (
                                <div className="flex items-center gap-x-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? "User Avatar"} />
                                        <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                                    </Avatar>
                                    <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/" })}> 
                                        <LogOut className="h-5 w-5 mr-2"/>
                                        Đăng xuất
                                    </Button>
                                </div>
                            ) : (
                                // Use NextAuth signIn function. 
                                // It will redirect to the provider's page or a custom login page if configured.
                                <Button variant="default" size="lg" onClick={() => signIn("google", { callbackUrl: "/learning" })}> 
                                    <LogIn className="h-5 w-5 mr-2"/>
                                    Đăng nhập
                                </Button>
                            )}
                        </>
                    )}
                </div>
                <div className="lg:hidden">
                    {/* Pass session status to MobileSideBar if needed */} 
                    <MobileSideBar /> 
                </div>
            </div>
        </header>
    );
};

type Props = {
    title: string;
}
export const Header2 = ({ title }: Props) => {
    return (
        <div className="sticky top-0 bg-white pb-3 lg:pt-[28px] flex items-center justify-between border-b-2 mb-5 text-neutral-500 lg:z-50">
            <Link href="/courses">
                <Button variant="secondary" size="sm"> {/* Changed variant to secondary */} 
                    <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-500" />
                </Button>
            </Link>
            <h1 className="font-bold text-lg">
                {title}
            </h1>
            <div /> {/* Placeholder for potential right-side elements */} 
        </div>
    );
}
