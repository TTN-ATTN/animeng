import { SideBar } from "@/components/ui/sidebar";
import { Header } from "./header";

type Props = {
    children: React.ReactNode;
}

const MainLayout = ({ children, }: Props) => {
    return (
        <>
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