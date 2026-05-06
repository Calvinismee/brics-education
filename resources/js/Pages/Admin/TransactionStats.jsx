import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { TrendingUp, DollarSign, CreditCard, AlertCircle, ArrowUpRight, CheckCircle, XCircle, Clock } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
const revenueData = [42000000, 58000000, 67000000, 75000000, 88000000, 112000000];
const maxRev = Math.max(...revenueData);

const transactions = [
    { id: 'TRX-001', student: 'Andi Pratama', course: 'Matematika UTBK Intensif', amount: 'Rp 299.000', method: 'BCA', status: 'success', date: '28 Apr 2025' },
    { id: 'TRX-002', student: 'Citra Dewi', course: 'Pemrograman Web Full Stack', amount: 'Rp 399.000', method: 'GoPay', status: 'success', date: '28 Apr 2025' },
    { id: 'TRX-003', student: 'Budi Santosa', course: 'Bahasa Inggris Bisnis', amount: 'Rp 249.000', method: 'BNI', status: 'pending', date: '27 Apr 2025' },
    { id: 'TRX-004', student: 'Dimas Arya', course: 'Persiapan SNBT', amount: 'Rp 499.000', method: 'Mandiri', status: 'failed', date: '27 Apr 2025' },
    { id: 'TRX-005', student: 'Eka Putri', course: 'Matematika UTBK Intensif', amount: 'Rp 299.000', method: 'OVO', status: 'success', date: '26 Apr 2025' },
];

const statusConfig = {
    success: { label: 'Berhasil', bg: '#22c55e15', color: '#16a34a', icon: <CheckCircle className="h-4 w-4" /> },
    pending: { label: 'Pending', bg: '#f59e0b15', color: '#d97706', icon: <Clock className="h-4 w-4" /> },
    failed: { label: 'Gagal', bg: '#ef444415', color: '#ef4444', icon: <XCircle className="h-4 w-4" /> },
};

export default function TransactionStats() {
    return (
        <AdminLayout title="Statistik Transaksi" subtitle="Monitor keuangan dan pembayaran platform.">
            <Head title="Statistik Transaksi" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6">
                    <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Statistik Transaksi</h1>
                    <p className="text-sm text-gray-500">Monitor keuangan dan pembayaran platform</p>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Pendapatan', value: 'Rp 542 Jt', change: '+15.3%', icon: <DollarSign className="h-6 w-6" /> },
                        { label: 'Transaksi Hari Ini', value: '47', change: '+8.2%', icon: <CreditCard className="h-6 w-6" /> },
                        { label: 'Tingkat Keberhasilan', value: '94.2%', change: '+1.8%', icon: <TrendingUp className="h-6 w-6" /> },
                        { label: 'Pembayaran Pending', value: '12', change: '-3.5%', icon: <AlertCircle className="h-6 w-6" /> },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#691D1B15] text-[#691D1B]">
                                    {stat.icon}
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                                    <ArrowUpRight className={`h-4 w-4 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
                                    {stat.change}
                                </div>
                            </div>
                            <div className="mb-1 text-2xl font-extrabold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900">Pendapatan Bulanan</h3>
                                <p className="text-xs text-gray-400">6 bulan terakhir</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                <TrendingUp className="h-4 w-4" />
                                +15.3%
                            </div>
                        </div>
                        <div className="flex h-48 items-end justify-between gap-2">
                            {revenueData.map((value, index) => (
                                <div key={index} className="flex flex-1 flex-col items-center gap-1">
                                    <span className="text-xs text-gray-400">{(value / 1000000).toFixed(0)}Jt</span>
                                    <div className="w-full rounded-t-lg" style={{ height: `${(value / maxRev) * 140}px`, background: index === revenueData.length - 1 ? '#691D1B' : '#D8D7BE' }} />
                                    <span className="text-xs text-gray-400">{months[index]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <h3 className="mb-5 font-bold text-gray-900">Metode Pembayaran</h3>
                        <div className="space-y-4">
                            {[
                                { method: 'Transfer Bank', pct: 45, amount: 'Rp 243.9 Jt' },
                                { method: 'E-Wallet (GoPay, OVO)', pct: 35, amount: 'Rp 189.7 Jt' },
                                { method: 'Kartu Kredit/Debit', pct: 15, amount: 'Rp 81.3 Jt' },
                                { method: 'QRIS', pct: 5, amount: 'Rp 27.1 Jt' },
                            ].map((payment) => (
                                <div key={payment.method}>
                                    <div className="mb-1.5 flex justify-between text-sm">
                                        <span className="text-gray-700">{payment.method}</span>
                                        <div className="flex gap-3">
                                            <span className="font-bold text-[#691D1B]">{payment.pct}%</span>
                                            <span className="text-gray-400">{payment.amount}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-[#F7F2E7]">
                                        <div className="h-2 rounded-full" style={{ width: `${payment.pct}%`, background: '#691D1B' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#F7F2E7] p-5">
                        <h3 className="font-bold text-gray-900">Transaksi Terbaru</h3>
                        <button className="rounded-lg bg-[#691D1B] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4A1412]">
                            Lihat Semua
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                    {['ID Transaksi', 'Siswa', 'Kursus', 'Jumlah', 'Metode', 'Status', 'Tanggal'].map((heading) => (
                                        <th key={heading} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-gray-500" style={{ fontWeight: 700 }}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F7F2E7]">
                                {transactions.map((transaction) => {
                                    const status = statusConfig[transaction.status];

                                    return (
                                        <tr key={transaction.id} className="transition-colors hover:bg-[#F7F2E7]">
                                            <td className="px-5 py-4"><span className="font-mono text-xs text-gray-500">{transaction.id}</span></td>
                                            <td className="px-5 py-4"><span className="text-sm font-semibold text-gray-800">{transaction.student}</span></td>
                                            <td className="px-5 py-4"><span className="block max-w-[150px] truncate text-sm text-gray-600">{transaction.course}</span></td>
                                            <td className="px-5 py-4"><span className="text-sm font-bold text-[#691D1B]">{transaction.amount}</span></td>
                                            <td className="px-5 py-4"><span className="rounded-full bg-[#F7F2E7] px-2 py-1 text-xs text-gray-600">{transaction.method}</span></td>
                                            <td className="px-5 py-4"><span className="flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold" style={{ background: status.bg, color: status.color }}>{status.icon}{status.label}</span></td>
                                            <td className="px-5 py-4"><span className="text-xs text-gray-500">{transaction.date}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
