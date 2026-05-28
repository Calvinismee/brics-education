import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { TrendingUp, DollarSign, CreditCard, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TransactionStats({ stats = [], summary = {}, paymentMethods = [], successRate = 0, recentTransactions = [] }) {
    const { monthlyRevenue = [], averageTransaction = 0, transactionGrowth = 0, totalRevenue = 0 } = summary;
    const chartData = stats.length > 0 ? stats : monthlyRevenue;

    const maxValue = chartData.length > 0 ? Math.max(...chartData.map((item) => Number(item.amount) || 0), 1) : 1;

    const statusConfig = {
        success: { label: 'Berhasil', bg: '#22c55e15', color: '#16a34a', icon: <CheckCircle className="h-4 w-4" /> },
        pending: { label: 'Pending', bg: '#f59e0b15', color: '#d97706', icon: <Clock className="h-4 w-4" /> },
        failed: { label: 'Gagal', bg: '#ef444415', color: '#ef4444', icon: <XCircle className="h-4 w-4" /> },
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const formatChartAmount = (value) => {
        const amount = Number(value) || 0;
        const formatter = new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: amount >= 1000000 ? 1 : 0,
        });

        if (amount >= 1000000) {
            return `Rp${formatter.format(amount / 1000000)} jt`;
        }

        if (amount >= 1000) {
            return `Rp${formatter.format(amount / 1000)} rb`;
        }

        return formatCurrency(amount);
    };

    const overviewCards = [
        { label: 'Total Pendapatan', value: formatCurrency(totalRevenue), icon: <DollarSign className="h-6 w-6" /> },
        { label: 'Rata-rata Transaksi/Bulan', value: formatCurrency(averageTransaction), icon: <CreditCard className="h-6 w-6" /> },
        { label: 'Tingkat Keberhasilan', value: `${successRate}%`, icon: <TrendingUp className="h-6 w-6" /> },
        { label: 'Pertumbuhan', value: `${transactionGrowth.toFixed(1)}%`, icon: <AlertCircle className="h-6 w-6" /> },
    ];

    return (
        <AdminLayout title="Statistik Transaksi" subtitle="Monitor keuangan dan pembayaran platform.">
            <Head title="Statistik Transaksi" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {/* Overview Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {overviewCards.map((card, idx) => (
                        <div key={idx} className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#691D1B15', color: '#691D1B' }}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="mb-1 text-2xl font-extrabold text-gray-900">{card.value}</div>
                            <div className="text-sm text-gray-500">{card.label}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Revenue Chart */}
                    <div className="rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                                    Pendapatan Bulanan
                                </h3>
                                <p className="text-xs text-gray-400">6 bulan terakhir</p>
                            </div>
                        </div>
                        <div className="flex h-48 items-end justify-between gap-2">
                            {(chartData || []).map((item, i) => {
                                const amount = Number(item.amount) || 0;
                                const barHeight = maxValue > 0 ? (amount / maxValue) * 140 : 0;

                                return (
                                    <div key={item.periodKey ?? item.period ?? i} className="flex flex-1 flex-col items-center gap-1">
                                        <span className="text-xs text-gray-400">{formatChartAmount(amount)}</span>
                                        <div
                                            className="w-full rounded-t-lg"
                                            style={{
                                                height: `${barHeight}px`,
                                                background: i === (chartData || []).length - 1 ? '#691D1B' : '#D8D7BE',
                                                minHeight: '4px',
                                            }}
                                        />
                                        <span className="text-xs text-gray-400">{item.period}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <h3 className="mb-5 text-gray-900" style={{ fontWeight: 700 }}>
                            Metode Pembayaran
                        </h3>
                        <div className="space-y-4">
                            {(paymentMethods || []).map((m, idx) => (
                                <div key={idx}>
                                    <div className="mb-1.5 flex justify-between text-sm">
                                        <span className="text-gray-700">{m.method}</span>
                                        <div className="flex gap-3">
                                            <span style={{ color: '#691D1B', fontWeight: 700 }}>{m.pct}%</span>
                                            <span className="text-gray-400">{formatCurrency(m.amount)}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-[#F7F2E7]">
                                        <div className="h-2 rounded-full" style={{ width: `${m.pct}%`, background: '#691D1B' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="border-b border-[#F7F2E7] p-5">
                        <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                            Transaksi Terbaru
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                    {['ID Transaksi', 'Siswa', 'Kursus', 'Jumlah', 'Metode', 'Status', 'Tanggal'].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-gray-500" style={{ fontWeight: 700 }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F7F2E7]">
                                {(recentTransactions || []).map((t) => {
                                    const sc = statusConfig[t.status] || statusConfig.pending;
                                    return (
                                        <tr key={t.id} className="transition-colors hover:bg-[#F7F2E7]">
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs text-gray-500">{t.id}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-gray-800">{t.student}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="block max-w-[160px] truncate text-sm text-gray-600">{t.course}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-[#691D1B]">{formatCurrency(t.amount)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-[#F7F2E7] px-2 py-1 text-xs text-gray-600">{t.method}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: sc.bg, color: sc.color }}>
                                                    {sc.icon}
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-gray-500">{t.date}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {(!recentTransactions || recentTransactions.length === 0) && (
                        <div className="p-12 text-center text-sm text-gray-400">Tidak ada transaksi ditemukan.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
