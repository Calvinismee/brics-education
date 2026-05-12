import { Link, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Bell, Check, Menu, X } from 'lucide-react';
import { countUnreadNotifications, normalizeNotifications, sortNotifications } from '@/utils/notifications';

const navigationGroups = [
    {
        title: 'Overview',
        items: [
            { label: 'Statistik Pengguna', href: route('admin.dashboard'), badge: 'DA' },
            {
                label: 'Statistik Transaksi',
                href: route('admin.transaction-stats'),
                badge: 'ST',
            },
            { label: 'Laporan', href: route('admin.reports.export'), badge: 'LP' },
        ],
    },
    {
        title: 'Operasional',
        items: [
            { label: 'Pengguna', href: route('admin.users'), badge: 'US' },
            { label: 'Transaksi', href: route('admin.transactions'), badge: 'TR' },
            { label: 'Paket', href: route('admin.packages'), badge: 'PK' },
            { label: 'Course', href: route('admin.courses'), badge: 'CR' },
            { label: 'Konten', href: route('admin.content'), badge: 'CT' },
            { label: 'Jadwal', href: route('admin.schedule'), badge: 'SC' },
        ],
    },
];

export default function AdminLayout({ children, title, subtitle, notifications = [] }) {
    const page = usePage();
    const user = page.props.auth?.user;
    const currentPath = page.url.split('?')[0];
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const sharedNotifications = page.props?.notifications ?? notifications;
    const notificationList = useMemo(
        () => normalizeNotifications(sharedNotifications),
        [sharedNotifications],
    );

    const isActive = (href) => {
        const path = new URL(href, window.location.origin).pathname;
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const markAsRead = (notificationId) => {
        router.post(route('admin.notifications.mark-as-read', notificationId), {}, {
            preserveScroll: true,
            only: ['notifications'],
        });
    };

    const sortedNotificationList = useMemo(
        () => sortNotifications(notificationList),
        [notificationList],
    );
    const unreadCount = useMemo(
        () => countUnreadNotifications(notificationList),
        [notificationList],
    );

    const renderSidebarContent = (closeOnNavigate = false) => (
        <>
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

            <nav className="flex-1 space-y-5 p-4">
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
                                        onClick={() => closeOnNavigate && setShowMobileSidebar(false)}
                                        className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${active
                                                ? 'bg-[#FFE882] text-[#000000] shadow-sm'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <span
                                            className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold ${active
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
        </>
    );

    return (
        <div className="min-h-screen bg-[#F7F2E7] text-[#111827]">
            <div className="min-h-screen lg:pl-72">
                <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#691D1B] text-white lg:flex">
                    {renderSidebarContent()}
                </aside>

                <div
                    className={`fixed inset-0 z-40 lg:hidden ${showMobileSidebar ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    aria-hidden={!showMobileSidebar}
                >
                    <button
                        type="button"
                        aria-label="Tutup menu admin"
                        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${showMobileSidebar ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setShowMobileSidebar(false)}
                    />
                    <aside
                        className={`relative flex h-full w-[calc(100vw-2rem)] max-w-72 flex-col bg-[#691D1B] text-white shadow-2xl transition-transform duration-300 ease-out ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        <button
                            type="button"
                            aria-label="Tutup menu admin"
                            onClick={() => setShowMobileSidebar(false)}
                            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {renderSidebarContent(true)}
                    </aside>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-20 border-b border-[#D8D7BE] bg-white/95 px-4 py-4 backdrop-blur lg:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                                <button
                                    type="button"
                                    aria-label="Buka menu admin"
                                    onClick={() => setShowMobileSidebar(true)}
                                    className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] text-gray-700 transition hover:bg-[#E8E3D6] lg:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                                <div className="min-w-0">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#691D1B]/70">
                                        Admin Workspace
                                    </div>
                                    <h1 className="mt-1 truncate text-lg font-bold text-gray-900 sm:text-xl">
                                        {title || 'Admin Panel'}
                                    </h1>
                                    <p className="mt-1 hidden text-sm text-gray-500 sm:block">
                                        {subtitle || 'Kelola operasional platform dari satu panel.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
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
                                        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[#D8D7BE] bg-white shadow-lg">
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
                                                                className={`flex items-start justify-between gap-3 p-4 transition hover:bg-[#F7F2E7] ${!notification.is_read ? 'bg-[#F9F7F5]' : ''
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
