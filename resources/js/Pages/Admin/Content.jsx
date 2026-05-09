import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Video, FileText, HelpCircle, CheckCircle, XCircle, Clock, Eye, Search, Check, X } from 'lucide-react';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';

const typeIcon = {
    video: <Video className="h-4 w-4" />,
    module: <FileText className="h-4 w-4" />,
    bank_soal: <HelpCircle className="h-4 w-4" />,
};

const statusConfig = {
    approved: { label: 'Disetujui', bg: '#22c55e15', color: '#16a34a', icon: <CheckCircle className="h-4 w-4" /> },
    pending: { label: 'Menunggu', bg: '#f59e0b15', color: '#d97706', icon: <Clock className="h-4 w-4" /> },
    rejected: { label: 'Ditolak', bg: '#ef444415', color: '#ef4444', icon: <XCircle className="h-4 w-4" /> },
};

export default function Content({ contents = [], stats = {} }) {
    const contentList = Array.isArray(contents?.data) ? contents.data : contents;
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [rejectTarget, setRejectTarget] = useState(null);
    const normalizedSearch = search.toLowerCase();

    const filtered = (contentList || []).filter((content) => {
        const matchFilter = filter === 'all' || content.status === filter;
        const title = String(content.title || '').toLowerCase();
        const tutor = String(content.tutor || '').toLowerCase();
        const matchSearch = title.includes(normalizedSearch) || tutor.includes(normalizedSearch);
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
    };

    const closeRejectConfirm = () => {
        setRejectTarget(null);
    };

    const handleReject = () => {
        if (!rejectTarget) {
            return;
        }

        router.post(route('admin.content.reject', rejectTarget.id), {}, {
            preserveScroll: true,
            onSuccess: closeRejectConfirm,
            onError: closeRejectConfirm,
        });
    };

    return (
        <AdminLayout title="Validasi Konten" subtitle="Review materi, soal, dan aset pembelajaran sebelum publish.">
            <Head title="Validasi Konten" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6">
                    <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Manajemen Konten</h1>
                    <p className="text-sm text-gray-500">Validasi dan kelola materi pembelajaran yang diunggah tutor</p>
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

                            return (
                                <div key={content.id} className="flex items-center gap-4 p-5 transition-colors hover:bg-[#F7F2E7]">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: '#691D1B15', color: '#691D1B' }}>
                                        {typeIcon[content.type]}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-800">{content.title}</p>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                                            <span>{content.tutor}</span>
                                            <span>•</span>
                                            <span>{content.size}</span>
                                            <span>•</span>
                                            <span>{content.submitted}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isPending && (
                                            <>
                                                <button
                                                    onClick={() => router.post(route('admin.content.approve', content.id), {}, { preserveScroll: true })}
                                                    className="group flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 active:translate-y-0"
                                                    type="button"
                                                    title="Setujui konten"
                                                >
                                                    <Check className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openRejectConfirm(content)}
                                                    className="group flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 active:translate-y-0"
                                                    type="button"
                                                    title="Tolak konten"
                                                >
                                                    <X className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        <div className="rounded-full px-2 py-1" style={{ background: status.bg }}>
                                            <div className="flex items-center gap-1.5" style={{ color: status.color }}>
                                                {status.icon}
                                                <span className="text-xs font-semibold">{status.label}</span>
                                            </div>
                                        </div>
                                        <button className="group flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7F2E7] active:translate-y-0" title="Lihat konten">
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

                    <DeleteConfirmModal
                        open={!!rejectTarget}
                        title="Yakin menolak konten ini?"
                        description={rejectTarget ? `${rejectTarget.title} akan dipindahkan ke status ditolak.` : ''}
                        details={rejectTarget ? (
                            <>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tutor</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">{rejectTarget.tutor}</p>
                                <p className="mt-3 text-xs text-gray-500">Tipe: {rejectTarget.type}</p>
                            </>
                        ) : null}
                        confirmLabel="Ya, tolak konten"
                        onCancel={closeRejectConfirm}
                        onConfirm={handleReject}
                    />
            </div>
        </AdminLayout>
    );
}
