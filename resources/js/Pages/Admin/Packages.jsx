import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Plus, Edit, Trash2, Package, Users, Check } from 'lucide-react';

export default function Packages({ packages = [], stats = {} }) {
    const [showForm, setShowForm] = useState(false);

    return (
        <AdminLayout title="Manajemen Paket" subtitle="Kelola paket belajar yang tersedia di platform.">
            <Head title="Manajemen Paket" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Manajemen Paket</h1>
                        <p className="text-sm text-gray-500">Kelola paket belajar yang tersedia di platform</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412]"
                        style={{ background: '#691D1B', fontWeight: 600 }}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Paket
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {packages.map((pkg) => (
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
                                        <p className="text-xs" style={{ color: pkg.popular ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{pkg.students} siswa</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-1 text-2xl font-extrabold" style={{ color: pkg.popular ? '#FFE882' : '#691D1B' }}>
                                    {pkg.price}
                                </div>
                            </div>
                            <div className="p-5">
                                <ul className="mb-5 space-y-2">
                                    {pkg.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#691D1B' }} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-2">
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D8D7BE] py-2 text-xs text-gray-600 transition-colors hover:border-[#691D1B]">
                                        <Edit className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button className="rounded-lg border border-red-200 p-2 text-red-400 transition-colors hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                            <div className="border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                                <h3 className="font-bold text-white">Tambah Paket Baru</h3>
                            </div>
                            <div className="space-y-4 p-6">
                                {['Nama Paket', 'Harga', 'Deskripsi'].map((field) => (
                                    <div key={field}>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">{field}</label>
                                        {field === 'Deskripsi' ? (
                                            <textarea rows={3} className="w-full resize-none rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none" />
                                        ) : (
                                            <input type="text" className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 border-t border-[#F7F2E7] p-5 justify-end">
                                <button onClick={() => setShowForm(false)} className="rounded-xl border-2 border-[#D8D7BE] px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#691D1B]">
                                    Batal
                                </button>
                                <button onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
