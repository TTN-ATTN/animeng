import { type Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { ExitModal } from "@/components/modals/exit-modal";
import { Toaster } from "sonner"; // Import directly from sonner package
import AuthProvider from "@/components/providers/auth-provider";

const font = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ANIMENG - Học tiếng Anh cho trẻ em",
  description: "A platform to help children learn English interactively.",
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.variable} antialiased`}>
        <AuthProvider>
          <Toaster /> {/* Added Toaster for notifications */} 
          <ExitModal/>
          <HeartsModal/>
          <PracticeModal/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
