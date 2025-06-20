import { Header } from "./header";
import { Footer } from "./footer";
import { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Home - ANIMENG",
  robots: {
    index: true,
    follow: true,
  }
};

const HomeLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 flex flex-col justify-center items-center">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default HomeLayout;
