import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const highlightColors = {
    users: '#691D1B',
    packages: '#8B2523',
    content: '#4A1412',
    schedule: '#7c2321',
    transactions: '#691D1B',
    'transaction-stats': '#8B2523',
    notifications: '#4A1412',
    'reports.export': '#691D1B',
    settings: '#7c2321',
    'settings.notifications': '#8B2523',
};

export default function Section({ title, description, focus }) {
    const accent = highlightColors[title?.toLowerCase?.()] || '#691D1B';

    const checklist = [
        'Hubungkan ke controller atau query builder.',
        'Tambahkan form, filter, dan pagination.',
        'Sambungkan aksi create/edit/delete secara bertahap.',
    ];

    return (
        <AdminLayout title={title} subtitle={description}>
            <Head title={title} />

            <div className="space-y-6 p-4 lg:p-6">
                <section className="rounded-[28px] border border-[#D8D7BE] bg-white p-6 shadow-sm lg:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div
                                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white"
                                style={{ background: accent }}
                            >
                                Scaffolded admin section
                            </div>
                            <h2 className="mt-4 text-3xl font-black text-gray-900">{title}</h2>
                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                {description}
                            </p>
                        </div>

                        <div className="rounded-3xl bg-[#F7F2E7] p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                                Focus
                            </div>
                            <div className="mt-2 max-w-sm text-sm font-semibold text-gray-800">
                                {focus}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    {[
                        { label: 'Ready for API', value: 'Yes' },
                        { label: 'Navigation wired', value: 'Yes' },
                        { label: 'Design language', value: 'BRICS theme' },
                    ].map((item) => (
                        <article key={item.label} className="rounded-3xl border border-[#D8D7BE] bg-white p-5 shadow-sm">
                            <div className="text-sm text-gray-500">{item.label}</div>
                            <div className="mt-2 text-2xl font-black text-[#691D1B]">{item.value}</div>
                        </article>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <article className="rounded-[28px] border border-[#D8D7BE] bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900">Implementation checklist</h3>
                        <div className="mt-5 space-y-3">
                            {checklist.map((item) => (
                                <div key={item} className="rounded-2xl bg-[#F7F2E7] px-4 py-3 text-sm text-gray-700">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-[28px] border border-[#D8D7BE] bg-[#691D1B] p-6 text-white shadow-sm">
                        <h3 className="text-lg font-bold">What to build next</h3>
                        <p className="mt-3 text-sm leading-6 text-white/80">
                            This section is already routed and styled. Next, connect it to the backend model,
                            add real data, and replace this scaffold with CRUD actions.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href={route('admin.dashboard')}
                                className="rounded-2xl bg-[#FFE882] px-4 py-2.5 text-sm font-semibold text-[#000000] transition hover:bg-[#f6dc6f]"
                            >
                                Back to dashboard
                            </Link>
                            <Link
                                href={route('admin.users')}
                                className="rounded-2xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Open users
                            </Link>
                        </div>
                    </article>
                </section>
            </div>
        </AdminLayout>
    );
}
