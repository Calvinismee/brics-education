import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Search, Filter, Download, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';

const transactions = [
    { id: 'TRX-2025-0047', student: 'Andi Pratama', course: 'Matematika UTBK Intensif', amount: 'Rp 299.000', method: 'BCA Virtual Account', status: 'success', date: '28 Apr 2025, 14:32' },
    { id: 'TRX-2025-0046', student: 'Citra Dewi', course: 'Pemrograman Web Full Stack', amount: 'Rp 399.000', method: 'GoPay', status: 'success', date: '28 Apr 2025, 11:18' },
    { id: 'TRX-2025-0045', student: 'Budi Santosa', course: 'Bahasa Inggris Bisnis', amount: 'Rp 249.000', method: 'BNI Virtual Account', status: 'pending', date: '27 Apr 2025, 16:45' },
    { id: 'TRX-2025-0044', student: 'Dimas Arya', course: 'Persiapan SNBT Komprehensif', amount: 'Rp 499.000', method: 'Mandiri Transfer', status: 'failed', date: '27 Apr 2025, 09:22' },
    { id: 'TRX-2025-0043', student: 'Eka Putri', course: 'Matematika UTBK Intensif', amount: 'Rp 299.000', method: 'OVO', status: 'success', date: '26 Apr 2025, 20:14' },
    { id: 'TRX-2025-0042', student: 'Fajar Nugroho', course: 'Data Science & AI Dasar', amount: 'Rp 449.000', method: 'DANA', status: 'success', date: '26 Apr 2025, 15:30' },
    { id: 'TRX-2025-0041', student: 'Gita Amelia', course: 'Fisika & Kimia UTBK', amount: 'Rp 329.000', method: 'BCA Virtual Account', status: 'pending', date: '25 Apr 2025, 13:08' },
];

const statusConfig = {
    success: { label: 'Berhasil', bg: '#22c55e15', color: '#16a34a', icon: <CheckCircle className="h-4 w-4" /> },
    pending: { label: 'Pending', bg: '#f59e0b15', color: '#d97706', icon: <Clock className="h-4 w-4" /> },
    failed: { label: 'Gagal', bg: '#ef444415', color: '#ef4444', icon: <XCircle className="h-4 w-4" /> },
};

export default function Transactions() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filtered = transactions.filter((transaction) => {
        const matchStatus = statusFilter === 'all' || transaction.status === statusFilter;
        const matchSearch = transaction.student.toLowerCase().includes(search.toLowerCase()) || transaction.id.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <AdminLayout title="Monitoring Transaksi" subtitle="Monitor semua transaksi dan pembayaran.">
            <Head title="Monitoring Transaksi" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Monitoring Transaksi</h1>
                        <p className="text-sm text-gray-500">Monitor semua transaksi dan pembayaran</p>
                    </div>
                    <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Berhasil Hari Ini', value: `${transactions.filter((transaction) => transaction.status === 'success').length}`, color: '#16a34a', bg: '#22c55e15' },
                        { label: 'Menunggu Konfirmasi', value: `${transactions.filter((transaction) => transaction.status === 'pending').length}`, color: '#d97706', bg: '#f59e0b15' },
                        { label: 'Gagal / Error', value: `${transactions.filter((transaction) => transaction.status === 'failed').length}`, color: '#ef4444', bg: '#ef444415' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                            <div className="mb-1 text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                            <div className="mt-3 h-1 w-full rounded-full" style={{ background: stat.bg }}>
                                <div className="h-1 rounded-full" style={{ width: '60%', background: stat.color }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="flex flex-col items-start justify-between gap-3 border-b border-[#F7F2E7] p-5 sm:flex-row sm:items-center">
                        <div className="flex gap-2">
                            {['all', 'success', 'pending', 'failed'].map((key) => {
                                const labels = { all: 'Semua', success: 'Berhasil', pending: 'Pending', failed: 'Gagal' };
                                const active = statusFilter === key;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => setStatusFilter(key)}
                                        className="rounded-lg px-3 py-1.5 text-xs transition-all"
                                        style={active ? { background: '#691D1B', color: 'white', fontWeight: 700 } : { background: '#F7F2E7', color: '#374151' }}
                                    >
                                        {labels[key]}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 rounded-lg border border-[#D8D7BE] bg-[#F7F2E7] px-3 py-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari transaksi..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-36 bg-transparent text-sm outline-none"
                                />
                            </div>
                            <button className="flex items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]">
                                <Filter className="h-4 w-4" />
                                Filter
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                    {['ID Transaksi', 'Siswa', 'Kursus', 'Jumlah', 'Metode', 'Status', 'Waktu'].map((heading) => (
                                        <th key={heading} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-gray-500" style={{ fontWeight: 700 }}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F7F2E7]">
                                {filtered.map((transaction) => {
                                    const status = statusConfig[transaction.status];

                                    return (
                                        <tr key={transaction.id} className="transition-colors hover:bg-[#F7F2E7]">
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs text-gray-500">{transaction.id}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-gray-800">{transaction.student}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="block max-w-[160px] truncate text-sm text-gray-600">{transaction.course}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-[#691D1B]">{transaction.amount}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-[#F7F2E7] px-2 py-1 text-xs text-gray-600">{transaction.method}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: status.bg, color: status.color }}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-gray-500">{transaction.date}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-sm text-gray-400">Tidak ada transaksi ditemukan.</div>
                    )}

                    <div className="flex items-center justify-between border-t border-[#D8D7BE] bg-[#F7F2E7] p-4">
                        <span className="text-xs text-gray-500">Menampilkan {filtered.length} dari {transactions.length} transaksi</span>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map((page) => (
                                <button key={page} className={`h-8 w-8 rounded-lg text-xs ${page === 1 ? 'text-white' : 'text-gray-600 hover:bg-[#691D1B15]'}`} style={page === 1 ? { background: '#691D1B', fontWeight: 700 } : {}}>
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
