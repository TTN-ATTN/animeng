"use client"; // Add this directive for client-side hooks

import Image from "next/image";
// Removed Clerk imports
import { useSession, signIn } from "next-auth/react"; // Import NextAuth hooks
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import Link from "next/link";

const HomePage = () => {
    const { data: session, status } = useSession(); // Use NextAuth session hook
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    return (
        <div className="max-w-[980px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
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
                                    {/* NextAuth doesn't have a direct SignUpButton equivalent. 
                                        signIn handles both sign-in and sign-up for OAuth providers. 
                                        For credentials provider, you'd build a separate sign-up form/page. 
                                        Assuming Google provider for now. */}
                                    <Button variant="greenBtn" size="lg" className="w-full" onClick={() => signIn("google", { callbackUrl: "/learning" })}>
                                        Bắt đầu
                                    </Button>
                                    <Button variant="default" size="lg" className="w-full" onClick={() => signIn("google", { callbackUrl: "/learning" })}>
                                        Tôi đã có tài khoản
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
