import Image from "next/image";
import {
    ClerkLoading,
    ClerkLoaded,
    SignedIn,
    SignedOut,
    SignUpButton,
    SignInButton
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import Link from "next/link";
import { Header } from "@/app/home/header";
import { Footer } from "@/app/home/footer"; 

const RootPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <main className="max-w-[980px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
                    <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lq:mb-0">
                        <Image src="/anime-girl-reading.gif" fill alt="anime-reading" unoptimized/>
                    </div>
                    <div className="flex flex-col items-center gap-y-8">
                        <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[480px] text-center">Học tiếng Anh thật dễ dàng và thú vị với ANIMENG!</h1>
                        <div className="flex flex-col gap-y-3 w-full max-w-[300px]">
                            <ClerkLoading>
                                <Loader className="h-5 w-5 text-muted-foreground animate-spin" size={32} />
                            </ClerkLoading>
                            <ClerkLoaded>
                                <SignedIn>
                                    <Link href="/learning">
                                        <Button variant="greenBtn" size="lg" className="w-full">
                                            Tiếp tục học
                                        </Button>
                                    </Link>
                                </SignedIn>
                                <SignedOut>
                                    <SignUpButton>
                                        <Button variant="greenBtn" size="lg" className="w-full">Bắt đầu</Button>
                                    </SignUpButton>
                                    <SignInButton>
                                        <Button variant="default" size="lg" className="w-full">Tôi đã có tài khoản</Button>
                                    </SignInButton>
                                </SignedOut>
                            </ClerkLoaded>
                        </div>
                    </div>
            </main>
            <Footer />
        </div>
    );
}

// Export để sử dụng, nếu không export thì không thể import ở các file khác
export default RootPage;
