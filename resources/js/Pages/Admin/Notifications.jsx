import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Bell, Check, Trash2, Clock } from 'lucide-react';

export default function Notifications({ notifications = [] }) {
    const [filter, setFilter] = useState('all');

    const filtered = (notifications || []).filter((notif) => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    });

    return (
        <AdminLayout title="Notifikasi" subtitle="Kelola notifikasi sistem platform.">
            <Head title="Notifikasi" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Notifikasi</h1>
                        <p className="text-sm text-gray-500">Kelola notifikasi dan pesan sistem</p>
                    </div>
                </div>

                <div className="mb-6 flex gap-2">
                    {['all', 'unread', 'read'].map((key) => {
                        const labels = { all: 'Semua', unread: 'Belum Dibaca', read: 'Sudah Dibaca' };
                        const isActive = filter === key;

                        return (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`rounded-lg px-4 py-2 text-sm transition-all ${
                                    isActive ? 'bg-[#691D1B] text-white' : 'border border-[#D8D7BE] text-gray-700 hover:bg-[#F7F2E7]'
                                }`}
                                style={isActive ? { fontWeight: 700 } : {}}
                            >
                                {labels[key]}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-3">
                    {filtered.map((notif) => (
                        <div key={notif.id} className={`flex items-start gap-4 rounded-2xl p-4 transition-colors ${notif.read ? 'bg-white border border-[#D8D7BE]' : 'bg-[#691D1B08] border border-[#691D1B20]'}`}>
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: notif.read ? '#F7F2E7' : '#691D1B20', color: '#691D1B' }}>
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                                <p className="mt-1 text-sm text-gray-600">{notif.description}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {notif.timestamp}
                                </div>
                            </div>
                            {!notif.read && (
                                <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: '#691D1B' }} />
                            )}
                            <button className="flex-shrink-0 p-2 rounded-lg hover:bg-[#F7F2E7] transition-colors">
                                <Trash2 className="h-4 w-4 text-gray-400" />
                            </button>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
