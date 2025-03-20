/*
    Route: /home
    Phải đặt tên là page.tsx để Next.js hiểu đây là 1 trang component
*/
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

const HomePage = () => {
    return (
        <div className="max-w-[980px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
            <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lq:mb-0">
                <Image src="/hero.svg" fill alt="Hero" />
            </div>
            <div className="flex flex-col items-center gap-y-8">
                <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[480px] text-center">Học và chơi một cách hiệu quả khi học Tiếng Anh cùng Eng4Kids</h1>
                <div>
                    <ClerkLoading>
                        <Loader className="h-5 w-5 text-muted-foreground animate-spin" size={32} />
                    </ClerkLoading>
                    <ClerkLoaded>
                        <SignedIn>
                            <Button variant="greenBtn" size="lg" className="w-full">
                                <Link href="/home/learning">Tiếp tục học</Link>
                            </Button>
                        </SignedIn>
                        <SignedOut>
                            <SignUpButton forceRedirectUrl="/home/learning">
                                <Button variant="greenBtn" size="lg" className="w-full">Bắt đầu</Button>
                            </SignUpButton>
                            <SignInButton forceRedirectUrl="/home/learning">
                                <Button variant="default" size="lg" className="w-full">Tôi đã có tài khoản</Button>
                            </SignInButton>
                        </SignedOut>
                    </ClerkLoaded>
                </div>
            </div>
        </div>
    );
}

// Export để sử dụng, nếu không export thì không thể import ở các file khác
export default HomePage;