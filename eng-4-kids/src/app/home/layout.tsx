// Home layout áp dụng cho các trang trong cùng một route của website 
import { Header } from "./header";
import { Footer } from "./footer";

type Props = {
    children: React.ReactNode;
}

const HomeLayout = ({ children }: Props) => {
    return (
        <div className="min h-screen bg-gray-100">
            <Header/>
            <main className="flex flex-1 flex-col justify-center items-center">
                {children}
            </main>
            <Footer/>
        </div>
    )
}

export default HomeLayout;