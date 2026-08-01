import type { Metadata } from "next";
import { Oswald, Cormorant_Garamond, Poppins, Forum } from "next/font/google";
import "./globals.css";
import ClarityScript from "@/components/admin/ClarityScript";
import AnimatedBackground from "@/components/admin/AnimatedBackground";
import { ThemeProvider } from "@/components/admin/ThemeProvider";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ['normal', 'italic'], variable: "--font-cormorant" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });
const forum = Forum({ subsets: ["latin"], weight: ["400"], variable: "--font-forum" });

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
        <html lang="en" className={`${oswald.variable} ${cormorant.variable} ${poppins.variable} ${forum.variable}`} suppressHydrationWarning>
            <body className="font-sans bg-brand-bg text-brand-text min-h-screen selection:bg-brand-accent selection:text-brand-bg" suppressHydrationWarning>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AnimatedBackground />
                    <ClarityScript />
                    <div className="relative z-10 flex flex-col min-h-screen">
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
