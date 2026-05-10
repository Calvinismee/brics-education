import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import {
    Video,
    FileText,
    HelpCircle,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Search,
    Check,
    X,
    ExternalLink,
} from 'lucide-react';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import { Spinner } from '@/Components/ui/LoadingStates';
import { showSuccessToast } from '@/utils/toast';

const typeIcon = {
    video: <Video className="h-4 w-4" />,
    module: <FileText className="h-4 w-4" />,
    bank_soal: <HelpCircle className="h-4 w-4" />,
};

const typeLabels = {
    video: 'Video',
    module: 'Modul',
    bank_soal: 'Bank Soal',
};

const statusConfig = {
    approved: { label: 'Disetujui', bg: '#22c55e15', color: '#16a34a', icon: <CheckCircle className="h-4 w-4" /> },
    pending: { label: 'Menunggu', bg: '#f59e0b15', color: '#d97706', icon: <Clock className="h-4 w-4" /> },
    rejected: { label: 'Ditolak', bg: '#ef444415', color: '#ef4444', icon: <XCircle className="h-4 w-4" /> },
};

const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, '').trim();

export default function Content({ contents = [], stats = {} }) {
    const contentList = Array.isArray(contents?.data) ? contents.data : contents;
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [viewTarget, setViewTarget] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectComment, setRejectComment] = useState('');
    const [actionProcessingId, setActionProcessingId] = useState(null);
    const normalizedSearch = search.toLowerCase();

    const filtered = (contentList || []).filter((content) => {
        const matchFilter = filter === 'all' || content.status === filter;
        const title = String(content.title || '').toLowerCase();
        const tutor = String(content.tutor || '').toLowerCase();
        const course = String(content.course || '').toLowerCase();
        const matchSearch = title.includes(normalizedSearch) || tutor.includes(normalizedSearch) || course.includes(normalizedSearch);
        return matchFilter && matchSearch;
    });

    const counts = {
        all: (contentList || []).length,
        pending: (contentList || []).filter((content) => content.status === 'pending').length,
        approved: (contentList || []).filter((content) => content.status === 'approved').length,
        rejected: (contentList || []).filter((content) => content.status === 'rejected').length,
    };

    const openRejectConfirm = (content) => {
        setRejectTarget(content);
        setRejectComment(content.rejection_comment || '');
    };

    const closeRejectConfirm = () => {
        setRejectTarget(null);
        setRejectComment('');
    };

    const handleApprove = (content) => {
        const actionId = `approve-${content.id}`;

        if (actionProcessingId) {
            return;
        }

        setActionProcessingId(actionId);
        router.post(route('admin.content.approve', content.id), {}, {
            preserveScroll: true,
            onSuccess: () => showSuccessToast('Konten berhasil disetujui.'),
            onFinish: () => setActionProcessingId(null),
        });
    };

    const handleReject = () => {
        if (!rejectTarget || actionProcessingId) {
            return;
        }

        const actionId = `reject-${rejectTarget.id}`;
        setActionProcessingId(actionId);
        router.post(route('admin.content.reject', rejectTarget.id), {
            comment: rejectComment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                closeRejectConfirm();
                showSuccessToast('Konten berhasil ditolak.');
            },
            onFinish: () => setActionProcessingId(null),
        });
    };

    return (
        <AdminLayout title="Validasi Konten" subtitle="Review materi, soal, dan aset pembelajaran yang diunggah tutor.">
            <Head title="Validasi Konten" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Validasi Konten</h1>
                        <p className="text-sm text-gray-500">Setujui atau tolak materi pembelajaran sebelum dipublikasikan.</p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        { label: 'Total Konten', value: stats.totalContent ?? counts.all },
                        { label: 'Menunggu Review', value: stats.pendingReview ?? counts.pending },
                        { label: 'Dipublikasikan', value: stats.published ?? counts.approved },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wide text-gray-400" style={{ fontWeight: 700 }}>{stat.label}</div>
                            <div className="mt-1 text-2xl font-extrabold text-gray-900">{Number(stat.value).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map((key) => {
                        const labels = { all: 'Semua', pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
                        const isActive = filter === key;

                        return (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all"
                                style={isActive ? { background: '#691D1B', color: 'white', fontWeight: 700 } : { background: 'white', color: '#374151', border: '1px solid #D8D7BE' }}
                            >
                                {labels[key]}
                                <span
                                    className="rounded-full px-1.5 py-0.5 text-xs"
                                    style={isActive ? { background: 'rgba(255,232,130,0.3)', color: '#FFE882' } : { background: '#F7F2E7', color: '#691D1B' }}
                                >
                                    {counts[key]}
                                </span>
                            </button>
                        );
                    })}
                    <div className="ml-auto flex items-center gap-2 rounded-lg border border-[#D8D7BE] bg-white px-3 py-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari konten..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-40 bg-transparent text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="divide-y divide-[#F7F2E7]">
                        {filtered.map((content) => {
                            const status = statusConfig[content.status] ?? statusConfig.pending;
                            const isPending = content.status === 'pending';
                            const approveActionId = `approve-${content.id}`;
                            const rejectActionId = `reject-${content.id}`;
                            const isApproving = actionProcessingId === approveActionId;
                            const isRejecting = actionProcessingId === rejectActionId;

                            return (
                                <div key={content.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-[#F7F2E7] lg:flex-row lg:items-center">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: '#691D1B15', color: '#691D1B' }}>
                                        {typeIcon[content.type] ?? typeIcon.module}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-800">{content.title}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                                            <span>{content.course || '-'}</span>
                                            <span>{content.tutor}</span>
                                            <span>{content.size}</span>
                                            <span>{content.submitted}</span>
                                        </div>
                                        {content.rejection_comment && (
                                            <p className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                                                {content.rejection_comment}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                        {isPending && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(content)}
                                                    disabled={!!actionProcessingId}
                                                    className="group flex min-w-24 items-center justify-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                                                    type="button"
                                                    title="Setujui konten"
                                                >
                                                    {isApproving ? <Spinner size="xs" color="#16a34a" /> : <Check className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />}
                                                    {isApproving ? 'Memproses...' : 'Setujui'}
                                                </button>
                                                <button
                                                    onClick={() => openRejectConfirm(content)}
                                                    disabled={!!actionProcessingId}
                                                    className="group flex min-w-24 items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                                                    type="button"
                                                    title="Tolak konten"
                                                >
                                                    {isRejecting ? <Spinner size="xs" color="#dc2626" /> : <X className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />}
                                                    {isRejecting ? 'Memproses...' : 'Tolak'}
                                                </button>
                                            </>
                                        )}
                                        <div className="rounded-full px-2 py-1" style={{ background: status.bg }}>
                                            <div className="flex items-center gap-1.5" style={{ color: status.color }}>
                                                {status.icon}
                                                <span className="text-xs font-semibold">{status.label}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setViewTarget(content)}
                                            className="group flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                                            title="Lihat konten"
                                        >
                                            <Eye className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#691D1B]" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-gray-500">Tidak ada konten ditemukan</p>
                        </div>
                    )}
                </div>

                {contents.links && contents.links.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {contents.links.map((link, index) => (
                            <a
                                key={`${link.label}-${index}`}
                                href={link.url || '#'}
                                className={`rounded px-3 py-2 text-sm ${
                                    link.active
                                        ? 'bg-[#691D1B] text-white'
                                        : link.url
                                            ? 'border border-[#D8D7BE] text-gray-700 hover:bg-[#F7F2E7]'
                                            : 'text-gray-400'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {viewTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="flex items-start justify-between gap-4 border-b border-[#F7F2E7] p-5">
                                <div>
                                    <h3 className="text-lg font-extrabold text-gray-900">{viewTarget.title}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{viewTarget.course || '-'} - {viewTarget.tutor}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewTarget(null)}
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                                    title="Tutup"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4 p-5">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded-full bg-[#691D1B15] px-2 py-1 font-semibold text-[#691D1B]">{typeLabels[viewTarget.type] || viewTarget.type}</span>
                                    <span className="rounded-full px-2 py-1 font-semibold" style={{ background: (statusConfig[viewTarget.status] ?? statusConfig.pending).bg, color: (statusConfig[viewTarget.status] ?? statusConfig.pending).color }}>
                                        {(statusConfig[viewTarget.status] ?? statusConfig.pending).label}
                                    </span>
                                    <span className="text-gray-400">{viewTarget.submitted}</span>
                                </div>

                                {viewTarget.file_url && (
                                    <a
                                        href={viewTarget.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm font-semibold text-[#691D1B] transition-colors hover:bg-[#F7F2E7]"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Buka file
                                    </a>
                                )}

                                <div className="max-h-72 overflow-y-auto rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                        {stripHtml(viewTarget.content) || 'Tidak ada isi konten.'}
                                    </p>
                                </div>

                                {viewTarget.rejection_comment && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                        <p className="mb-1 text-xs font-semibold uppercase text-red-500">Komentar Penolakan</p>
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-red-700">{viewTarget.rejection_comment}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DeleteConfirmModal
                    open={!!rejectTarget}
                    title="Yakin menolak konten ini?"
                    description={rejectTarget ? `${rejectTarget.title} akan dipindahkan ke status ditolak.` : ''}
                    details={rejectTarget ? (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tutor</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">{rejectTarget.tutor}</p>
                            <p className="mt-3 text-xs text-gray-500">Tipe: {typeLabels[rejectTarget.type] || rejectTarget.type}</p>
                            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500" htmlFor="reject-comment">
                                Komentar
                            </label>
                            <textarea
                                id="reject-comment"
                                value={rejectComment}
                                onChange={(event) => setRejectComment(event.target.value)}
                                maxLength={1000}
                                rows={4}
                                className="mt-2 w-full resize-none rounded-xl border border-[#D8D7BE] bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-[#691D1B]"
                                placeholder="Tuliskan catatan untuk tutor"
                            />
                            <p className="mt-1 text-right text-[11px] text-gray-400">{rejectComment.length}/1000</p>
                        </>
                    ) : null}
                    confirmLabel="Ya, tolak konten"
                    processing={!!rejectTarget && actionProcessingId === `reject-${rejectTarget.id}`}
                    onCancel={closeRejectConfirm}
                    onConfirm={handleReject}
                />
            </div>
        </AdminLayout>
    );
}
