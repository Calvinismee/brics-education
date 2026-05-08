import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';

const navigationGroups = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', href: route('admin.dashboard'), badge: 'DA' },
            { label: 'Pengguna', href: route('admin.users'), badge: 'US' },
            { label: 'Paket', href: route('admin.packages'), badge: 'PK' },
            { label: 'Konten', href: route('admin.content'), badge: 'CT' },
        ],
    },
    {
        title: 'Operasional',
        items: [
            { label: 'Jadwal', href: route('admin.schedule'), badge: 'SC' },
            { label: 'Transaksi', href: route('admin.transactions'), badge: 'TR' },
            {
                label: 'Statistik Transaksi',
                href: route('admin.transaction-stats'),
                badge: 'ST',
            },
        ],
    },
    {
        title: 'Sistem',
        items: [
            { label: 'Export Laporan', href: route('admin.reports.export'), badge: 'RP' },
            { label: 'Pengaturan', href: route('admin.settings'), badge: 'SG' },
            {
                label: 'Notif. Sistem',
                href: route('admin.settings.notifications'),
                badge: 'SN',
            },
        ],
    },
];

export default function AdminLayout({ children, title, subtitle, notifications = [] }) {
    const page = usePage();
    const user = page.props.auth?.user;
    const currentPath = page.url.split('?')[0];
    const [showNotifications, setShowNotifications] = useState(false);
    // Prefer Inertia-shared `notifications` (available via middleware), fall back to prop
    const initialNotifications = page.props?.notifications ?? notifications ?? [];
    const [notificationList, setNotificationList] = useState(Array.isArray(initialNotifications) ? initialNotifications : []);

    // Sync notification list when page props change
    useEffect(() => {
        const newNotifications = page.props?.notifications ?? notifications ?? [];
        if (Array.isArray(newNotifications)) {
            setNotificationList(newNotifications);
        }
    }, [page.props?.notifications, notifications]);

    const isActive = (href) => {
        const path = new URL(href, window.location.origin).pathname;
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const markAsRead = (notificationId) => {
        router.post(route('admin.notifications.mark-as-read', notificationId), {}, {
            preserveScroll: true,
            only: ['notifications']
        });
    };

    const sortedNotificationList = [...notificationList].sort((a, b) => {
        // Unread notifications come first
        if (a.is_read !== b.is_read) {
            return a.is_read ? 1 : -1;
        }

        // For unread: sort by created_at descending (newest first)
        if (!a.is_read && !b.is_read) {
            return new Date(b.created_at) - new Date(a.created_at);
        }

        // For read: sort by created_at ascending (oldest first)
        return new Date(a.created_at) - new Date(b.created_at);
    });

    const unreadCount = notificationList.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-[#F7F2E7] text-[#111827]">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#691D1B] text-white lg:flex">
                    <div className="border-b border-white/10 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-[0.25em] text-[#FFE882]/80">
                                    BRICS Education
                                </div>
                                <div className="mt-1 text-lg font-bold text-white">
                                    Admin Panel
                                </div>
                            </div>
                            <div className="rounded-2xl border border-[#FFE882]/30 bg-[#FFE882]/10 px-3 py-1 text-xs font-semibold text-[#FFE882]">
                                LIVE
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-white/10 p-5">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFE882] text-sm font-extrabold text-[#691D1B]">
                                {(user?.name || 'Admin')
                                    .split(' ')
                                    .map((part) => part[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-white">
                                    {user?.name || 'Admin User'}
                                </div>
                                <div className="text-xs text-white/60">Administrator</div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-5 overflow-y-auto p-4">
                        {navigationGroups.map((group) => (
                            <div key={group.title}>
                                <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                                    {group.title}
                                </div>
                                <div className="mt-2 space-y-1">
                                    {group.items.map((item) => {
                                        const active = isActive(item.href);

                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${
                                                    active
                                                        ? 'bg-[#FFE882] text-[#000000] shadow-sm'
                                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold ${
                                                        active
                                                            ? 'bg-[#691D1B] text-white'
                                                            : 'bg-white/10 text-[#FFE882]'
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="border-t border-white/10 p-4">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center justify-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                            Keluar
                        </Link>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-20 border-b border-[#D8D7BE] bg-white/95 px-4 py-4 backdrop-blur lg:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#691D1B]/70">
                                    Admin Workspace
                                </div>
                                <h1 className="mt-1 text-xl font-bold text-gray-900">
                                    {title || 'Admin Panel'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    {subtitle || 'Kelola operasional platform dari satu panel.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Notifications Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] text-gray-700 transition hover:bg-[#E8E3D6]"
                                    >
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showNotifications && (
                                        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[#D8D7BE] bg-white shadow-lg">
                                            <div className="flex items-center justify-between border-b border-[#F7F2E7] p-4">
                                                <h3 className="font-bold text-gray-900">Notifikasi</h3>
                                                <button onClick={() => setShowNotifications(false)}>
                                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                </button>
                                            </div>

                                            <div className="max-h-96 overflow-y-auto">
                                                {sortedNotificationList.length === 0 ? (
                                                    <div className="p-6 text-center text-sm text-gray-500">
                                                        Tidak ada notifikasi
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-[#F7F2E7]">
                                                        {sortedNotificationList.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`flex items-start justify-between gap-3 p-4 transition hover:bg-[#F7F2E7] ${
                                                                    !notification.is_read ? 'bg-[#F9F7F5]' : ''
                                                                }`}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        {notification.title}
                                                                    </h4>
                                                                    <p className="mt-1 text-sm text-gray-600">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="mt-2 text-xs text-gray-400">
                                                                        {new Date(notification.created_at).toLocaleDateString('id-ID', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </p>
                                                                </div>
                                                                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                                                                    {!notification.is_read && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                markAsRead(notification.id);
                                                                            }}
                                                                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#691D1B]/10 text-[#691D1B] hover:bg-[#691D1B]/20 transition"
                                                                            title="Tandai sebagai dibaca"
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                    {!notification.is_read && (
                                                                        <div className="h-2 w-2 rounded-full bg-[#691D1B]" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-[#F7F2E7] p-4">
                                                <Link
                                                    href={route('admin.notifications')}
                                                    className="block text-center text-sm font-semibold text-[#691D1B] transition hover:text-[#4A1412]"
                                                >
                                                    Lihat Semua Notifikasi
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="hidden items-center gap-3 md:flex">
                                    <div className="rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-2">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                            Admin
                                        </div>
                                        <div className="text-sm font-semibold text-gray-800">
                                            {user?.email || 'admin@brics-education.test'}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-[#691D1B] px-4 py-2 text-sm font-semibold text-[#FFE882] shadow-sm">
                                        Online
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
