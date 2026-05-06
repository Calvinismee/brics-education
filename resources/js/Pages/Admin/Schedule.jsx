import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Calendar, Plus, Clock, Users, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function Schedule({ classes = [] }) {
    const [view, setView] = useState('list');
    const [showForm, setShowForm] = useState(false);
    const [currentMonth] = useState('April 2025');

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
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412]"
                        style={{ background: '#691D1B', fontWeight: 600 }}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Kelas
                    </button>
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
                                        {['Mata Pelajaran', 'Tutor', 'Hari', 'Waktu', 'Siswa', 'Ruangan', 'Aksi'].map((heading) => (
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
                                    {(classes || []).map((schedule) => (
                                        <tr key={schedule.id} className="transition-colors hover:bg-[#F7F2E7]">
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-gray-800">{schedule.course}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-700">{schedule.tutor}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-700">{schedule.day}</span>
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
                                                <span className="rounded-full px-2 py-1 text-xs" style={{ background: 'var(--brics-cream)', color: 'var(--brics-maroon)', fontWeight: 600 }}>
                                                    {schedule.room}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 rounded-lg hover:bg-[#F7F2E7] transition-colors">
                                                        <Edit className="h-4 w-4 text-gray-400" />
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

                        {(classes || []).length === 0 && (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-sm text-gray-500">Tidak ada kelas yang dijadwalkan</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">{currentMonth}</h3>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg hover:bg-[#F7F2E7]">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-[#F7F2E7]">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-3">
                            {daysOfWeek.map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={i} className="rounded border border-[#D8D7BE] p-3 text-center text-xs hover:bg-[#F7F2E7] cursor-pointer">
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
