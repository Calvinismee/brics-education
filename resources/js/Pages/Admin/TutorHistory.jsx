import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Calendar, Clock, ExternalLink, GraduationCap, History, UserCheck, Users } from 'lucide-react';

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function TutorHistory({ history = { data: [] }, tutorSummaries = [], stats = {} }) {
    const historyItems = Array.isArray(history?.data) ? history.data : [];

    return (
        <AdminLayout title="Riwayat Mengajar Tutor" subtitle="Pantau jumlah sesi mengajar setiap tutor untuk kebutuhan laporan.">
            <Head title="Riwayat Mengajar Tutor" />

            <div className="space-y-6 p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <section className="grid gap-4 md:grid-cols-3">
                    {[
                        { label: 'Total Sesi Selesai', value: stats.totalSessions ?? 0, icon: History },
                        { label: 'Tutor Pernah Mengajar', value: stats.activeTutors ?? 0, icon: UserCheck },
                        { label: 'Sesi Bulan Ini', value: stats.thisMonth ?? 0, icon: Calendar },
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#691D1B]/10 text-[#691D1B]">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <p className="text-2xl font-black text-gray-900">{Number(item.value || 0).toLocaleString()}</p>
                                <p className="text-sm text-gray-500">{item.label}</p>
                            </div>
                        );
                    })}
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="border-b border-[#F7F2E7] p-5">
                        <h2 className="text-lg font-black text-[#691D1B]">Ringkasan per Tutor</h2>
                        <p className="text-sm text-gray-500">Jumlah sesi selesai dikelompokkan dari jadwal mengajar.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#F7F2E7] text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-3">Tutor</th>
                                    <th className="px-5 py-3">Course</th>
                                    <th className="px-5 py-3">Total Sesi</th>
                                    <th className="px-5 py-3">Terakhir Mengajar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F7F2E7]">
                                {tutorSummaries.map((tutor) => (
                                    <tr key={tutor.id}>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-bold text-gray-900">{tutor.name}</p>
                                            <p className="text-xs text-gray-500">{tutor.email}</p>
                                        </td>
                                        <td className="max-w-md px-5 py-4 text-sm text-gray-600">{tutor.courses || '-'}</td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-[#691D1B]/10 px-3 py-1 text-sm font-bold text-[#691D1B]">
                                                {tutor.totalSessions}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{formatDate(tutor.lastTaughtAt)}</td>
                                    </tr>
                                ))}
                                {tutorSummaries.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">
                                            Belum ada tutor yang memiliki riwayat mengajar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="border-b border-[#F7F2E7] p-5">
                        <h2 className="text-lg font-black text-[#691D1B]">Detail Sesi</h2>
                        <p className="text-sm text-gray-500">Semua jadwal tutor yang waktunya sudah selesai.</p>
                    </div>

                    <div className="divide-y divide-[#F7F2E7]">
                        {historyItems.map((item) => (
                            <article key={item.id} className="p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#691D1B]/10 text-[#691D1B]">
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-500">{item.course} - {item.tutor?.name}</p>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F2E7] px-2.5 py-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {item.date}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F2E7] px-2.5 py-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {item.time}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F2E7] px-2.5 py-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {item.students} siswa
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {item.meeting_link && (
                                        <a
                                            href={item.meeting_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D8D7BE] px-4 py-2 text-sm font-bold text-gray-600 hover:bg-[#F7F2E7]"
                                        >
                                            Link sesi
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                        {historyItems.length === 0 && (
                            <div className="p-10 text-center text-sm text-gray-500">
                                Belum ada detail riwayat mengajar.
                            </div>
                        )}
                    </div>

                    {Array.isArray(history?.links) && history.links.length > 3 && (
                        <div className="flex flex-wrap justify-end gap-2 border-t border-[#F7F2E7] bg-[#F7F2E7] p-4">
                            {history.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`rounded-lg px-3 py-2 text-xs ${link.active ? 'text-white' : 'text-gray-600'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    style={link.active ? { background: '#691D1B', fontWeight: 800 } : { background: 'white', fontWeight: 700 }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
