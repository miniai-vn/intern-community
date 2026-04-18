interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    loading?: boolean;
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, loading }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl transition-all">
                <div className="flex flex-col items-center text-center">
                    {/* Icon Cảnh báo */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="mt-2 text-sm text-gray-400">
                        Hành động này không thể hoàn tác. Dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                    </p>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-700 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    >
                        {loading ? "Đang xóa..." : "Xác nhận xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
}