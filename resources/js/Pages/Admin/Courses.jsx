import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useMemo, useState } from 'react';
import { BookOpen, FileText, GraduationCap, Search, UserCheck } from 'lucide-react';

const contentStatusLabel = {
    approved: 'Disetujui',
    pending: 'Menunggu',
    rejected: 'Ditolak',
};

const contentStatusClass = {
    approved: 'bg-green-50 text-green-700',
    pending: 'bg-amber-50 text-amber-700',
    rejected: 'bg-red-50 text-red-700',
};

export default function Courses({ courses = [], stats = {} }) {
    const [search, setSearch] = useState('');
    const normalizedSearch = search.toLowerCase();

    const filteredCourses = useMemo(() => {
        return (courses || []).filter((course) => {
            const haystack = [
                course.title,
                course.description,
                ...(course.packages || []).map((item) => item.name),
                ...(course.students || []).map((item) => `${item.name} ${item.email}`),
                ...(course.mentors || []).map((item) => `${item.name} ${item.email}`),
            ].join(' ').toLowerCase();

            return haystack.includes(normalizedSearch);
        });
    }, [courses, normalizedSearch]);

    return (
        <AdminLayout title="Course Overview" subtitle="Pantau enrollment siswa, mentor, dan konten berdasarkan course.">
            <Head title="Course Overview" />

            <div className="space-y-6 p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: 'Total Course', value: stats.totalCourses ?? courses.length, icon: BookOpen },
                        { label: 'Total Enrollment', value: stats.totalEnrollments ?? 0, icon: GraduationCap },
                        { label: 'Mentor Bertugas', value: stats.totalMentors ?? 0, icon: UserCheck },
                        { label: 'Total Konten', value: stats.totalContents ?? 0, icon: FileText },
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <section key={item.label} className="rounded-lg border border-[#D8D7BE] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-gray-400">{item.label}</p>
                                        <p className="mt-1 text-2xl font-black text-gray-900">{Number(item.value).toLocaleString()}</p>
                                    </div>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#691D1B]/10 text-[#691D1B]">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>

                <div className="flex min-h-11 max-w-md items-center gap-2 rounded-lg border border-[#D8D7BE] bg-white px-3 py-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari course, siswa, mentor, atau paket..."
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>

                <div className="space-y-4">
                    {filteredCourses.map((course) => (
                        <section key={course.id} className="overflow-hidden rounded-lg border border-[#D8D7BE] bg-white shadow-sm">
                            <div className="border-b border-[#F7F2E7] p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-extrabold text-gray-900">{course.title}</h2>
                                        <p className="mt-1 max-w-3xl text-sm text-gray-500">{course.description || 'Belum ada deskripsi course.'}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {(course.packages || []).length > 0 ? (
                                                course.packages.map((pkg) => (
                                                    <span key={pkg.id} className="rounded-full bg-[#F7F2E7] px-2.5 py-1 text-xs font-semibold text-[#691D1B]">
                                                        {pkg.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-400">
                                                    Belum masuk paket
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        {[
                                            { label: 'Siswa', value: course.counts?.students ?? 0 },
                                            { label: 'Mentor', value: course.counts?.mentors ?? 0 },
                                            { label: 'Konten', value: course.counts?.contents ?? 0 },
                                        ].map((item) => (
                                            <div key={item.label} className="min-w-20 rounded-lg border border-[#D8D7BE] bg-[#F7F2E7] px-3 py-2">
                                                <p className="text-base font-black text-gray-900">{item.value}</p>
                                                <p className="text-[11px] font-semibold text-gray-500">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-0 lg:grid-cols-3">
                                <div className="border-b border-[#F7F2E7] p-5 lg:border-b-0 lg:border-r">
                                    <div className="rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] p-4">
                                        <p className="text-xs font-bold uppercase text-gray-500">Jumlah Siswa Ter-enroll</p>
                                        <p className="mt-2 text-3xl font-black text-[#691D1B]">{course.counts?.students ?? 0}</p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {(course.packages || []).length > 0
                                                ? 'Total siswa yang aktif di course ini melalui paket terkait.'
                                                : 'Belum ada enrollment siswa untuk course ini.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-b border-[#F7F2E7] p-5 lg:border-b-0 lg:border-r">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                        <UserCheck className="h-4 w-4 text-[#691D1B]" />
                                        Mentor Pengajar
                                    </div>
                                    <div className="space-y-2">
                                        {(course.mentors || []).length > 0 ? (
                                            course.mentors.map((mentor) => (
                                                <div key={mentor.id} className="rounded-lg border border-[#F7F2E7] p-3">
                                                    <p className="text-sm font-bold text-gray-900">{mentor.name}</p>
                                                    <p className="text-xs text-gray-500">{mentor.email}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400">Belum ada mentor.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                        <FileText className="h-4 w-4 text-[#691D1B]" />
                                        Konten Course
                                    </div>
                                    <div className="space-y-2">
                                        {(course.contents || []).length > 0 ? (
                                            course.contents.map((content) => (
                                                <div key={content.id} className="rounded-lg border border-[#F7F2E7] p-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-gray-900">{content.title}</p>
                                                            <p className="text-xs text-gray-500">{content.tutor} · {content.submitted}</p>
                                                        </div>
                                                        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${contentStatusClass[content.status] ?? contentStatusClass.pending}`}>
                                                            {contentStatusLabel[content.status] ?? content.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400">Belum ada konten.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="rounded-lg border border-[#D8D7BE] bg-white p-12 text-center text-sm text-gray-500">
                        Tidak ada course ditemukan.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
