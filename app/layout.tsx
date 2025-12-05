import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rent Manager",
  description: "Manage your rental properties",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
