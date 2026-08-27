import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthSessionProvider } from "@/components/session-provider";
import { SupportChatWidget } from "@/components/support-chat/support-chat-widget";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Intern Community Hub",
  description:
    "An open platform for the TD developer community to submit and discover mini-app modules.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 font-sans">
        <AuthSessionProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            {children}
          </main>
          <SupportChatWidget />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
