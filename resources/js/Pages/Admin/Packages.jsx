import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Plus, Edit, Trash2, Package, Users, Check } from 'lucide-react';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import { Spinner } from '@/Components/ui/LoadingStates';
import { showSuccessToast } from '@/utils/toast';

const formatPriceInput = (value) => {
    const digits = String(value ?? '').replace(/\D/g, '');

    if (digits === '') {
        return '';
    }

    return new Intl.NumberFormat('id-ID').format(Number(digits));
};

const normalizePriceValue = (value) => String(value ?? '').replace(/\D/g, '');

export default function Packages({ packages = [], stats = {} }) {
    const packageList = Array.isArray(packages?.data) ? packages.data : packages;
    const [showForm, setShowForm] = useState(false);
    const [editingPkgId, setEditingPkgId] = useState(null);
    const [featureInput, setFeatureInput] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const form = useForm({ name: '', price: '', description: '', features: [], popular: false });

    const closeForm = () => {
        setShowForm(false);
        setEditingPkgId(null);
        setFeatureInput('');
        form.reset();
        form.clearErrors();
    };

    const openCreate = () => {
        setEditingPkgId(null);
        form.setData({ name: '', price: '', description: '', features: [], popular: false });
        form.clearErrors();
        setFeatureInput('');
        setShowForm(true);
    };

    const openEdit = (pkg) => {
        setEditingPkgId(pkg.id);
        form.setData({
            name: pkg.name || '',
            price: normalizePriceValue(pkg.price),
            description: pkg.description || '',
            features: Array.isArray(pkg.features) ? pkg.features : [],
            popular: !!pkg.popular,
        });
        form.clearErrors();
        setFeatureInput('');
        setShowForm(true);
    };

    const openDeleteConfirm = (pkg) => {
        setDeleteTarget(pkg);
    };

    const closeDeleteConfirm = () => {
        setDeleteTarget(null);
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        form.setData((current) => ({
            ...current,
            price: normalizePriceValue(current.price),
            features: current.features || [],
            popular: !!current.popular,
        }));

        if (editingPkgId) {
            form.put(route('admin.packages.update', editingPkgId), {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm();
                    showSuccessToast('Paket berhasil diperbarui.');
                },
            });
            return;
        }

        form.post(route('admin.packages.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeForm();
                showSuccessToast('Paket berhasil ditambahkan.');
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        form.delete(route('admin.packages.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteConfirm();
                showSuccessToast('Paket berhasil dihapus.');
            },
            onError: closeDeleteConfirm,
        });
    };

    return (
        <AdminLayout title="Manajemen Paket" subtitle="Kelola paket belajar yang tersedia di platform.">
            <Head title="Manajemen Paket" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412]"
                        style={{ background: '#691D1B', fontWeight: 600 }}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Paket
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        { label: 'Total Paket', value: stats.totalPackages || packageList.length || 0 },
                        { label: 'Paket Populer', value: stats.activePackages || packageList.filter((pkg) => pkg.popular).length || 0 },
                        { label: 'Paket Aktif', value: stats.totalPackages || packageList.length || 0 },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wide text-gray-400" style={{ fontWeight: 700 }}>{stat.label}</div>
                            <div className="mt-1 text-2xl font-extrabold text-gray-900">{Number(stat.value).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {packageList.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
                                pkg.popular ? 'border-[#691D1B]' : 'border-[#D8D7BE]'
                            }`}
                        >
                            {pkg.popular && (
                                <div className="absolute left-0 right-0 top-0 py-1.5 text-center text-xs" style={{ background: '#FFE882', color: '#691D1B', fontWeight: 700 }}>
                                    Paling Populer
                                </div>
                            )}
                            <div className={`p-5 ${pkg.popular ? 'pt-10' : ''}`} style={{ background: pkg.popular ? '#691D1B' : 'white' }}>
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: pkg.popular ? 'rgba(255,232,130,0.2)' : '#691D1B15', color: pkg.popular ? '#FFE882' : '#691D1B' }}>
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold" style={{ color: pkg.popular ? 'white' : '#111827' }}>
                                            {pkg.name}
                                        </h3>
                                    </div>
                                </div>
                                        <div className="mb-1 text-2xl font-extrabold" style={{ color: pkg.popular ? '#FFE882' : '#691D1B' }}>
                                            Rp {formatPriceInput(pkg.price)}
                                        </div>
                            </div>
                                <div className="p-5">
                                <ul className="mb-5 space-y-2">
                                    {(pkg.features || []).map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#691D1B' }} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-2">
                                        <button onClick={() => openEdit(pkg)} className="group flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D8D7BE] py-2 text-xs text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#691D1B] active:translate-y-0" title="Edit paket">
                                            <Edit className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#691D1B]" />
                                            Edit
                                        </button>
                                        <button onClick={() => openDeleteConfirm(pkg)} className="group rounded-lg border border-red-200 p-2 text-red-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 active:translate-y-0" title="Hapus paket">
                                            <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:text-red-500" />
                                        </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DeleteConfirmModal
                    open={!!deleteTarget}
                    title="Yakin menghapus paket ini?"
                    description={deleteTarget ? `${deleteTarget.name} akan dihapus permanen dan tidak bisa dibatalkan.` : ''}
                    details={deleteTarget ? (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Harga</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">Rp {formatPriceInput(deleteTarget.price)}</p>
                        </>
                    ) : null}
                    confirmLabel="Ya, hapus paket"
                    onCancel={closeDeleteConfirm}
                    onConfirm={handleDelete}
                />

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                                <h3 className="font-bold text-white">{editingPkgId ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
                                <p className="mt-1 text-xs text-white/70">Isi nama, harga, deskripsi singkat, fitur utama, jumlah siswa, dan status populer.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Nama Paket</label>
                                        <p className="mb-2 text-xs text-gray-500">Contoh: Paket Dasar, Paket Intensif, Paket Premium.</p>
                                        <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} type="text" className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none" placeholder="Masukkan nama paket" />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Harga</label>
                                        <p className="mb-2 text-xs text-gray-500">Ketik angka saja. Format ribuan akan muncul otomatis, misalnya 250000 menjadi Rp 250.000.</p>
                                        <input
                                            value={formatPriceInput(form.data.price)}
                                            onChange={(e) => form.setData('price', normalizePriceValue(e.target.value))}
                                            type="text"
                                            inputMode="numeric"
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                            placeholder="Rp 0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Deskripsi</label>
                                    <p className="mb-2 text-xs text-gray-500">Jelaskan ringkas manfaat utama paket ini agar mudah dibandingkan.</p>
                                    <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={4} className="w-full resize-none rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none" placeholder="Contoh: Paket untuk siswa yang ingin belajar mandiri dengan pendampingan mentor." />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Fitur</label>
                                    <p className="mb-2 text-xs text-gray-500">Tambahkan poin fitur satu per satu. Contoh: akses video, live class, sertifikat, konsultasi mentor.</p>
                                    <div className="flex gap-2">
                                        <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} type="text" className="flex-1 rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none" placeholder="Tambahkan fitur" />
                                        <button type="button" onClick={() => { if (!featureInput.trim()) return; form.setData('features', [...(form.data.features || []), featureInput.trim()]); setFeatureInput(''); }} className="rounded-lg px-3 py-2 bg-[#691D1B] text-white">Tambah</button>
                                    </div>
                                    <ul className="mt-2 space-y-1">
                                        {(form.data.features || []).map((ftr, idx) => (
                                            <li key={`${ftr}-${idx}`} className="flex items-center justify-between gap-2 rounded-md bg-[#F7F2E7] px-3 py-2 text-sm">
                                                <span>{ftr}</span>
                                                <button type="button" onClick={() => form.setData('features', (form.data.features || []).filter((_, i) => i !== idx))} className="text-red-400 text-xs">Hapus</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3">
                                    <input id="popular" checked={form.data.popular} onChange={(e) => form.setData('popular', e.target.checked)} type="checkbox" className="h-4 w-4" />
                                    <div>
                                        <label htmlFor="popular" className="text-sm font-semibold text-gray-700">Tandai sebagai paling populer</label>
                                        <p className="text-xs text-gray-500">Paket populer akan ditonjolkan di kartu daftar paket.</p>
                                    </div>
                                </div>
                                {Object.keys(form.errors || {}).length > 0 && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                        {Object.values(form.errors)[0]}
                                    </div>
                                )}
                                <div className="flex gap-3 border-t border-[#F7F2E7] pt-5 justify-end">
                                    <button type="button" onClick={closeForm} className="rounded-xl border-2 border-[#D8D7BE] px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#691D1B]">
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex min-w-32 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-70"
                                        style={{ background: '#691D1B' }}
                                        disabled={form.processing}
                                    >
                                        {form.processing && <Spinner size="xs" color="#FFE882" />}
                                        {form.processing ? (editingPkgId ? 'Menyimpan perubahan...' : 'Menambahkan paket...') : 'Simpan'}
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
