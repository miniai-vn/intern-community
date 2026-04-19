import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthSessionProvider } from "@/components/session-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "InternHub — Community Module Platform",
  description:
    "An open platform for the TD developer community to submit and discover mini-app modules.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="flex min-h-full flex-col bg-[#f8fafc] font-sans">
        <AuthSessionProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 page-enter">
            {children}
          </main>
          {/* Footer */}
          <footer className="mt-auto border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">InternHub</span>
                </div>
                <p className="text-xs text-slate-400">
                  Built with ❤️ by TD Intern Community · {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </footer>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
