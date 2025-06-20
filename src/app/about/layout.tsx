import { Metadata } from "next";
import { Header } from "./header";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "ANIMENG - ABOUT",
  robots: {
    index: true,
    follow: true,
  }
};

const AboutLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex flex-col justify-center items-center">
        {children}
      </main>
    </div>
  );
};

export default AboutLayout;
