import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus, Download, CheckSquare, Edit, X, ArrowUpDown, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import { StagedLoadingContent } from '@/Components/ui/LoadingStates';
import { showSuccessToast } from '@/utils/toast';

const roleLabels = {
    student: 'Siswa',
    tutor: 'Tutor',
    admin: 'Admin',
};

const roleColors = {
    student: '#691D1B',
    tutor: '#8B2523',
    admin: '#CD9B1D',
};

const roleViewConfig = {
    student: {
        title: 'Daftar Siswa',
        description: 'Kelola akun siswa dan course yang sedang diikuti.',
        empty: 'Tidak ada siswa ditemukan',
        courseHeading: 'Course Diikuti',
        courseEmpty: 'Belum enroll',
    },
    tutor: {
        title: 'Daftar Tutor',
        description: 'Kelola tutor dan penugasan course yang diajar.',
        empty: 'Tidak ada tutor ditemukan',
        courseHeading: 'Course Diajar',
        courseEmpty: 'Belum ditugaskan',
    },
    admin: {
        title: 'Daftar Admin',
        description: 'Kelola akun administrator dan akses panel.',
        empty: 'Tidak ada admin ditemukan',
        accessHeading: 'Akses',
    },
};

const emptyForm = {
    name: '',
    email: '',
    password: '',
    role: 'student',
    mentor_course_id: '',
    mentor_course_ids: [],
};

const normalizeRoleName = (role) => {
    const roleName = typeof role === 'object' ? role?.name : role;
    const normalizedRole = String(roleName || 'student').toLowerCase().trim();

    return normalizedRole === 'mentor' ? 'tutor' : normalizedRole;
};

const extractRoleName = (user) => {
    return normalizeRoleName(user.role);
};

