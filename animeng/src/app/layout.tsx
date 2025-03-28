import { type Metadata } from "next";
import { Nunito } from "next/font/google";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import "./globals.css";

const font = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ANIMENG - Học tiếng Anh cho trẻ em",
  description: "A platform to help children learn English interactively.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Redirect to home after sign out
    <ClerkProvider afterSignOutUrl={"/home"}> 
      <html lang="en">
        <body className={`${font.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}