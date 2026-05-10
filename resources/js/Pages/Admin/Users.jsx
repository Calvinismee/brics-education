import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useMemo, useState } from 'react';
import { Search, UserPlus, Download, CheckSquare, Edit, X, ArrowUpDown, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import { Spinner } from '@/Components/ui/LoadingStates';
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

const emptyForm = {
    name: '',
    email: '',
    password: '',
    role: 'student',
};

const normalizeRoleName = (role) => {
    const roleName = typeof role === 'object' ? role?.name : role;
    const normalizedRole = String(roleName || 'student').toLowerCase().trim();

    return normalizedRole === 'mentor' ? 'tutor' : normalizedRole;
};

const extractRoleName = (user) => {
    return normalizeRoleName(user.role);
};

export default function Users({ users = { data: [] }, totalUsers = 0, stats = {} }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm(emptyForm);

    const userData = users.data || [];

    const filtered = useMemo(() => {
        let result = userData.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            const matchesRole = selectedRole === 'all' || extractRoleName(user) === selectedRole;

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

        return payload;
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
        if (selectedRole !== 'all') params.append('role', selectedRole);
        if (search) params.append('search', search);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const href = route('admin.users.export') + (params.toString() ? '?' + params.toString() : '');
        window.location.href = href;
    };

    return (
        <AdminLayout title="Manajemen Pengguna" subtitle="Kelola data siswa dan tutor platform.">
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

                <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
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
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 rounded-lg border border-[#D8D7BE] bg-white px-2 py-1.5">
                                {['all', 'student', 'tutor', 'admin'].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${selectedRole === role ? 'text-white' : 'text-gray-600 hover:bg-[#F7F2E7]'
                                            }`}
                                        style={selectedRole === role ? { background: '#691D1B' } : {}}
                                    >
                                        {role === 'all' ? 'Semua' : getRoleDisplay(role)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-row gap-2">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) => setDateFrom(event.target.value)}
                                    className="rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm outline-none focus:border-[#691D1B]"
                                    title="Dari tanggal"
                                />
                                <p className="text-sm text-gray-500">s/d</p>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) => setDateTo(event.target.value)}
                                    className="rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm outline-none focus:border-[#691D1B]"
                                    title="Sampai tanggal"
                                />
                            </div>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]"
                                title={`Urutkan ${sortOrder === 'desc' ? 'Terbaru dulu' : 'Terlama dulu'}`}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                                {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#691D1B]"
                            >
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
                                    {['Pengguna', 'Email', 'Peran', 'Bergabung', 'Aksi'].map((heading) => (
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
                                                <span
                                                    className="rounded-full px-2 py-1 text-xs"
                                                    style={{
                                                        background: `${getStatusColor(roleName)}15`,
                                                        color: getStatusColor(roleName),
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {getRoleDisplay(roleName)}
                                                </span>
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
                                <p className="text-sm text-gray-500">Tidak ada pengguna ditemukan</p>
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
                                        {(isSubmitting || form.processing) && <Spinner size="xs" color="#FFE882" />}
                                        {(isSubmitting || form.processing) ? (editingUser ? 'Menyimpan perubahan...' : 'Menambahkan pengguna...') : editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
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
