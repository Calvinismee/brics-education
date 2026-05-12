import { AlertTriangle, Sparkles } from 'lucide-react';
import { Spinner } from '@/Components/ui/LoadingStates';

export default function DeleteConfirmModal({
    open,
    title,
    description,
    details,
    confirmLabel = 'Ya, hapus',
    processing = false,
    onCancel,
    onConfirm,
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
                <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            Konfirmasi
                        </div>
                        <h2 className="text-xl font-extrabold text-foreground">{title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    </div>
                </div>

                {details && (
                    <div className="mb-6 rounded-2xl border border-border bg-muted/40 p-4">
                        {details}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-destructive/90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {processing && <Spinner size="xs" color="#ffffff" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
