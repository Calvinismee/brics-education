import { Link, usePage } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';
import {
    BookOpen,
    Calendar,
    ClipboardCheck,
    FileText,
    History,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ReceiptText,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { DashboardNotificationBell } from '@/Components/DashboardNotificationBell';

const navigationGroups = [
    {
        title: 'Overview',
        items: [
            { label: 'Statistik Pengguna', href: route('admin.dashboard'), icon: LayoutDashboard },
            {
                label: 'Statistik Transaksi',
                href: route('admin.transaction-stats'),
                icon: TrendingUp,
            },
            { label: 'Laporan', href: route('admin.reports.export'), icon: FileText },
        ],
    },
    {
        title: 'Operasional',
        items: [
            { label: 'Pengguna', href: route('admin.users'), icon: Users },
            { label: 'Transaksi', href: route('admin.transactions'), icon: ReceiptText },
            { label: 'Paket', href: route('admin.packages'), icon: Package },
            { label: 'Course', href: route('admin.courses'), icon: BookOpen },
            { label: 'Review Materi', href: route('admin.content'), icon: ClipboardCheck },
            { label: 'Jadwal', href: route('admin.schedule'), icon: Calendar },
            { label: 'Riwayat Tutor', href: route('admin.tutor-history'), icon: History },
        ],
    },
];

const adminSidebarScrollKey = 'brics-admin-sidebar-scroll-top';

const initialsFor = (name) => String(name || 'Admin')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function AdminLayout({ children, title, subtitle }) {
    const page = usePage();
    const user = page.props.auth?.user;
    const currentPath = page.url.split('?')[0];
    const sidebarRef = useRef(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const isActive = (href) => {
        const path = new URL(href, window.location.origin).pathname;
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const storedSidebarScrollTop = () => {
        if (typeof window === 'undefined') return 0;

        return Number(sessionStorage.getItem(adminSidebarScrollKey) ?? 0);
    };

    const restoreSidebarScroll = (sidebar) => {
        const scrollTop = storedSidebarScrollTop();

        if (Number.isFinite(scrollTop) && scrollTop > 0) {
            sidebar.scrollTop = scrollTop;
        }
    };

    const saveSidebarScroll = () => {
        if (typeof window === 'undefined' || !sidebarRef.current) return;

        sessionStorage.setItem(adminSidebarScrollKey, String(sidebarRef.current.scrollTop));
    };

    const setSidebarElement = (element) => {
        sidebarRef.current = element;

        if (element) {
            restoreSidebarScroll(element);
        }
    };

    useLayoutEffect(() => {
        const sidebar = sidebarRef.current;

        if (!sidebar) return undefined;

        restoreSidebarScroll(sidebar);

        sidebar.addEventListener('scroll', saveSidebarScroll, { passive: true });

        return () => {
            saveSidebarScroll();
            sidebar.removeEventListener('scroll', saveSidebarScroll);
        };
    }, []);

    const scrollToNavigationTarget = (href, behavior = 'smooth') => {
        const url = new URL(href, window.location.origin);
        const targetId = url.hash ? decodeURIComponent(url.hash.slice(1)) : 'admin-page-top';
        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({ behavior, block: 'start' });
            return;
        }

        window.scrollTo({ top: 0, behavior });
    };

    const handleNavigationClick = (event, href, closeOnNavigate) => {
        if (closeOnNavigate) {
            setShowMobileSidebar(false);
        }

        saveSidebarScroll();

        const url = new URL(href, window.location.origin);
        const isSamePageHash = url.hash && url.pathname === window.location.pathname;

        if (isSamePageHash) {
            event.preventDefault();
            scrollToNavigationTarget(href);
        }
    };

    const renderSidebarContent = (closeOnNavigate = false) => (
        <div
            ref={closeOnNavigate ? undefined : setSidebarElement}
            className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden text-white"
            style={{ scrollbarGutter: 'stable' }}
        >
            <div className="border-b border-white/10 px-5 py-5 pr-14">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-[#FFE882]">
                        BRICS Education
                    </p>
                    <div>
                        <div className="mt-3 text-2xl leading-tight text-white" style={{ fontWeight: 900 }}>
                            Admin Panel
                        </div>
                        <p className="mt-1 text-sm text-white/65">
                            Area operasional admin
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-b border-white/10 px-5 py-5">
                <div className="rounded-2xl border border-white/15 bg-white/[0.12] p-4 shadow-sm">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base" style={{ background: '#FFE882', color: '#691D1B', fontWeight: 900 }}>
                            {initialsFor(user?.name)}
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-base text-white" style={{ fontWeight: 900 }}>
                                {user?.name || 'Admin User'}
                            </div>
                            <div className="text-sm leading-tight text-white/75">Administrator</div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-white/80">Akses Panel</span>
                        <span className="rounded-full bg-[#FFE882]/20 px-2 py-0.5 text-[#FFE882]" style={{ fontWeight: 900 }}>
                            Admin
                        </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
                        <div
                            className="h-full rounded-full"
                            style={{ width: '100%', background: '#FFE882' }}
                        />
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-5 px-3.5 py-4">
                {navigationGroups.map((group) => (
                    <div key={group.title}>
                        <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                            {group.title}
                        </div>
                        <div className="mt-2 space-y-1.5">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        preserveScroll={false}
                                        onPointerDown={saveSidebarScroll}
                                        onClick={(event) => handleNavigationClick(event, item.href, closeOnNavigate)}
                                        onSuccess={() => scrollToNavigationTarget(item.href)}
                                        className={`flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-all hover:translate-x-0.5 hover:brightness-105 ${active
                                                ? 'bg-[#FFE882] text-[#691D1B]'
                                                : 'text-white/90 hover:bg-white/10 hover:text-white'
                                            }`}
                                        style={{ fontWeight: active ? 900 : 800 }}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="min-w-0 flex-1 truncate">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-auto space-y-2 border-t border-white/10 px-3.5 py-4">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    style={{ fontWeight: 800 }}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">Keluar</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div id="admin-page-top" className="min-h-screen bg-[#F7F2E7] text-[#111827]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="min-h-screen lg:pl-72">
                <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#741A18] text-white lg:flex">
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
                        className={`relative flex h-full w-72 max-w-[85vw] flex-col overflow-hidden bg-[#741A18] text-white shadow-2xl transition-transform duration-300 ease-out ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}
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
                                <DashboardNotificationBell
                                    markAllHref={route('admin.notifications.mark-all-as-read')}
                                    allHref={route('admin.notifications')}
                                    historyLabel="Riwayat terbaru admin"
                                />
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
