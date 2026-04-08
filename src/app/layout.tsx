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
    <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-gray-50 font-sans">
        <AuthSessionProvider>
          <div className="mx-auto w-full max-w-6xl px-4 py-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <Navbar />
              <main className="p-8">
                {children}
              </main>
            </div>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
