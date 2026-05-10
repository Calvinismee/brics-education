import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    TrendingUp,
    UserPlus,
    Activity,
    Users,
    UserCheck,
    UserX,
    GraduationCap,
    ArrowUpRight,
} from 'lucide-react';

const fallbackMonthLabels = () => {
    const formatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });
    const currentMonth = new Date();

    return Array.from({ length: 6 }, (_, index) => {
        const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (5 - index), 1);

        return formatter.format(month);
    });
};

function StatCard({ label, value, change, icon, color }) {
    const isPositive = change.startsWith('+');

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: 'var(--brics-beige)' }}>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${color}15`, color }}>
                    {icon}
                </div>
                <div className="flex items-center gap-1" style={{ color: isPositive ? '#16a34a' : '#ef4444' }}>
                    <ArrowUpRight className={`h-4 w-4 ${!isPositive ? 'rotate-180' : ''}`} />
                    <span className="text-xs font-bold">{change}</span>
                </div>
            </div>
            <div className="mb-1 text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
        </div>
    );
}

function InfoCard({ title, icon, stats }) {
    return (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: 'var(--brics-beige)' }}>
            <div className="flex items-center gap-3 border-b p-5" style={{ borderColor: 'var(--brics-cream)' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--brics-maroon)15', color: 'var(--brics-maroon)' }}>
                    {icon}
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>
            <div className="space-y-3 p-5">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--brics-cream)' }}>
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className="text-sm font-extrabold" style={{ color: 'var(--brics-maroon)' }}>{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard({ userStats = [], growthData = [], growthLabels = [], studentStats = [], tutorStats = [], activityStats = [], topUsers = [], distributionData = [] }) {
    const [roleFilter, setRoleFilter] = useState('All');
    const maxVal = growthData.length > 0 ? Math.max(...growthData, 1) : 1;
    const monthLabels = growthLabels.length === growthData.length ? growthLabels : fallbackMonthLabels();
    const totalFromDistribution = distributionData.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
    const topUsersList = Array.isArray(topUsers) ? topUsers : Object.values(topUsers || {});

    const roles = ['All', ...Array.from(new Set(topUsersList.map((u) => u.role)))];
    const filteredTopUsers = topUsersList.filter((u) => roleFilter === 'All' || u.role === roleFilter);

    const statsWithIcons = (userStats || []).map((stat, idx) => {
        const iconMap = [
            { icon: <Users className="h-6 w-6" />, color: 'var(--brics-maroon)' },
            { icon: <UserPlus className="h-6 w-6" />, color: 'var(--brics-maroon)' },
            { icon: <Activity className="h-6 w-6" />, color: 'var(--brics-maroon)' },
            { icon: <UserX className="h-6 w-6" />, color: '#6b7280' },
        ];
        return { ...stat, ...iconMap[idx] || iconMap[0] };
    });

    return (
        <AdminLayout title="Dashboard Admin" subtitle="Ringkasan data pengguna platform BRICS Education.">
            <Head title="Dashboard Admin" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6">
                    <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Statistik Pengguna</h1>
                    <p className="text-sm text-gray-500">Ringkasan data pengguna platform BRICS Education</p>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {statsWithIcons.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: 'var(--brics-beige)' }}>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900">Pertumbuhan Pengguna</h3>
                                <p className="text-xs text-gray-400">6 bulan terakhir</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                <TrendingUp className="h-4 w-4" />
                                +8.2%
                            </div>
                        </div>
                        <div className="flex h-48 items-end justify-between gap-2">
                            {(growthData || []).map((value, index) => (
                                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-xs text-gray-500">{value.toLocaleString()}</span>
                                    <div
                                        className="w-full rounded-t-lg transition-all"
                                        style={{
                                            height: `${(value / maxVal) * 140}px`,
                                            background: index === (growthData || []).length - 1 ? 'var(--brics-maroon)' : 'var(--brics-beige)',
                                        }}
                                    />
                                    <span className="text-xs text-gray-400">{monthLabels[index]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: 'var(--brics-beige)' }}>
                        <h3 className="mb-5 font-bold text-gray-900">Distribusi Pengguna</h3>
                        <div className="flex items-center gap-6">
                            <div className="relative h-40 w-40 flex-shrink-0">
                                <svg viewBox="0 0 36 36" className="h-40 w-40 -rotate-90">
                                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--brics-cream)" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--brics-maroon)" strokeWidth="3" strokeDasharray="68 32" strokeDashoffset="0" />
                                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--brics-yellow)" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-68" />
                                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--brics-beige)" strokeWidth="3" strokeDasharray="7 93" strokeDashoffset="-93" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-xl font-extrabold" style={{ color: 'var(--brics-maroon)' }}>{totalFromDistribution}</div>
                                        <div className="text-xs text-gray-400">Total</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                {(distributionData || []).map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-sm" style={{ background: item.color }} />
                                                <span className="text-gray-600">{item.label}</span>
                                            </div>
                                            <span className="font-bold" style={{ color: 'var(--brics-maroon)' }}>{item.pct}%</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--brics-cream)' }}>
                                            <div className="h-1.5 rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <InfoCard title="Statistik Siswa" icon={<GraduationCap className="h-5 w-5" />} stats={studentStats || []} />
                    <InfoCard title="Statistik Tutor" icon={<UserCheck className="h-5 w-5" />} stats={tutorStats || []} />
                    <InfoCard title="Aktivitas Pengguna" icon={<Activity className="h-5 w-5" />} stats={activityStats || []} />
                </div>

                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: 'var(--brics-beige)' }}>
                        <div className="flex items-center border-b p-5" style={{ borderColor: 'var(--brics-cream)' }}>
                            <h3 className="font-bold text-gray-900">Pengguna Terbaru</h3>
                            <div className="ml-auto">
                                <label className="text-xs text-gray-500 mr-2" style={{ fontWeight: 600 }}>Filter:</label>
                                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-md border px-2 py-1 text-sm" style={{ borderColor: 'var(--brics-beige)' }}>
                                    {roles.map((r, index) => (
                                        <option key={`${r}-${index}`} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50" style={{ borderColor: 'var(--brics-beige)' }}>
                                    {['Nama', 'Peran', 'Status'].map((heading) => (
                                        <th key={heading} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-gray-500" style={{ fontWeight: 700 }}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody style={{ borderColor: 'var(--brics-beige)' }} className="divide-y">
                                {filteredTopUsers.map((user, index) => (
                                    <tr key={user.id ?? `${user.name ?? 'user'}-${index}`} className="transition-colors" style={{ '&:hover': { background: 'var(--brics-beige)' } }}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold" style={{ background: 'var(--brics-maroon)', color: 'var(--brics-yellow)' }}>
                                                    {(user.name || 'User')
                                                        .split(' ')
                                                        .map((part) => part[0])
                                                        .join('')
                                                        .slice(0, 2)}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800">{user.name || 'User'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: user.role === 'Tutor' ? 'var(--brics-yellow-opacity-20)' : 'var(--brics-maroon-opacity-10)', color: 'var(--brics-maroon)' }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        {/* Kursus and Progres intentionally hidden for admin view */}
                                        <td className="px-5 py-4">
                                            <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: user.status === 'Aktif' ? '#22c55e15' : '#ef444415', color: user.status === 'Aktif' ? '#16a34a' : '#ef4444' }}>
                                                {user.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
