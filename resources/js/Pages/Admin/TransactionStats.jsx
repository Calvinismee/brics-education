import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TransactionStats({ stats = [] }) {
    const maxValue = stats.length > 0 ? Math.max(...stats.map(s => s.amount || 0)) : 1;

    return (
        <AdminLayout title="Statistik Transaksi" subtitle="Analisis data transaksi dan revenue.">
            <Head title="Statistik Transaksi" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6">
                    <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Statistik Transaksi</h1>
                    <p className="text-sm text-gray-500">Analisis tren revenue dan pertumbuhan transaksi</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                    <div className="mb-6 text-center">
                        <h3 className="font-bold text-gray-900">Total Revenue 6 Bulan</h3>
                        <p className="mt-2 text-3xl font-extrabold" style={{ color: '#691D1B' }}>
                            {stats.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                            })}
                        </p>
                    </div>

                    <div className="flex h-64 items-end justify-between gap-2">
                        {(stats || []).map((item, index) => {
                            const heightPercent = maxValue > 0 ? (item.amount / maxValue) * 100 : 0;
                            return (
                                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        {(item.amount / 1000000).toFixed(0)}M
                                    </span>
                                    <div
                                        className="w-full rounded-t-lg transition-all"
                                        style={{
                                            height: `${heightPercent}%`,
                                            background: index === (stats || []).length - 1 ? 'var(--brics-maroon)' : 'var(--brics-beige)',
                                            minHeight: '20px',
                                        }}
                                    />
                                    <span className="text-xs text-gray-400">{item.period}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