export default function Users({ users = { data: [] }, courses = [], totalUsers = 0, stats = {}, filters = {} }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState(filters.role ?? 'student');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm(emptyForm);

    const userData = users.data || [];

    useEffect(() => {
        setSelectedRole(filters.role ?? 'student');
        setSelectedUsers([]);
    }, [filters.role]);

    const filtered = useMemo(() => {
        let result = userData.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            const matchesRole = extractRoleName(user) === selectedRole;

            const userDate = user.created_at ? new Date(user.created_at) : null;
            let matchesDateFrom = true;
            let matchesDateTo = true;

            if (dateFrom && userDate) {
                matchesDateFrom = userDate >= new Date(dateFrom);
            }
            if (dateTo && userDate) {
                matchesDateTo = userDate <= new Date(dateTo + 'T23:59:59');
            }

            return matchesSearch && matchesRole && matchesDateFrom && matchesDateTo;
        });

        result.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [userData, search, selectedRole, dateFrom, dateTo, sortOrder]);

    const toggleSelect = (id) => {
        setSelectedUsers((previous) =>
            previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id],
        );
    };

    const getRoleDisplay = (role) => roleLabels[role] || role;

    const getStatusColor = (role) => roleColors[role] || '#6b7280';

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setSelectedUsers([]);
        router.get(route('admin.users'), { role }, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    const openCreate = () => {
        setEditingUser(null);
        form.setData(emptyForm);
        form.clearErrors();
        setShowForm(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        form.setData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: extractRoleName(user),
            mentor_course_id: user.mentor_course_id || '',
            mentor_course_ids: Array.isArray(user.mentor_course_ids)
                ? user.mentor_course_ids.map((courseId) => Number(courseId))
                : (user.mentor_course_id ? [Number(user.mentor_course_id)] : []),
        });
        form.clearErrors();
        setShowForm(true);
    };

    const openDeleteConfirm = (user) => {
        setDeleteTarget(user);
    };

    const closeDeleteConfirm = () => {
        setDeleteTarget(null);
    };

    const handleDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(route('admin.users.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteConfirm();
                showSuccessToast('Pengguna berhasil dihapus.');
            },
            onError: closeDeleteConfirm,
        });
    };

    const closeForm = (force = false) => {
        if (!force && (isSubmitting || form.processing)) {
            return;
        }

        setShowForm(false);
        setEditingUser(null);
        form.reset();
        form.clearErrors();
    };

    const buildPayload = () => {
        const payload = { ...form.data };

        if (!payload.password) {
            delete payload.password;
        }

        if (payload.role !== 'tutor') {
            delete payload.mentor_course_id;
            delete payload.mentor_course_ids;
        } else {
            payload.mentor_course_ids = (payload.mentor_course_ids || []).map((courseId) => Number(courseId));
            payload.mentor_course_id = payload.mentor_course_ids[0] || '';
        }

        return payload;
    };

    const toggleTutorCourse = (courseId) => {
        const normalizedCourseId = Number(courseId);
        const selectedCourseIds = (form.data.mentor_course_ids || []).map((id) => Number(id));
        const nextCourseIds = selectedCourseIds.includes(normalizedCourseId)
            ? selectedCourseIds.filter((id) => id !== normalizedCourseId)
            : [...selectedCourseIds, normalizedCourseId];

        form.setData({
            ...form.data,
            mentor_course_ids: nextCourseIds,
            mentor_course_id: nextCourseIds[0] || '',
        });
    };

    const submitForm = () => {
        if (isSubmitting || form.processing) {
            return;
        }

        setIsSubmitting(true);
        form.clearErrors();
        const payload = buildPayload();

        if (editingUser) {
            router.post(route('admin.users.update', editingUser.id), {
                ...payload,
                _method: 'put',
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm(true);
                    showSuccessToast('Pengguna berhasil diperbarui.');
                },
                onError: (errors) => form.setError(errors),
                onFinish: () => setIsSubmitting(false),
            });
            return;
        }

        router.post(route('admin.users.store'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                closeForm(true);
                showSuccessToast('Pengguna berhasil ditambahkan.');
            },
            onError: (errors) => form.setError(errors),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        submitForm();
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        params.append('role', selectedRole);
        if (search) params.append('search', search);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const href = route('admin.users.export') + (params.toString() ? '?' + params.toString() : '');
        window.location.href = href;
    };

    const currentRoleView = roleViewConfig[selectedRole] || roleViewConfig.student;
    const currentTableHeadings = selectedRole === 'admin'
        ? ['Pengguna', 'Email', currentRoleView.accessHeading, 'Bergabung', 'Aksi']
        : ['Pengguna', 'Email', currentRoleView.courseHeading, 'Bergabung', 'Aksi'];

    return (
        <AdminLayout title="Manajemen Pengguna" subtitle="Kelola data siswa, tutor, dan admin platform.">
            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412]"
                        style={{ background: '#691D1B', fontWeight: 600 }}
                    >
                        <UserPlus className="h-4 w-4" />
                        Tambah Pengguna
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Total Siswa', value: stats.student || 0, color: '#691D1B' },
                        { label: 'Total Tutor', value: stats.tutor || 0, color: '#8B2523' },
                        { label: 'Total Admin', value: stats.admin || 0, color: '#CD9B1D' },
                        { label: 'Total Pengguna', value: totalUsers || 0, color: '#6b7280' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                            <div className="mb-1 text-2xl font-extrabold" style={{ color: stat.color }}>
                                {Number(stat.value).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-5 grid gap-3 md:grid-cols-3">
                    {['student', 'tutor', 'admin'].map((role) => {
                        const active = selectedRole === role;
                        const config = roleViewConfig[role];

                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => handleRoleChange(role)}
                                className={`rounded-2xl border p-4 text-left transition-all ${active ? 'bg-white shadow-sm' : 'bg-white/60 hover:bg-white'}`}
                                style={{
                                    borderColor: active ? getStatusColor(role) : '#D8D7BE',
                                    boxShadow: active ? `inset 0 0 0 1px ${getStatusColor(role)}` : undefined,
                                }}
                            >
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-sm font-extrabold" style={{ color: getStatusColor(role) }}>
                                        {getRoleDisplay(role)}
                                    </span>
                                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${getStatusColor(role)}15`, color: getStatusColor(role) }}>
                                        {Number(stats[role] || 0).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs leading-5 text-gray-500">{config.description}</p>
                            </button>
                        );
                    })}
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                    <div className="border-b border-[#F7F2E7] p-5">
                        <div className="mb-4">
                            <h2 className="text-lg font-extrabold text-gray-900">{currentRoleView.title}</h2>
                            <p className="text-sm text-gray-500">{currentRoleView.description}</p>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-[minmax(240px,320px)_1fr] xl:items-center">
                            <div className="flex min-h-11 items-center gap-2 rounded-lg border border-[#D8D7BE] bg-[#F7F2E7] px-3 py-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari pengguna..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-3 xl:items-end">
                                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                                    <div className="grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-lg border border-[#D8D7BE] bg-white px-2 py-1.5 sm:w-auto sm:grid-cols-[9rem_auto_9rem]">
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(event) => setDateFrom(event.target.value)}
                                            className="min-w-0 rounded-md border-0 px-2 py-1.5 text-sm outline-none focus:ring-0"
                                            title="Dari tanggal"
                                        />
                                        <span className="text-sm text-gray-500">s/d</span>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(event) => setDateTo(event.target.value)}
                                            className="min-w-0 rounded-md border-0 px-2 py-1.5 text-sm outline-none focus:ring-0"
                                            title="Sampai tanggal"
                                        />
                                    </div>
                                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                            className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]"
                                            title={`Urutkan ${sortOrder === 'desc' ? 'Terbaru dulu' : 'Terlama dulu'}`}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                            {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                                        </button>
                                        <button
                                            onClick={handleExport}
                                            className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="truncate">Export Pengguna</span>
                                        </button>
                                    </div>
                                </div>
                                {selectedUsers.length > 0 && (
                                    <span className="text-sm font-semibold text-[#691D1B]">
                                        {selectedUsers.length} dipilih
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#D8D7BE] bg-[#F7F2E7]">
                                    <th className="w-10 px-5 py-3">
                                        <CheckSquare className="h-4 w-4 cursor-pointer text-gray-400" />
                                    </th>
                                    {currentTableHeadings.map((heading) => (
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
                                {filtered.map((user) => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    const joinDate = user.created_at
                                        ? new Date(user.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })
                                        : '-';
                                    const roleName = extractRoleName(user);

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
                                                    <div
                                                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                                                        style={{ background: getStatusColor(roleName) }}
                                                    >
                                                        {user.name
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .join('')
                                                            .slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-700">{user.email}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {selectedRole === 'student' ? (
                                                    <div className="flex max-w-xs flex-wrap gap-1.5">
                                                        {(user.enrolledCourses || []).length > 0 ? (
                                                            user.enrolledCourses.map((course) => (
                                                                <span key={course.id} className="rounded-full bg-[#F7F2E7] px-2 py-1 text-xs font-semibold text-gray-600">
                                                                    {course.title}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">{currentRoleView.courseEmpty}</span>
                                                        )}
                                                    </div>
                                                ) : selectedRole === 'tutor' ? (
                                                    <div className="flex max-w-xs flex-wrap gap-1.5">
                                                        {(user.taughtCourses || []).length > 0 ? (
                                                            user.taughtCourses.map((course) => (
                                                                <span key={course.id} className="rounded-full bg-[#691D1B15] px-2 py-1 text-xs font-semibold text-[#691D1B]">
                                                                    {course.title}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">{currentRoleView.courseEmpty}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span
                                                        className="rounded-full px-2 py-1 text-xs"
                                                        style={{
                                                            background: `${getStatusColor(roleName)}15`,
                                                            color: getStatusColor(roleName),
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Akses Admin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-500">{joinDate}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEdit(user)}
                                                        className="group flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7F2E7] active:translate-y-0"
                                                        title="Edit pengguna"
                                                    >
                                                        <Edit className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#691D1B]" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteConfirm(user)}
                                                        className="group flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 active:translate-y-0"
                                                        title="Hapus pengguna"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <p className="text-sm text-gray-500">{currentRoleView.empty}</p>
                            </div>
                        </div>
                    )}
                </div>

                {users.links && users.links.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {users.links.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url || '#'}
                                className={`rounded px-3 py-2 text-sm ${link.active
                                        ? 'bg-[#691D1B] text-white'
                                        : link.url
                                            ? 'border border-[#D8D7BE] text-gray-700 hover:bg-[#F7F2E7]'
                                            : 'text-gray-400'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-extrabold text-gray-900">
                                        {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {editingUser ? 'Perbarui data pengguna yang dipilih' : 'Tambahkan pengguna baru ke sistem'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => closeForm()}
                                    disabled={isSubmitting || form.processing}
                                    className="rounded-full p-2 text-gray-400 hover:bg-[#F7F2E7] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-gray-700">Nama</span>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        disabled={isSubmitting || form.processing}
                                        className="w-full rounded-xl border border-[#D8D7BE] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                                        placeholder="Nama lengkap"
                                    />
                                    {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-gray-700">Email</span>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        disabled={isSubmitting || form.processing}
                                        className="w-full rounded-xl border border-[#D8D7BE] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                                        placeholder="email@domain.com"
                                    />
                                    {form.errors.email && <p className="text-xs text-red-500">{form.errors.email}</p>}
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-gray-700">Peran</span>
                                    <select
                                        value={form.data.role}
                                        onChange={(event) => form.setData('role', event.target.value)}
                                        disabled={isSubmitting || form.processing}
                                        className="w-full rounded-xl border border-[#D8D7BE] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                                    >
                                        <option value="student">Siswa</option>
                                        <option value="tutor">Tutor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {form.errors.role && <p className="text-xs text-red-500">{form.errors.role}</p>}
                                </label>

                                {form.data.role === 'tutor' && (
                                    <div className="space-y-2">
                                        <span className="text-sm font-semibold text-gray-700">Course yang Diajar</span>
                                        <div className="grid max-h-52 gap-2 overflow-y-auto rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] p-3 sm:grid-cols-2">
                                            {(courses || []).map((course) => {
                                                const selected = (form.data.mentor_course_ids || []).map((id) => Number(id)).includes(Number(course.id));

                                                return (
                                                    <label key={course.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${selected ? 'border-[#691D1B] bg-white text-[#691D1B]' : 'border-transparent bg-white/70 text-gray-700 hover:bg-white'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() => toggleTutorCourse(course.id)}
                                                            disabled={isSubmitting || form.processing}
                                                            className="mt-0.5 h-4 w-4 rounded border-[#D8D7BE] text-[#691D1B] focus:ring-[#691D1B]"
                                                        />
                                                        <span className="font-semibold">{course.title}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-gray-500">Admin bisa menugaskan satu tutor ke lebih dari satu course UTBK.</p>
                                        {form.errors.mentor_course_id && <p className="text-xs text-red-500">{form.errors.mentor_course_id}</p>}
                                        {form.errors.mentor_course_ids && <p className="text-xs text-red-500">{form.errors.mentor_course_ids}</p>}
                                    </div>
                                )}

                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-gray-700">
                                        {editingUser ? 'Password Baru' : 'Password'}
                                    </span>
                                    <input
                                        type="password"
                                        value={form.data.password}
                                        onChange={(event) => form.setData('password', event.target.value)}
                                        disabled={isSubmitting || form.processing}
                                        className="w-full rounded-xl border border-[#D8D7BE] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                                        placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
                                    />
                                    {form.errors.password && <p className="text-xs text-red-500">{form.errors.password}</p>}
                                </label>

                                <div className="md:col-span-2 mt-2 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => closeForm()}
                                        disabled={isSubmitting || form.processing}
                                        className="rounded-xl border border-[#D8D7BE] px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-[#F7F2E7] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            submitForm();
                                        }}
                                        disabled={isSubmitting || form.processing}
                                        className="flex min-w-40 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-80"
                                        style={{ background: '#691D1B' }}
                                    >
                                        <StagedLoadingContent
                                            loading={isSubmitting || form.processing}
                                            loadingLabel={editingUser ? 'Menyimpan perubahan...' : 'Menambahkan pengguna...'}
                                            longLoadingLabel="Masih memproses pengguna..."
                                        >
                                            {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                                        </StagedLoadingContent>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <DeleteConfirmModal
                    open={!!deleteTarget}
                    title="Yakin menghapus pengguna ini?"
                    description={deleteTarget ? `Tindakan ini akan menghapus akun ${deleteTarget.name} secara permanen dan tidak bisa dibatalkan.` : ''}
                    details={deleteTarget ? (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">{deleteTarget.email}</p>
                            <p className="mt-3 text-xs text-gray-500">Peran: {getRoleDisplay(extractRoleName(deleteTarget))}</p>
                        </>
                    ) : null}
                    confirmLabel="Ya, hapus pengguna"
                    onCancel={closeDeleteConfirm}
                    onConfirm={handleDelete}
                />
            </div>
        </AdminLayout>
    );
}
