"use client"; // Add this directive for client-side hooks

import Image from "next/image";
import { Loader, LogIn, LogOut } from "lucide-react";
// Removed Clerk imports
import { useSession, signIn, signOut } from "next-auth/react"; // Import NextAuth hooks
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming you have an Avatar component

export const Header = () => {
    const { data: session, status } = useSession(); // Use NextAuth session hook
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    return (
        <header className="h-20 w-full border-b-2 border-slate-200 bg-cyan-500">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-x-3">
                    <Image src="/anime-girl-reading.gif" height={40} width={40} alt="mascot image" unoptimized/>
                    <h1 className="text-2xl font-extrabold text-[#FFF9C4] tracking-wide">
                        <Link href="/home">ANIMENG</Link>
                    </h1>
                </div>
                <div className="flex items-center gap-x-4">
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
                                    <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/home" })}> 
                                        <LogOut className="h-5 w-5 mr-2"/>
                                        Đăng xuất
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="default" size="lg" onClick={() => signIn("google", { callbackUrl: "/learning" })}> 
                                    <LogIn className="h-5 w-5 mr-2"/>
                                    Đăng nhập
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

