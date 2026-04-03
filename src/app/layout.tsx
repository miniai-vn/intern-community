import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthSessionProvider } from "@/components/session-provider";
import { SnowfallEffect } from "@/components/snowfall-effect";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Intern Community Hub",
  description:
    "An open platform for the TD developer community to submit and discover mini-app modules.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-sans relative">
        <style>{`
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle 600px at 20% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 80%),
                        radial-gradient(circle 400px at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 80%);
            pointer-events: none;
            z-index: 1;
          }
        `}</style>
        <SnowfallEffect />
        <div className="relative z-10 flex flex-col min-h-full">
          <AuthSessionProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
              {children}
            </main>
          </AuthSessionProvider>
        </div>
      </body>
    </html>
  );
}
