import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock, ArrowUpDown, Eye, TimerOff } from 'lucide-react';

export default function Transactions({ transactions = [], stats = {}, filters = {} }) {
    const transactionList = Array.isArray(transactions?.data) ? transactions.data : transactions;
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '');
    const [dateTo, setDateTo] = useState(filters.dateTo ?? '');
    const [sortOrder, setSortOrder] = useState(filters.sort ?? 'desc');
    const initialRender = useRef(true);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            const params = {};

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            if (search) {
                params.search = search;
            }

            if (dateFrom) {
                params.dateFrom = dateFrom;
            }

            if (dateTo) {
                params.dateTo = dateTo;
            }

            if (sortOrder !== 'desc') {
                params.sort = sortOrder;
            }

            router.get(route('admin.transactions'), params, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: ['transactions', 'filters'],
            });
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [statusFilter, search, dateFrom, dateTo, sortOrder]);

    const statusConfig = {
        success: { label: 'Berhasil', bg: '#22c55e15', color: '#16a34a', icon: <CheckCircle className="h-4 w-4" /> },
        pending: { label: 'Pending', bg: '#f59e0b15', color: '#d97706', icon: <Clock className="h-4 w-4" /> },
        failed: { label: 'Gagal', bg: '#ef444415', color: '#ef4444', icon: <XCircle className="h-4 w-4" /> },
        expired: { label: 'Kedaluwarsa', bg: '#64748b15', color: '#64748b', icon: <TimerOff className="h-4 w-4" /> },
    };

    const filtered = useMemo(() => {
        const result = transactionList.filter((transaction) => {
            const transactionDate = transaction.date
                ? new Date(String(transaction.date).replace(' ', 'T'))
                : null;
            const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
            const matchesSearch = String(transaction.student ?? '')
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesDateFrom = dateFrom && transactionDate
                ? transactionDate >= new Date(dateFrom)
                : true;
            const matchesDateTo = dateTo && transactionDate
                ? transactionDate <= new Date(`${dateTo}T23:59:59`)
                : true;

            return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
        });

        result.sort((a, b) => {
            const dateA = a.date ? new Date(String(a.date).replace(' ', 'T')) : new Date(0);
            const dateB = b.date ? new Date(String(b.date).replace(' ', 'T')) : new Date(0);

            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [transactionList, statusFilter, search, dateFrom, dateTo, sortOrder]);

    const handleExport = () => {
        const params = new URLSearchParams();

        if (statusFilter !== 'all') {
            params.append('status', statusFilter);
        }

        if (search) {
            params.append('search', search);
        }

        if (dateFrom) {
            params.append('dateFrom', dateFrom);
        }

        if (dateTo) {
            params.append('dateTo', dateTo);
        }

        params.append('sort', sortOrder);

        const href = route('admin.transactions.export') + (params.toString() ? `?${params.toString()}` : '');
        window.location.href = href;
    };

    return (
        <AdminLayout title="Monitoring Transaksi" subtitle="Monitor semua transaksi dan pembayaran.">
            <Head title="Monitoring Transaksi" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    {[
                        { label: 'Transaksi Berhasil', value: `${stats.successToday ?? transactionList.filter((transaction) => transaction.status === 'success').length}`, color: '#16a34a', bg: '#22c55e15' },
                        { label: 'Menunggu Konfirmasi', value: `${stats.pendingToday ?? transactionList.filter((transaction) => transaction.status === 'pending').length}`, color: '#d97706', bg: '#f59e0b15' },
                        { label: 'Transaksi Gagal', value: `${stats.failedToday ?? transactionList.filter((transaction) => transaction.status === 'failed').length}`, color: '#ef4444', bg: '#ef444415' },
                        { label: 'Kedaluwarsa', value: `${stats.expiredToday ?? transactionList.filter((transaction) => transaction.status === 'expired').length}`, color: '#64748b', bg: '#64748b15' },
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
                    <div className="border-b border-[#F7F2E7] p-5">
                        <div className="grid gap-4 xl:grid-cols-[minmax(240px,320px)_1fr] xl:items-center">
                            <div className="flex min-h-11 items-center gap-2 rounded-lg border border-[#D8D7BE] bg-[#F7F2E7] px-3 py-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama siswa..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-3 xl:items-end">
                                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                                    <div className="flex min-h-11 items-center gap-1 rounded-lg border border-[#D8D7BE] bg-white p-1">
                                        {['all', 'success', 'pending', 'failed', 'expired'].map((key) => {
                                            const labels = { all: 'Semua', success: 'Berhasil', pending: 'Pending', failed: 'Gagal', expired: 'Kedaluwarsa' };
                                            const active = statusFilter === key;

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setStatusFilter(key)}
                                                    className={`min-w-16 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                                                        active ? 'text-white' : 'text-gray-600 hover:bg-[#F7F2E7]'
                                                    }`}
                                                    style={active ? { background: '#691D1B' } : {}}
                                                >
                                                    {labels[key]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-[#D8D7BE] bg-white px-2 py-1.5">
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(event) => setDateFrom(event.target.value)}
                                            className="w-36 rounded-md border-0 px-2 py-1.5 text-sm outline-none focus:ring-0"
                                            title="Dari tanggal"
                                        />
                                        <span className="text-sm text-gray-500">s/d</span>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(event) => setDateTo(event.target.value)}
                                            className="w-36 rounded-md border-0 px-2 py-1.5 text-sm outline-none focus:ring-0"
                                            title="Sampai tanggal"
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]"
                                            title={`Urutkan ${sortOrder === 'desc' ? 'Terbaru dulu' : 'Terlama dulu'}`}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                            {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                                        </button>
                                        <button
                                            onClick={handleExport}
                                            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export Transaksi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                    {['ID Transaksi', 'Siswa', 'Kursus', 'Jumlah', 'Metode', 'Status', 'Waktu', 'Aksi'].map((heading) => (
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
                                                <span className="flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: status?.bg, color: status?.color }}>
                                                    {status?.icon}
                                                    {status?.label ?? transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-gray-500">{transaction.date}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={route('admin.transactions.show', transaction.databaseId)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-[#691D1B] hover:text-[#691D1B]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Detail
                                                </Link>
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
                        <span className="text-xs text-gray-500">
                            Menampilkan {filtered.length} dari {transactions.total ?? transactionList.length} transaksi
                        </span>
                    </div>
                </div>

                {transactions.links && transactions.last_page > 1 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {transactions.links.map((link, idx) => (
                            <a
                                key={idx}
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
            </div>
        </AdminLayout>
    );
}
