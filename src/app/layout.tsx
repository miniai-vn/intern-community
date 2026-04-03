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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col items-center gap-2">
        <AuthSessionProvider>
          <Navbar />
          <span className="h-0.5 w-3/5 max-lg:w-[95%] bg-deep-ocen rounded-2xl"></span>
          <main className="flex-1 flex justify-center w-full">{children}</main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
