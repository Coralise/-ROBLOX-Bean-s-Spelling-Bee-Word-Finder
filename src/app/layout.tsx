import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spelling Bee Helper",
  description: "[ROBLOX] Bean's Spelling Bee Helper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="w-full p-4 absolute flex gap-4">
        <button>
          <Link href="/">Spell Checker</Link> 
        </button>
        <button>
          <Link href="/practice">Practice</Link> 
        </button>
        </div>
        {children}
      </body>
    </html>
  );
}
