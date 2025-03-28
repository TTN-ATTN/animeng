/*
    * Component header của trang web
    * Bao gồm logo, tên trang web và nút đăng nhập
    * Nếu đã đăng nhập thì sẽ hiển thị thông tin người dùng
    * Nếu chưa đăng nhập thì sẽ hiển thị nút đăng nhập
*/
import Image from "next/image";
import { Loader, ArrowLeft } from "lucide-react";
import { ClerkLoading, ClerkLoaded, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MobileSideBar } from "@/components/ui/mobile-sidebar";
import Link from "next/link";

export const Header = () => {
    return (
        <header className="lg:hidden h-20 w-full border-b-2 border-slate-200 bg-cyan-500">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full px-4">
                <div className="lg:pl-[180px] flex items-center gap-x-3">
                    {/* import ảnh từ public hoặc external url */}
                    <Image src="/mascot.png" height={40} width={40} alt="mascot image" />
                    <h1 className="lg:text-xl text-2xl font-extrabold text-[#FFF9C4] tracking-wide">
                        <Link href="/home">ANIMENG</Link>
                    </h1>
                </div>
                <div className="hidden lg:flex">
                    <ClerkLoading>
                        <Loader className="h-5 w-5 text-muted-foreground animate-spin" size={32} />
                    </ClerkLoading>
                    <ClerkLoaded>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal" forceRedirectUrl="/learning" signUpForceRedirectUrl="/home">
                                <Button variant="default" size="lg">Đăng nhập</Button>
                            </SignInButton>
                        </SignedOut>
                    </ClerkLoaded>
                </div>
                <div className="lg:hidden">
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
                <Button variant="default" size="sm">
                    <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-500" />
                </Button>
            </Link>
            <h1 className="font-bold text-lg">
                {title}
            </h1>
            <div />
        </div>
    );
}