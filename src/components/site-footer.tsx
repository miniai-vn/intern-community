import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-indigo-300/15 bg-slate-950/40 px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-360 flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="font-semibold text-violet-300">InternHub</p>
          <p className="mt-1 text-xs text-slate-500">
            © 2026 InternHub. Crafted for the digital sanctuary.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6 text-xs text-slate-500">
          <Link href="#" className="transition hover:text-sky-200">
            Privacy Policy
          </Link>
          <Link href="#" className="transition hover:text-sky-200">
            Terms of Service
          </Link>
          <Link href="#" className="transition hover:text-sky-200">
            Support
          </Link>
          <Link href="#" className="transition hover:text-sky-200">
            API Docs
          </Link>
        </nav>
      </div>
    </footer>
  );
}
