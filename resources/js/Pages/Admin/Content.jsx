import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Video, FileText, HelpCircle, CheckCircle, XCircle, Clock, Eye, Search } from 'lucide-react';

const contents = [
    { id: 1, title: 'Intro_Matematika_UTBK_Sesi1.mp4', tutor: 'Dr. Ahmad Fauzi', type: 'video', size: '245 MB', submitted: '27 Apr 2025', status: 'pending' },
    { id: 2, title: 'Modul_Bab2_Kalkulus.pdf', tutor: 'Prof. Dewi Rahayu', type: 'module', size: '4.2 MB', submitted: '26 Apr 2025', status: 'approved' },
    { id: 3, title: 'Quiz_Aljabar_Linear.xlsx', tutor: 'Dr. Ahmad Fauzi', type: 'quiz', size: '0.9 MB', submitted: '25 Apr 2025', status: 'rejected' },
    { id: 4, title: 'React_Hooks_Tutorial.mp4', tutor: 'Budi Santoso', type: 'video', size: '312 MB', submitted: '24 Apr 2025', status: 'pending' },
    { id: 5, title: 'Modul_Fisika_Dasar.pdf', tutor: 'Prof. Dewi Rahayu', type: 'module', size: '6.8 MB', submitted: '23 Apr 2025', status: 'approved' },
    { id: 6, title: 'Bank_Soal_SNBT.json', tutor: 'Tim BRICS', type: 'quiz', size: '2.1 MB', submitted: '22 Apr 2025', status: 'pending' },
];

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

export default function Content() {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filtered = contents.filter((content) => {
        const matchFilter = filter === 'all' || content.status === filter;
        const matchSearch = content.title.toLowerCase().includes(search.toLowerCase()) || content.tutor.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: contents.length,
        pending: contents.filter((content) => content.status === 'pending').length,
        approved: contents.filter((content) => content.status === 'approved').length,
        rejected: contents.filter((content) => content.status === 'rejected').length,
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
                                    <div className="flex flex-shrink-0 items-center gap-3">
                                        <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs" style={{ background: status.bg, color: status.color, fontWeight: 600 }}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                        <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#691D1B15] hover:text-[#691D1B]">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {content.status === 'pending' && (
                                            <>
                                                <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Setujui
                                                </button>
                                                <button className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50">
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Tolak
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-sm text-gray-400">Tidak ada konten yang cocok dengan filter.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
