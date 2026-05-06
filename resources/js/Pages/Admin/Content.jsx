import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Video, FileText, HelpCircle, CheckCircle, XCircle, Clock, Eye, Search } from 'lucide-react';

const typeIcon = {
    video: <Video className="h-4 w-4" />,
    module: <FileText className="h-4 w-4" />,
    quiz: <HelpCircle className="h-4 w-4" />,
};

const statusConfig = {
    approved: { label: 'Disetujui', bg: '#22c55e15', color: '#16a34a', icon: <CheckCircle className="h-4 w-4" /> },
    pending: { label: 'Menunggu', bg: '#f59e0b15', color: '#d97706', icon: <Clock className="h-4 w-4" /> },
    rejected: { label: 'Ditolak', bg: '#ef444415', color: '#ef4444', icon: <XCircle className="h-4 w-4" /> },
};

export default function Content({ contents = [] }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filtered = (contents || []).filter((content) => {
        const matchFilter = filter === 'all' || content.status === filter;
        const matchSearch = content.title.toLowerCase().includes(search.toLowerCase()) || content.tutor.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: (contents || []).length,
        pending: (contents || []).filter((content) => content.status === 'pending').length,
        approved: (contents || []).filter((content) => content.status === 'approved').length,
        rejected: (contents || []).filter((content) => content.status === 'rejected').length,
    };

    return (
        <AdminLayout title="Validasi Konten" subtitle="Review materi, soal, dan aset pembelajaran sebelum publish.">
            <Head title="Validasi Konten" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6">
                    <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Manajemen Konten</h1>
                    <p className="text-sm text-gray-500">Validasi dan kelola materi pembelajaran yang diunggah tutor</p>
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
                            const status = statusConfig[content.status];

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
                                        <div className="rounded-full px-2 py-1" style={{ background: status.bg }}>
                                            <div className="flex items-center gap-1.5" style={{ color: status.color }}>
                                                {status.icon}
                                                <span className="text-xs font-semibold">{status.label}</span>
                                            </div>
                                        </div>
                                        <button className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-[#F7F2E7]">
                                            <Eye className="h-4 w-4 text-gray-400" />
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
            </div>
        </AdminLayout>
    );
}
