import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Download, Eye, Trash2, Plus, FileText } from 'lucide-react';

export default function Reports({ reports = [] }) {
    return (
        <AdminLayout title="Laporan" subtitle="Buat dan kelola laporan data platform.">
            <Head title="Laporan" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Laporan</h1>
                        <p className="text-sm text-gray-500">Buat dan kelola laporan analisis data platform</p>
                    </div>
                    <Link
                        href={route('admin.reports.export')}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412]"
                        style={{ background: '#691D1B', fontWeight: 600 }}
                    >
                        <Plus className="h-4 w-4" />
                        Buat Laporan
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                    {['Judul Laporan', 'Tipe', 'Dibuat Oleh', 'Tanggal', 'Status', 'Aksi'].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-5 py-3 text-left text-xs uppercase tracking-wide text-gray-500"
                                            style={{ fontWeight: 700 }}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F7F2E7]">
                                {(reports || []).map((report) => (
                                    <tr key={report.id} className="transition-colors hover:bg-[#F7F2E7]">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#691D1B15]" style={{ color: '#691D1B' }}>
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">{report.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: 'var(--brics-cream)', color: 'var(--brics-maroon)' }}>
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-700">{report.createdBy}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-700">{report.createdAt}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: '#22c55e15', color: '#16a34a' }}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 rounded-lg hover:bg-[#F7F2E7] transition-colors">
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-[#F7F2E7] transition-colors">
                                                    <Download className="h-4 w-4 text-gray-400" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-[#F7F2E7] transition-colors">
                                                    <Trash2 className="h-4 w-4 text-gray-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {(reports || []).length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-gray-500">Tidak ada laporan tersedia</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
