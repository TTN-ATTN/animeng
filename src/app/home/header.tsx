/*
    * Component header của trang web
    * Bao gồm logo, tên trang web và nút đăng nhập
    * Nếu đã đăng nhập thì sẽ hiển thị thông tin người dùng
    * Nếu chưa đăng nhập thì sẽ hiển thị nút đăng nhập
*/
import Image from "next/image";
import { Loader } from "lucide-react";
import { ClerkLoading, ClerkLoaded, SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";



export const Header = () => {
    return (
        <header className="h-20 w-full border-b-2 border-slate-200 bg-cyan-500">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-x-3">
                    {/* import ảnh từ public hoặc external url */}
                    <Image src="/anime-girl-reading.gif" height={40} width={40} alt="mascot image" unoptimized/>
                    <h1 className="text-2xl font-extrabold text-[#FFF9C4] tracking-wide">
                        <Link href="/home">ANIMENG</Link>
                    </h1>
                </div>
                {/* <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" size={32} />
                </ClerkLoading> */}
                {/* <ClerkLoaded> */}
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal" forceRedirectUrl="/learning" signUpForceRedirectUrl="/home">
                            <Button variant="default" size="lg">Đăng nhập</Button>
                        </SignInButton>
                    </SignedOut>
                {/* </ClerkLoaded> */}
            </div>
        </header>
    );
};
