import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useMemo, useState } from 'react';
import { Search, Filter, Eye, Edit, UserPlus, Download, CheckSquare, ChevronDown, MoreVertical } from 'lucide-react';

const initialStudents = [
    { id: 1, name: 'Andi Pratama', email: 'andi@email.com', enrolled: 3, status: 'Aktif', joined: '15 Jan 2025' },
    { id: 2, name: 'Budi Santosa', email: 'budi@email.com', enrolled: 2, status: 'Aktif', joined: '20 Feb 2025' },
    { id: 3, name: 'Citra Dewi', email: 'citra@email.com', enrolled: 5, status: 'Tidak Aktif', joined: '10 Des 2024' },
    { id: 4, name: 'Dimas Arya', email: 'dimas@email.com', enrolled: 1, status: 'Aktif', joined: '5 Mar 2025' },
    { id: 5, name: 'Eka Putri', email: 'eka@email.com', enrolled: 4, status: 'Aktif', joined: '28 Jan 2025' },
];

const initialTutors = [
    { id: 1, name: 'Dr. Ahmad Fauzi', email: 'ahmad@email.com', courses: 3, students: 145, status: 'Aktif', joined: '1 Sep 2024' },
    { id: 2, name: 'Prof. Dewi Rahayu', email: 'dewi@email.com', courses: 2, students: 98, status: 'Aktif', joined: '15 Okt 2024' },
    { id: 3, name: 'Budi Santoso, M.Kom', email: 'budi.t@email.com', courses: 4, students: 186, status: 'Aktif', joined: '20 Agu 2024' },
    { id: 4, name: 'Sarah Johnson, MA', email: 'sarah@email.com', courses: 1, students: 52, status: 'Tidak Aktif', joined: '10 Jan 2025' },
];

export default function Users() {
    const [userType, setUserType] = useState('students');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');

    const data = userType === 'students' ? initialStudents : initialTutors;
    const filtered = useMemo(
        () =>
            data.filter(
                (user) =>
                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase()),
            ),
        [data, search],
    );

    const toggleSelect = (id) => {
        setSelectedUsers((previous) =>
            previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id],
        );
    };

    return (
        <AdminLayout title="Manajemen Pengguna" subtitle="Kelola data siswa dan tutor platform.">
            <Head title="Manajemen Pengguna" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Manajemen Pengguna</h1>
                        <p className="text-sm text-gray-500">Kelola data siswa dan tutor platform</p>
                    </div>
                    <button
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412]"
                        style={{ background: '#691D1B', fontWeight: 600 }}
                    >
                        <UserPlus className="h-4 w-4" />
                        Tambah Pengguna
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Total Siswa', value: '1.234', color: '#691D1B' },
                        { label: 'Total Tutor', value: '56', color: '#8B2523' },
                        { label: 'Pengguna Aktif', value: '940', color: '#691D1B' },
                        { label: 'Tidak Aktif', value: '350', color: '#6b7280' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                            <div className="mb-1 text-2xl font-extrabold" style={{ color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="flex border-b border-[#D8D7BE]">
                        {[
                            { key: 'students', label: 'Siswa' },
                            { key: 'tutors', label: 'Tutor/Mentor' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setUserType(tab.key)}
                                className={`px-6 py-4 text-sm transition-all ${
                                    userType === tab.key
                                        ? 'border-b-2 border-[#691D1B] text-[#691D1B]'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                style={userType === tab.key ? { fontWeight: 700 } : {}}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-start justify-between gap-3 border-b border-[#F7F2E7] p-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 rounded-lg border border-[#D8D7BE] bg-[#F7F2E7] px-3 py-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pengguna..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-48 bg-transparent text-sm outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]">
                                <Filter className="h-4 w-4" />
                                Filter
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                            {selectedUsers.length > 0 && (
                                <span className="text-sm font-semibold text-[#691D1B]">
                                    {selectedUsers.length} dipilih
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                    <th className="w-10 px-5 py-3">
                                        <CheckSquare className="h-4 w-4 cursor-pointer text-gray-400" />
                                    </th>
                                    {['Pengguna', userType === 'students' ? 'Kursus' : 'Kursus Diajar', userType === 'students' ? 'Status' : 'Siswa', 'Bergabung', 'Status', 'Aksi'].map(
                                        (heading) => (
                                            <th
                                                key={heading}
                                                className="px-5 py-3 text-left text-xs uppercase tracking-wide text-gray-500"
                                                style={{ fontWeight: 700 }}
                                            >
                                                {heading}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F7F2E7]">
                                {filtered.map((user) => {
                                    const isActive = user.status === 'Aktif';
                                    const isSelected = selectedUsers.includes(user.id);

                                    return (
                                        <tr key={user.id} className={`transition-colors ${isSelected ? 'bg-[#691D1B05]' : 'hover:bg-[#F7F2E7]'}`}>
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(user.id)}
                                                    className="h-4 w-4 cursor-pointer accent-[#691D1B]"
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#691D1B] text-xs font-extrabold text-[#FFE882]">
                                                        {user.name
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .join('')
                                                            .slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {(user.enrolled ?? user.courses)} kursus
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {userType === 'tutors' ? (
                                                    <span className="text-sm text-gray-700">{user.students} siswa</span>
                                                ) : (
                                                    <span
                                                        className="rounded-full px-2 py-1 text-xs"
                                                        style={{
                                                            background: isActive ? '#22c55e15' : '#ef444415',
                                                            color: isActive ? '#16a34a' : '#ef4444',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {user.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-500">{user.joined}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className="rounded-full px-2 py-1 text-xs"
                                                    style={{
                                                        background: isActive ? '#22c55e15' : '#ef444415',
                                                        color: isActive ? '#16a34a' : '#ef4444',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#691D1B15] hover:text-[#691D1B]">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#691D1B15] hover:text-[#691D1B]">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#691D1B15] hover:text-[#691D1B]">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#D8D7BE] bg-[#F7F2E7] p-4">
                        <span className="text-xs text-gray-500">
                            Menampilkan {filtered.length} dari {data.length} pengguna
                        </span>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map((page) => (
                                <button
                                    key={page}
                                    className={`h-8 w-8 rounded-lg text-xs transition-colors ${page === 1 ? 'text-white' : 'text-gray-600 hover:bg-[#691D1B15]'}`}
                                    style={page === 1 ? { background: '#691D1B', fontWeight: 700 } : {}}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
