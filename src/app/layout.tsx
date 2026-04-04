import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthSessionProvider } from "@/components/session-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Intern Community Hub",
  description:
    "Nền tảng chia sẻ mini-app và module cho cộng đồng thực tập sinh TD — gửi bài, bình chọn và khám phá.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 font-sans">
        <AuthSessionProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
