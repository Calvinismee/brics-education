import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useMemo, useState } from 'react';
import { Bell, Clock, CheckCircle, Check } from 'lucide-react';
import { normalizeNotifications, sortNotifications } from '@/utils/notifications';
import { showSuccessToast } from '@/utils/toast';

export default function Notifications({ notifications = {}, stats = {} }) {
    const [filter, setFilter] = useState('all');
    const notificationData = useMemo(() => normalizeNotifications(notifications), [notifications]);
    const { unreadCount = 0, totalNotifications = 0 } = stats;

    const filtered = useMemo(() => notificationData.filter((notif) => {
        if (filter === 'unread') return !notif.is_read;
        if (filter === 'read') return notif.is_read;
        return true;
    }), [notificationData, filter]);

    const sortedNotifications = useMemo(
        () => sortNotifications(filtered),
        [filtered],
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const markAsRead = (notificationId) => {
        router.post(route('admin.notifications.mark-as-read', notificationId), {}, {
            preserveScroll: true,
            onSuccess: () => showSuccessToast('Notifikasi ditandai sudah dibaca.'),
        });
    };

    const markAllAsRead = () => {
        router.post(route('admin.notifications.mark-all-as-read'), {}, {
            preserveScroll: true,
            onSuccess: () => showSuccessToast('Semua notifikasi ditandai sudah dibaca.'),
        });
    };

    return (
        <AdminLayout title="Notifikasi" subtitle="Kelola notifikasi dan pesan sistem.">
            <Head title="Notifikasi" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-lg text-gray-500">
                            Total {totalNotifications} notifikasi ({unreadCount} belum dibaca)
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="rounded-lg border border-[#691D1B] px-4 py-2 text-sm font-semibold text-[#691D1B] transition hover:bg-[#691D1B] hover:text-white"
                        >
                            Tandai Semua Dibaca
                        </button>
                    )}
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
                    {sortedNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`flex items-start gap-4 rounded-2xl p-4 transition-colors ${
                                notif.is_read ? 'bg-white border border-[#D8D7BE]' : 'bg-[#691D1B08] border border-[#691D1B20]'
                            }`}
                        >
                            <div
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                                style={{
                                    background: notif.is_read ? '#F7F2E7' : '#691D1B20',
                                    color: '#691D1B',
                                }}
                            >
                                {notif.is_read ? <CheckCircle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                                <p className="mt-1 text-sm text-gray-600">{notif.message}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(notif.created_at)}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end flex-shrink-0">
                                {!notif.is_read && (
                                    <button
                                        onClick={() => markAsRead(notif.id)}
                                        className="flex items-center gap-1 rounded-lg bg-[#691D1B]/10 px-2 py-1 text-sm font-semibold text-[#691D1B] transition hover:bg-[#691D1B] hover:text-white"
                                    >
                                        <Check className="h-4 w-4" />
                                        Baca
                                    </button>
                                )}
                                {!notif.is_read && <div className="h-2 w-2 rounded-full" style={{ background: '#691D1B' }} />}
                            </div>
                        </div>
                    ))}
                </div>

                {sortedNotifications.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
