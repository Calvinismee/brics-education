import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, X, Plus } from 'lucide-react';

const notifications = [
    { id: 1, type: 'info', title: 'Pendaftaran Massal', message: '47 siswa baru mendaftar hari ini, meningkat 23% dari kemarin.', time: '5 menit lalu', read: false },
    { id: 2, type: 'warning', title: 'Pembayaran Pending', message: '12 transaksi menunggu konfirmasi lebih dari 24 jam.', time: '30 menit lalu', read: false },
    { id: 3, type: 'success', title: 'Materi Disetujui', message: '5 materi baru dari tutor telah divalidasi dan dipublikasikan.', time: '1 jam lalu', read: false },
    { id: 4, type: 'error', title: 'Gagal Upload', message: '3 file video gagal diupload karena ukuran melebihi batas.', time: '2 jam lalu', read: true },
    { id: 5, type: 'info', title: 'Jadwal Diperbarui', message: 'Jadwal kelas untuk bulan Mei 2025 telah dikonfigurasi.', time: '3 jam lalu', read: true },
    { id: 6, type: 'success', title: 'Backup Database', message: 'Backup otomatis berhasil pada pukul 03:00 WIB.', time: '8 jam lalu', read: true },
];

const typeConfig = {
    info: { icon: <Info className="h-5 w-5" />, bg: '#691D1B10', color: '#691D1B', border: '#691D1B30' },
    warning: { icon: <AlertTriangle className="h-5 w-5" />, bg: '#f59e0b10', color: '#d97706', border: '#f59e0b40' },
    success: { icon: <CheckCircle className="h-5 w-5" />, bg: '#22c55e10', color: '#16a34a', border: '#22c55e40' },
    error: { icon: <XCircle className="h-5 w-5" />, bg: '#ef444410', color: '#ef4444', border: '#ef444440' },
};

export default function Notifications() {
    const [items, setItems] = useState(notifications);
    const [filter, setFilter] = useState('all');

    const unreadCount = items.filter((notification) => !notification.read).length;
    const filtered = items.filter((notification) => filter === 'all' || !notification.read);

    const markAllRead = () => setItems((previous) => previous.map((notification) => ({ ...notification, read: true })));
    const remove = (id) => setItems((previous) => previous.filter((notification) => notification.id !== id));

    return (
        <AdminLayout title="Notifikasi Sistem" subtitle="Kelola notifikasi untuk admin dan operasional.">
            <Head title="Notifikasi Sistem" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Notifikasi Sistem</h1>
                        <p className="text-sm text-gray-500">
                            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={markAllRead}
                            className="rounded-xl border-2 border-[#691D1B] px-4 py-2.5 text-sm font-semibold text-[#691D1B] transition-colors hover:bg-[#691D1B] hover:text-white"
                        >
                            Tandai Semua Dibaca
                        </button>
                        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                            <Plus className="h-4 w-4" />
                            Buat Notifikasi
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Semua', value: items.length, type: 'info' },
                        { label: 'Peringatan', value: items.filter((notification) => notification.type === 'warning').length, type: 'warning' },
                        { label: 'Berhasil', value: items.filter((notification) => notification.type === 'success').length, type: 'success' },
                        { label: 'Error', value: items.filter((notification) => notification.type === 'error').length, type: 'error' },
                    ].map((stat) => {
                        const config = typeConfig[stat.type];

                        return (
                            <div key={stat.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: config.bg, color: config.color }}>
                                    {config.icon}
                                </div>
                                <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="mb-5 flex gap-2">
                    {[{ key: 'all', label: 'Semua' }, { key: 'unread', label: `Belum Dibaca (${unreadCount})` }].map((button) => (
                        <button
                            key={button.key}
                            onClick={() => setFilter(button.key)}
                            className="rounded-full px-4 py-2 text-sm transition-all"
                            style={filter === button.key ? { background: '#691D1B', color: 'white', fontWeight: 700 } : { background: 'white', color: '#374151', border: '1px solid #D8D7BE' }}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.map((notification) => {
                        const config = typeConfig[notification.type];

                        return (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all ${!notification.read ? 'border-l-4' : 'border'}`}
                                style={{ borderColor: !notification.read ? config.color : '#D8D7BE', borderLeftColor: !notification.read ? config.color : undefined }}
                            >
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: config.bg, color: config.color }}>
                                    {config.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900">{notification.title}</p>
                                                {!notification.read && <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: config.color }} />}
                                            </div>
                                            <p className="text-sm text-gray-600">{notification.message}</p>
                                            <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                                        </div>
                                        <button onClick={() => remove(notification.id)} className="flex-shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="rounded-2xl border border-[#D8D7BE] bg-white p-12 text-center shadow-sm">
                            <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="text-sm text-gray-400">Tidak ada notifikasi</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
