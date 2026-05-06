import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Calendar, Plus, Clock, Users, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const schedules = [
    { id: 1, course: 'Matematika UTBK Intensif', tutor: 'Dr. Ahmad Fauzi', day: 'Senin', time: '09:00 - 10:30', students: 24, room: 'Online', color: '#691D1B' },
    { id: 2, course: 'Advanced JavaScript', tutor: 'Budi Santoso', day: 'Selasa', time: '11:00 - 12:30', students: 18, room: 'Online', color: '#8B2523' },
    { id: 3, course: 'Bahasa Inggris Bisnis', tutor: 'Sarah Johnson', day: 'Rabu', time: '13:00 - 14:30', students: 32, room: 'Online', color: '#691D1B' },
    { id: 4, course: 'React Fundamentals', tutor: 'Budi Santoso', day: 'Kamis', time: '09:00 - 10:30', students: 28, room: 'Online', color: '#8B2523' },
    { id: 5, course: 'Persiapan SNBT Komprehensif', tutor: 'Tim BRICS', day: 'Jumat', time: '14:00 - 15:30', students: 45, room: 'Online', color: '#691D1B' },
];

export default function Schedule() {
    const [view, setView] = useState('list');
    const [showForm, setShowForm] = useState(false);
    const [currentMonth] = useState('April 2025');

    return (
        <AdminLayout title="Manajemen Jadwal" subtitle="Kelola jadwal kelas dan sesi pembelajaran.">
            <Head title="Manajemen Jadwal" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Manajemen Jadwal</h1>
                        <p className="text-sm text-gray-500">Kelola jadwal kelas dan sesi pembelajaran</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex overflow-hidden rounded-lg border border-[#D8D7BE]">
                            {[
                                { key: 'list', label: 'Daftar' },
                                { key: 'calendar', label: 'Kalender' },
                            ].map((mode) => (
                                <button
                                    key={mode.key}
                                    onClick={() => setView(mode.key)}
                                    className="px-4 py-2 text-sm transition-colors"
                                    style={view === mode.key ? { background: '#691D1B', color: 'white', fontWeight: 600 } : { background: 'white', color: '#374151' }}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]"
                            style={{ background: '#691D1B' }}
                        >
                            <Plus className="h-4 w-4" />
                            Buat Jadwal
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Total Jadwal Aktif', value: '24' },
                        { label: 'Kelas Hari Ini', value: '5' },
                        { label: 'Total Kursus', value: '12' },
                        { label: 'Tutor Terjadwal', value: '8' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                            <div className="mb-1 text-2xl font-extrabold text-[#691D1B]">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {view === 'calendar' ? (
                    <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                            <button className="rounded-lg p-2 text-white transition-colors hover:bg-white/10">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h3 className="font-bold text-white">{currentMonth}</h3>
                            <button className="rounded-lg p-2 text-white transition-colors hover:bg-white/10">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 border-b border-[#D8D7BE]">
                            {daysOfWeek.map((day) => (
                                <div key={day} className="bg-[#F7F2E7] p-3 text-center text-xs font-bold text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-px bg-[#D8D7BE]">
                            {Array.from({ length: 35 }).map((_, index) => {
                                const day = index - 1;
                                const isToday = day === 27;
                                const hasClass = [6, 7, 8, 9, 11, 13, 14, 15, 16, 20, 21, 22, 27, 28].includes(day);

                                return (
                                    <div key={index} className="min-h-[80px] cursor-pointer bg-white p-2 transition-colors hover:bg-[#F7F2E7]">
                                        {day > 0 && day <= 30 && (
                                            <>
                                                <span className={`mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${isToday ? 'text-white' : 'text-gray-700'}`} style={isToday ? { background: '#691D1B', fontWeight: 800 } : {}}>
                                                    {day}
                                                </span>
                                                {hasClass && (
                                                    <div className="truncate rounded px-1.5 py-0.5 text-xs text-white" style={{ background: '#691D1B', fontSize: '10px' }}>
                                                        Kelas
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                        <div className="border-b border-[#F7F2E7] p-5">
                            <h3 className="font-bold text-gray-900">Jadwal Kelas Minggu Ini</h3>
                        </div>
                        <div className="divide-y divide-[#F7F2E7]">
                            {schedules.map((schedule) => (
                                <div key={schedule.id} className="flex items-center gap-4 p-5 transition-colors hover:bg-[#F7F2E7]">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${schedule.color}15`, color: schedule.color }}>
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <p className="truncate text-sm font-bold text-gray-900">{schedule.course}</p>
                                            <span className="flex-shrink-0 rounded-full bg-[#F7F2E7] px-2 py-0.5 text-xs font-semibold" style={{ color: '#691D1B' }}>
                                                {schedule.day}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{schedule.time}</span>
                                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{schedule.students} siswa</span>
                                            <span>{schedule.tutor}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-2">
                                        <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: '#22c55e15', color: '#16a34a' }}>Aktif</span>
                                        <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#691D1B15] hover:text-[#691D1B]">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="border-b border-[#F7F2E7] p-6" style={{ background: '#691D1B' }}>
                                <h3 className="font-bold text-white">Buat Jadwal Baru</h3>
                            </div>
                            <div className="space-y-4 p-6">
                                {[
                                    { label: 'Kursus', type: 'select', options: ['Matematika UTBK Intensif', 'Advanced JavaScript', 'Bahasa Inggris Bisnis'] },
                                    { label: 'Tutor/Mentor', type: 'select', options: ['Dr. Ahmad Fauzi', 'Budi Santoso', 'Sarah Johnson'] },
                                    { label: 'Hari', type: 'select', options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] },
                                    { label: 'Waktu Mulai', type: 'time' },
                                    { label: 'Waktu Selesai', type: 'time' },
                                ].map((field) => (
                                    <div key={field.label}>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">{field.label}</label>
                                        {field.type === 'select' ? (
                                            <select className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none">
                                                {field.options.map((option) => (
                                                    <option key={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input type="time" className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 border-t border-[#F7F2E7] p-5 justify-end">
                                <button onClick={() => setShowForm(false)} className="rounded-xl border-2 border-[#D8D7BE] px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#691D1B]">
                                    Batal
                                </button>
                                <button onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                    Simpan Jadwal
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
