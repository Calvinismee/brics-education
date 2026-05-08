import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Calendar, Plus, Clock, Users, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const dayOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const statusLabel = {
    scheduled: 'Terjadwal',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    canceled: 'Dibatalkan',
};

const statusStyles = {
    scheduled: { background: '#f59e0b15', color: '#d97706' },
    ongoing: { background: '#3b82f615', color: '#2563eb' },
    completed: { background: '#22c55e15', color: '#16a34a' },
    canceled: { background: '#ef444415', color: '#ef4444' },
};

const formatMonthLabel = (date) => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);

const formatDateKey = (value) => {
    if (!value) {
        return '';
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
    const key = formatDateKey(value);

    if (!key) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${key}T00:00:00`));
};

export default function Schedule({ schedules = [], stats = {}, tutors = [] }) {
    const [view, setView] = useState('list');
    const [showForm, setShowForm] = useState(false);
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const form = useForm({
        course: '',
        tutor_id: '',
        day: 'Senin',
        schedule_date: '',
        start_time: '08:00',
        end_time: '10:00',
        students_count: 0,
        room: '',
        modality: 'online',
        status: 'scheduled',
    });

    const closeForm = () => {
        setShowForm(false);
        setEditingScheduleId(null);
        form.reset();
        form.clearErrors();
    };

    const openCreate = () => {
        setEditingScheduleId(null);
        form.setData({
            course: '',
            tutor_id: '',
            day: 'Senin',
            schedule_date: '',
            start_time: '08:00',
            end_time: '10:00',
            students_count: 0,
            room: '',
            modality: 'online',
            status: 'scheduled',
        });
        form.clearErrors();
        setShowForm(true);
    };

    const openEdit = (schedule) => {
        setEditingScheduleId(schedule.id);
        form.setData({
            course: schedule.course || '',
            tutor_id: schedule.tutor_id || '',
            day: schedule.day || 'Senin',
            schedule_date: formatDateKey(schedule.schedule_date),
            start_time: schedule.start_time || '08:00',
            end_time: schedule.end_time || '10:00',
            students_count: schedule.students || 0,
            room: schedule.room || '',
            modality: schedule.modality || 'online',
            status: schedule.status || 'scheduled',
        });
        form.clearErrors();
        setShowForm(true);
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (editingScheduleId) {
            form.put(route('admin.schedule.update', editingScheduleId), {
                preserveScroll: true,
                onSuccess: closeForm,
            });
            return;
        }

        form.post(route('admin.schedule.store'), {
            preserveScroll: true,
            onSuccess: closeForm,
        });
    };

    const handleDelete = (schedule) => {
        if (!confirm('Hapus jadwal kelas ini?')) {
            return;
        }

        form.delete(route('admin.schedule.destroy', schedule.id), {
            preserveScroll: true,
        });
    };

    const normalizedSchedules = schedules || [];
    const calendarYear = currentMonth.getFullYear();
    const calendarMonth = currentMonth.getMonth();
    const firstDayOffset = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const calendarCells = Array.from({ length: firstDayOffset + daysInMonth }, (_, index) =>
        index < firstDayOffset ? null : index - firstDayOffset + 1
    );
    const monthKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
    const monthSchedules = normalizedSchedules.filter((schedule) => formatDateKey(schedule.schedule_date).startsWith(monthKey));

    return (
        <AdminLayout title="Jadwal Kelas" subtitle="Kelola jadwal kelas online dan offline.">
            <Head title="Jadwal Kelas" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Jadwal Kelas</h1>
                        <p className="text-sm text-gray-500">Kelola dan monitor jadwal semua kelas</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412]"
                        style={{ background: '#691D1B', fontWeight: 600 }}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Kelas
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        { label: 'Total Kelas', value: stats.totalClasses ?? normalizedSchedules.length, icon: <Calendar className="h-5 w-5" /> },
                        { label: 'Kelas Mendatang', value: stats.upcomingClasses ?? normalizedSchedules.filter((schedule) => schedule.status === 'scheduled').length, icon: <Clock className="h-5 w-5" /> },
                        {
                            label: 'Tutor Aktif',
                            value: stats.activeInstructors ?? new Set(normalizedSchedules.map((schedule) => schedule.tutor_id).filter(Boolean)).size,
                            icon: <Users className="h-5 w-5" />,
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#691D1B15', color: '#691D1B' }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-gray-400" style={{ fontWeight: 700 }}>
                                        {stat.label}
                                    </div>
                                    <div className="mt-1 text-2xl font-extrabold text-gray-900">{Number(stat.value || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-6 flex gap-2">
                    {['list', 'calendar'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setView(mode)}
                            className={`rounded-lg px-4 py-2 text-sm transition-all ${
                                view === mode ? 'bg-[#691D1B] text-white' : 'border border-[#D8D7BE] text-gray-700 hover:bg-[#F7F2E7]'
                            }`}
                            style={view === mode ? { fontWeight: 700 } : {}}
                        >
                            {mode === 'list' ? 'Daftar' : 'Kalender'}
                        </button>
                    ))}
                </div>

                {view === 'list' ? (
                    <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                        {['Mata Pelajaran', 'Tutor', 'Jadwal', 'Waktu', 'Siswa', 'Link','Status', 'Aksi'].map((heading) => (
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
                                    {normalizedSchedules.map((schedule) => {
                                        const scheduleStatus = statusStyles[schedule.status] ?? statusStyles.scheduled;

                                        return (
                                            <tr key={schedule.id} className="transition-colors hover:bg-[#F7F2E7]">
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-gray-800">{schedule.course}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-sm text-gray-700">{schedule.tutor}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-700">{schedule.day}</span>
                                                        <span className="text-xs text-gray-400">{formatDateLabel(schedule.schedule_date)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Clock className="h-4 w-4" />
                                                        {schedule.time}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-700">{schedule.students}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <a href={schedule.meeting_link || '#'} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                                                        {schedule.meeting_link ? (schedule.meeting_link.length > 40 ? `${schedule.meeting_link.slice(0, 36)}...` : schedule.meeting_link) : '-'}
                                                    </a>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-full px-2 py-1 text-xs" style={{ background: scheduleStatus.background, color: scheduleStatus.color, fontWeight: 600 }}>
                                                        {statusLabel[schedule.status] || schedule.status || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => openEdit(schedule)} className="rounded-lg p-2 transition-colors hover:bg-[#F7F2E7]">
                                                            <Edit className="h-4 w-4 text-gray-400" />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(schedule)} className="rounded-lg p-2 transition-colors hover:bg-[#F7F2E7]">
                                                            <Trash2 className="h-4 w-4 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {normalizedSchedules.length === 0 && (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-sm text-gray-500">Tidak ada kelas yang dijadwalkan</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">{formatMonthLabel(currentMonth)}</h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                                    className="rounded-lg p-2 hover:bg-[#F7F2E7]"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                                    className="rounded-lg p-2 hover:bg-[#F7F2E7]"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500">
                            {daysOfWeek.map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarCells.map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="min-h-28 rounded border border-transparent p-3" />;
                                }

                                const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const scheduleItems = monthSchedules.filter((schedule) => formatDateKey(schedule.schedule_date) === dateKey);

                                return (
                                    <div key={dateKey} className="min-h-28 rounded border border-[#D8D7BE] p-3 text-xs transition-colors hover:bg-[#F7F2E7]">
                                        <div className="mb-2 flex items-center justify-between text-gray-600">
                                            <span className="font-semibold text-gray-800">{day}</span>
                                            <span>{scheduleItems.length}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {scheduleItems.slice(0, 2).map((schedule) => (
                                                <div key={schedule.id} className="rounded-lg px-2 py-1" style={{ background: '#691D1B10', color: '#691D1B' }}>
                                                    <p className="truncate font-semibold">{schedule.course}</p>
                                                    <p className="truncate text-[11px] opacity-75">
                                                        {schedule.start_time} - {schedule.end_time}
                                                    </p>
                                                </div>
                                            ))}
                                            {scheduleItems.length > 2 && <p className="text-[11px] text-gray-400">+{scheduleItems.length - 2} jadwal lagi</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                                <h3 className="font-bold text-white">{editingScheduleId ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Kelas'}</h3>
                                <p className="mt-1 text-xs text-white/70">Isi kelas, tutor, tanggal, jam, kapasitas, mode, dan status jadwal.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Mata Pelajaran</label>
                                        <p className="mb-2 text-xs text-gray-500">Contoh: Matematika, Bahasa Inggris, Fisika.</p>
                                        <input
                                            value={form.data.course}
                                            onChange={(event) => form.setData('course', event.target.value)}
                                            type="text"
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                            placeholder="Masukkan nama kelas"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Tutor</label>
                                        <p className="mb-2 text-xs text-gray-500">Pilih tutor pengampu untuk jadwal ini.</p>
                                        <select
                                            value={form.data.tutor_id}
                                            onChange={(event) => form.setData('tutor_id', event.target.value)}
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                        >
                                            <option value="">Pilih tutor</option>
                                            {(tutors || []).map((tutor) => (
                                                <option key={tutor.id} value={tutor.id}>
                                                    {tutor.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Tanggal</label>
                                        <input
                                            value={form.data.schedule_date}
                                            onChange={(event) => form.setData('schedule_date', event.target.value)}
                                            type="date"
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Hari</label>
                                        <select
                                            value={form.data.day}
                                            onChange={(event) => form.setData('day', event.target.value)}
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                        >
                                            {dayOptions.map((day) => (
                                                <option key={day} value={day}>
                                                    {day}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Link Pertemuan (Zoom)</label>
                                        <input
                                            value={form.data.meeting_link}
                                            onChange={(event) => form.setData('meeting_link', event.target.value)}
                                            type="url"
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                            placeholder="https://zoom.us/j/123..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Jam Mulai</label>
                                        <input
                                            value={form.data.start_time}
                                            onChange={(event) => form.setData('start_time', event.target.value)}
                                            type="time"
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Jam Selesai</label>
                                        <input
                                            value={form.data.end_time}
                                            onChange={(event) => form.setData('end_time', event.target.value)}
                                            type="time"
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Jumlah Siswa</label>
                                        <input
                                            value={form.data.students_count}
                                            onChange={(event) => form.setData('students_count', event.target.value.replace(/\D/g, ''))}
                                            type="text"
                                            inputMode="numeric"
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Status Jadwal</label>
                                        <select
                                            value={form.data.status}
                                            onChange={(event) => form.setData('status', event.target.value)}
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                        >
                                            {Object.entries(statusLabel).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {Object.keys(form.errors || {}).length > 0 && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{Object.values(form.errors)[0]}</div>
                                )}

                                <div className="flex justify-end gap-3 border-t border-[#F7F2E7] pt-5">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        className="rounded-xl border-2 border-[#D8D7BE] px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#691D1B]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{ background: '#691D1B' }}
                                        disabled={form.processing}
                                    >
                                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
