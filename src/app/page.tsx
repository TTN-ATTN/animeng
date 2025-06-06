"use client"; // Add this directive for client-side hooks

import Image from "next/image";
// Removed Clerk imports
import { useSession, signIn } from "next-auth/react"; // Import NextAuth hooks
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import Link from "next/link";
import { Header } from "@/app/home/header"; // Assuming this header is already migrated
import { Footer } from "@/app/home/footer"; 
import { redirect } from "next/navigation";

const RootPage = () => {
    const { data: session, status } = useSession(); // Use NextAuth session hook
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <main className="max-w-[980px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
                    <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
                        <Image src="/anime-girl-reading.gif" fill alt="anime-reading" unoptimized/>
                    </div>
                    <div className="flex flex-col items-center gap-y-8">
                        <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[480px] text-center">Học tiếng Anh thật dễ dàng và thú vị với ANIMENG!</h1>
                        <div className="flex flex-col gap-y-3 w-full max-w-[300px]">
                            {isLoading && (
                                <Loader className="h-5 w-5 text-muted-foreground animate-spin mx-auto" size={32} />
                            )}
                            {!isLoading && (
                                <>
                                    {isAuthenticated ? (
                                        <Link href="/learning">
                                            <Button variant="greenBtn" size="lg" className="w-full">
                                                Tiếp tục học
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href="/register">
                                                <Button variant="greenBtn" size="lg" className="w-full">
                                                    Bắt đầu
                                                </Button>
                                            </Link>
                                            <Link href="/login">
                                                <Button variant="default" size="lg" className="w-full">
                                                    Tôi đã có tài khoản
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
            </main>
            <Footer />
        </div>
    );
}

export default RootPage;
