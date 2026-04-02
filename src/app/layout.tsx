import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SessionProvider } from "next-auth/react";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-white font-sans antialiased">
        <SessionProvider>
          <Navbar />
          {/* Thêm container mx-auto px-4 để căn lề 2 bên và tự co giãn */}
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}