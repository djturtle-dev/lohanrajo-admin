import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import ClarityScript from "@/components/admin/ClarityScript";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Lohanrajo Admin",
    description: "Admin panel for Lohanrajo Metal Arts CMS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
            <body className="font-sans text-brand-text min-h-screen">
                <ClarityScript />
                {children}
            </body>
        </html>
    );
}
