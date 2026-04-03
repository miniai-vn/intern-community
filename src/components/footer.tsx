export function Footer() {
    return (
        <footer >
            <div className=" w-full rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-[#102a63]">Stay in the loop</h3>
                <p className="mt-1 text-sm text-[#5f6f9f]">No spam, just community updates and new module releases.</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <input
                        type="email"
                        placeholder="Email address"
                        className="w-full max-w-sm rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                        Join Newsletter
                    </button>
                </div>
            </div>

        </footer>
    );
}
