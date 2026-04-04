import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full !bg-[#F9F9FB]">
            <div className="mx-auto max-w-[1440px] px-6">
                <div className="py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[#1D4ED8] font-bold text-base">Collaborative Lab</span>
                        <span className="text-[#94A3B8] text-[13px] font-medium tracking-wide">
                            © 2024 NEXUS FOUNDRY
                        </span>
                    </div>

                    <div className="flex items-center gap-10 text-[13px] font-bold text-[#475569]">
                        <Link href="#" className="hover:text-[#1D4ED8] transition-colors">Docs</Link>
                        <Link href="#" className="hover:text-[#1D4ED8] transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-[#1D4ED8] transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}