  import type { Metadata } from "next";
  import { Geist } from "next/font/google";
  import "./globals.css";
  import { Navbar } from "@/components/navbar";
  import { AuthSessionProvider } from "@/components/session-provider";
  import { ThemeProvider } from "@/components/theme-provider";
  const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

  export const metadata: Metadata = {
    title: "Intern Community Hub",
    description:
      "An open platform for the TD developer community to submit and discover mini-app modules.",
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en" className={`${geist.variable} h-full antialiased`}
      suppressHydrationWarning>
        <body className="flex min-h-full flex-col bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-[#0b0e14] dark:text-gray-100">
          <AuthSessionProvider>
          

          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            

            <Navbar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
              {children}
            </main>

          </ThemeProvider>
        </AuthSessionProvider>

        </body>
      </html>
    );
  }
