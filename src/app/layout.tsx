import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthSessionProvider } from "@/components/session-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Intern Community Hub",
  description:
    "An open platform for the TD developer community to submit and discover mini-app modules.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-stone-900">
        <AuthSessionProvider>
          <Navbar />
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full">{children}</div>
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
