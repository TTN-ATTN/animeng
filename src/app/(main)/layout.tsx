import { SideBar } from "@/components/ui/sidebar";
import { Header } from "./header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
    children: React.ReactNode;
}

const MainLayout = async ({ children }: Props) => {
    const session = await auth();

    if (!session?.user) {
        redirect("/login?callbackUrl=" + encodeURIComponent("/learning")); // Redirect to login, preserving intended destination
    }

    return (
        <>
            {/* Pass session data to client components if needed, or rely on useSession hook */}
            <SideBar className="hidden lg:flex"/>
            <Header/>
            <main className="lg:pl-[256px] min-h-screen">
                <div className="min-h-screen">
                    {children} 
                </div>
            </main>
        </>
    )
}

export default MainLayout;