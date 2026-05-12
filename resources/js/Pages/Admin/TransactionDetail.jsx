import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, BookOpen, CalendarClock, CreditCard, ReceiptText, User } from 'lucide-react';

export default function TransactionDetail({ transaction }) {
    const statusConfig = {
        success: { label: 'Berhasil', className: 'bg-green-50 text-green-700 border-green-200' },
        pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
        failed: { label: 'Gagal', className: 'bg-red-50 text-red-700 border-red-200' },
    };
    const status = statusConfig[transaction.status] ?? statusConfig.pending;

    const rows = [
        { label: 'Invoice', value: transaction.invoiceNumber ?? '-' },
        { label: 'Jumlah', value: transaction.amountFormatted ?? '-' },
        { label: 'Metode', value: transaction.method ?? '-' },
        { label: 'Status asli', value: transaction.rawStatus ?? '-' },
        { label: 'Referensi gateway', value: transaction.gatewayReference ?? '-' },
        { label: 'Status enrollment', value: transaction.enrollmentStatus ?? '-' },
        { label: 'Dibayar pada', value: transaction.paidAt ?? '-' },
        { label: 'Dibuat pada', value: transaction.createdAt ?? '-' },
        { label: 'Diperbarui pada', value: transaction.updatedAt ?? '-' },
    ];

    return (
        <AdminLayout title="Detail Transaksi" subtitle="Informasi lengkap pembayaran siswa.">
            <Head title={`Detail Transaksi ${transaction.invoiceNumber ?? ''}`} />

            <div className="space-y-6 p-4 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('admin.transactions')}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D8D7BE] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#691D1B] hover:text-[#691D1B]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>

                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold ${status.className}`}>
                        {status.label}
                    </span>
                </div>

                <section className="rounded-lg border border-[#D8D7BE] bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#691D1B]">
                                <ReceiptText className="h-4 w-4" />
                                {transaction.invoiceNumber ?? '-'}
                            </div>
                            <h1 className="mt-2 text-2xl font-extrabold text-gray-900">{transaction.amountFormatted ?? '-'}</h1>
                        </div>

                        <div className="rounded-lg bg-[#F7F2E7] px-4 py-3 text-right">
                            <p className="text-xs font-semibold uppercase text-gray-500">Transaksi</p>
                            <p className="mt-1 text-sm font-bold text-gray-900">#{transaction.id}</p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 lg:grid-cols-3">
                    <section className="rounded-lg border border-[#D8D7BE] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <User className="h-4 w-4 text-[#691D1B]" />
                            Siswa
                        </div>
                        <p className="text-base font-bold text-gray-900">{transaction.student ?? '-'}</p>
                        <p className="mt-1 text-sm text-gray-500">{transaction.studentEmail ?? '-'}</p>
                    </section>

                    <section className="rounded-lg border border-[#D8D7BE] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <BookOpen className="h-4 w-4 text-[#691D1B]" />
                            Course
                        </div>
                        <p className="text-base font-bold text-gray-900">{transaction.course ?? '-'}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{transaction.courseDescription ?? '-'}</p>
                    </section>

                    <section className="rounded-lg border border-[#D8D7BE] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <CreditCard className="h-4 w-4 text-[#691D1B]" />
                            Pembayaran
                        </div>
                        <p className="text-base font-bold text-gray-900">{transaction.method ?? '-'}</p>
                        <p className="mt-1 text-sm text-gray-500">{transaction.gatewayReference ?? 'Tanpa referensi gateway'}</p>
                    </section>
                </div>

                <section className="overflow-hidden rounded-lg border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="border-b border-[#F7F2E7] px-5 py-4">
                        <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                            <CalendarClock className="h-4 w-4 text-[#691D1B]" />
                            Rincian
                        </div>
                    </div>
                    <div className="divide-y divide-[#F7F2E7]">
                        {rows.map((row) => (
                            <div key={row.label} className="grid gap-2 px-5 py-4 md:grid-cols-[220px_1fr]">
                                <div className="text-sm font-semibold text-gray-500">{row.label}</div>
                                <div className="text-sm font-bold text-gray-900">{row.value}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
