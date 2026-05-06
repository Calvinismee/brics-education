import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Download, FileText, BarChart3, Users, DollarSign, Calendar } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
const studentData = [320, 450, 580, 720, 840, 1050];
const transactionData = [42, 55, 68, 81, 95, 112];
const maxStudent = Math.max(...studentData);
const maxTransaction = Math.max(...transactionData);

export default function Reports() {
    const [reportType, setReportType] = useState('students');
    const [dateRange, setDateRange] = useState({ from: '2025-01-01', to: '2025-04-30' });

    const summaryCards = reportType === 'students'
        ? [
            { label: 'Total Siswa', value: '1.234', icon: <Users className="h-5 w-5" /> },
            { label: 'Siswa Aktif', value: '892', icon: <Users className="h-5 w-5" /> },
            { label: 'Tingkat Kelulusan', value: '94%', icon: <BarChart3 className="h-5 w-5" /> },
            { label: 'Rata-rata Progres', value: '72%', icon: <BarChart3 className="h-5 w-5" /> },
        ]
        : [
            { label: 'Total Transaksi', value: '3.847', icon: <DollarSign className="h-5 w-5" /> },
            { label: 'Total Pendapatan', value: 'Rp 542 Jt', icon: <DollarSign className="h-5 w-5" /> },
            { label: 'Tingkat Sukses', value: '94.2%', icon: <BarChart3 className="h-5 w-5" /> },
            { label: 'Rata-rata/Transaksi', value: 'Rp 285 Rb', icon: <BarChart3 className="h-5 w-5" /> },
        ];

    return (
        <AdminLayout title="Laporan & Monitoring" subtitle="Analisis data dan ekspor laporan platform.">
            <Head title="Laporan & Monitoring" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Laporan & Monitoring</h1>
                        <p className="text-sm text-gray-500">Analisis data dan ekspor laporan platform</p>
                    </div>
                    <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                        <Download className="h-4 w-4" />
                        Export Laporan
                    </button>
                </div>

                <div className="mb-6 rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-bold text-gray-900">Filter Laporan</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Jenis Laporan</label>
                            <div className="flex gap-2">
                                {[
                                    { key: 'students', label: 'Siswa', icon: <Users className="h-4 w-4" /> },
                                    { key: 'transactions', label: 'Transaksi', icon: <DollarSign className="h-4 w-4" /> },
                                ].map((report) => (
                                    <button
                                        key={report.key}
                                        onClick={() => setReportType(report.key)}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm transition-all"
                                        style={reportType === report.key ? { background: '#691D1B', color: 'white', borderColor: '#691D1B', fontWeight: 700 } : { borderColor: '#D8D7BE', color: '#374151' }}
                                    >
                                        {report.icon}
                                        {report.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Tanggal Mulai</label>
                            <input type="date" value={dateRange.from} onChange={(event) => setDateRange((previous) => ({ ...previous, from: event.target.value }))} className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-2.5 text-sm focus:border-[#691D1B] focus:outline-none" />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Tanggal Selesai</label>
                            <input type="date" value={dateRange.to} onChange={(event) => setDateRange((previous) => ({ ...previous, to: event.target.value }))} className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-2.5 text-sm focus:border-[#691D1B] focus:outline-none" />
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {summaryCards.map((stat, index) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#691D1B15] text-[#691D1B]">
                                {stat.icon}
                            </div>
                            <div className="text-xl font-extrabold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <h3 className="mb-5 font-bold text-gray-900">
                            {reportType === 'students' ? 'Pertumbuhan Siswa' : 'Pendapatan Bulanan'}
                        </h3>
                        <div className="flex h-40 items-end justify-between gap-2">
                            {(reportType === 'students' ? studentData : transactionData).map((value, index) => {
                                const maxValue = reportType === 'students' ? maxStudent : maxTransaction;
                                const dataSet = reportType === 'students' ? studentData : transactionData;

                                return (
                                    <div key={index} className="flex flex-1 flex-col items-center gap-1">
                                        <span className="text-xs text-gray-400">
                                            {reportType === 'students' ? value : `${value}Jt`}
                                        </span>
                                        <div className="w-full rounded-t-lg" style={{ height: `${(value / maxValue) * 100}px`, background: index === dataSet.length - 1 ? '#691D1B' : '#D8D7BE' }} />
                                        <span className="text-xs text-gray-400">{months[index]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <h3 className="mb-5 font-bold text-gray-900">Ekspor Data</h3>
                        <div className="space-y-3">
                            {[
                                { format: 'CSV', desc: 'Cocok untuk spreadsheet & analisis data', icon: '📊' },
                                { format: 'PDF', desc: 'Laporan terformat siap cetak', icon: '📄' },
                                { format: 'XLSX', desc: 'Format Excel dengan grafik terintegrasi', icon: '📋' },
                            ].map((format) => (
                                <div key={format.format} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#D8D7BE] p-4 transition-all hover:border-[#691D1B] hover:bg-[#F7F2E7]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{format.icon}</span>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Export {format.format}</p>
                                            <p className="text-xs text-gray-500">{format.desc}</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                        <Download className="h-3.5 w-3.5" />
                                        Unduh
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
