import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthSessionProvider } from "@/components/session-provider";

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist",
    weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
    title: "Intern Community Hub",
    description: "An open platform for the TD developer community to submit and discover mini-app modules.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${geist.variable} font-sans`}>
        <body className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-blue-50 text-gray-900 antialiased">
        <AuthSessionProvider>
            <div className="relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-orange-200/20 via-transparent to-transparent opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent opacity-30" />

                <Navbar />
                <main className="relative z-10">
                    {children}
                </main>
            </div>
        </AuthSessionProvider>
        </body>
        </html>
    );
}