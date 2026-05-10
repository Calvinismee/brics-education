import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart3, Download, FileText, ReceiptText, Users } from 'lucide-react';

export default function ReportsExport({ reports = [], stats = {} }) {
    const availableReports = stats.availableReports ?? reports.length;
    const lastExport = stats.lastExport ?? 'Belum ada export';
    const reportShortcuts = [
        {
            title: 'Laporan Transaksi',
            description: 'Rekap pembayaran dan status transaksi.',
            href: route('admin.transactions'),
            icon: ReceiptText,
            action: 'Buka transaksi',
        },
        {
            title: 'Laporan Pengguna',
            description: 'Data siswa, tutor, dan admin.',
            href: route('admin.users'),
            icon: Users,
            action: 'Buka pengguna',
        },
        {
            title: 'Laporan Pendapatan',
            description: 'Grafik pendapatan dan metode pembayaran.',
            href: route('admin.transaction-stats'),
            icon: BarChart3,
            action: 'Buka statistik',
        },
    ];

    return (
        <AdminLayout title="Laporan Sistem" subtitle="Rekap operasional dan histori export.">
            <Head title="Laporan Sistem" />

            <div className="space-y-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Laporan Sistem</h1>
                    <p className="mt-1 text-sm text-gray-500">Rekap lintas modul untuk kebutuhan administrasi.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-lg border border-[#D8D7BE] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Laporan tersedia</p>
                                <p className="mt-2 text-3xl font-black text-[#691D1B]">{availableReports}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#691D1B]/10 text-[#691D1B]">
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-[#D8D7BE] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Export terakhir</p>
                                <p className="mt-2 text-lg font-bold text-gray-900">{lastExport}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFE882]/40 text-[#691D1B]">
                                <Download className="h-6 w-6" />
                            </div>
                        </div>
                    </section>
                </div>

                <section className="grid gap-4 lg:grid-cols-3">
                    {reportShortcuts.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="rounded-lg border border-[#D8D7BE] bg-white p-5 shadow-sm transition hover:border-[#691D1B] hover:bg-[#F7F2E7]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">{item.title}</h2>
                                        <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#691D1B]/10 text-[#691D1B]">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-5 text-sm font-semibold text-[#691D1B]">{item.action}</div>
                            </Link>
                        );
                    })}
                </section>

                <section className="overflow-hidden rounded-lg border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="border-b border-[#F7F2E7] px-5 py-4">
                        <h2 className="text-base font-bold text-gray-900">Riwayat Export</h2>
                    </div>

                    {reports.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                        {['Judul', 'Tipe', 'Dibuat Oleh', 'Jumlah Data', 'Tanggal'].map((heading) => (
                                            <th key={heading} className="px-5 py-3 text-left text-xs font-bold uppercase text-gray-500">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F7F2E7]">
                                    {reports.map((report) => (
                                        <tr key={report.id}>
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-800">{report.title}</td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{report.type}</td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{report.createdBy}</td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{report.rowCount ?? 0}</td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{report.createdAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-5 py-12 text-center text-sm text-gray-500">
                            Belum ada riwayat export.
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
