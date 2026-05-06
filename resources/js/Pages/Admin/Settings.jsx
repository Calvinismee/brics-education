import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Save, Shield, Bell, Globe, CreditCard, Sliders } from 'lucide-react';

export default function Settings({ initialTab = 'general' }) {
    const [notifications, setNotifications] = useState({
        emailNew: true,
        emailPayment: true,
        emailContent: false,
        pushAll: true,
    });

    const [general, setGeneral] = useState({
        siteName: 'BRICS Education',
        siteUrl: 'https://brics-education.id',
        supportEmail: 'support@brics-education.id',
        maxUploadSize: '500',
        defaultLanguage: 'id',
    });

    const tabs = [
        { key: 'general', label: 'Umum', icon: <Sliders className="h-4 w-4" /> },
        { key: 'notifications', label: 'Notifikasi', icon: <Bell className="h-4 w-4" /> },
        { key: 'payment', label: 'Pembayaran', icon: <CreditCard className="h-4 w-4" /> },
        { key: 'security', label: 'Keamanan', icon: <Shield className="h-4 w-4" /> },
    ];

    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <AdminLayout title="Pengaturan Sistem" subtitle="Konfigurasi platform BRICS Education.">
            <Head title="Pengaturan Sistem" />

            <div className="p-4 lg:p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="mb-6">
                    <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Pengaturan Sistem</h1>
                    <p className="text-sm text-gray-500">Konfigurasi platform BRICS Education</p>
                </div>

                <div className="flex gap-6">
                    <div className="w-48 flex-shrink-0">
                        <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex w-full items-center gap-3 border-b border-[#F7F2E7] px-4 py-3.5 text-sm transition-all last:border-0 ${activeTab === tab.key ? 'text-[#691D1B]' : 'text-gray-600 hover:bg-[#F7F2E7]'}`}
                                    style={activeTab === tab.key ? { background: '#691D1B10', fontWeight: 700 } : {}}
                                >
                                    <span style={{ color: activeTab === tab.key ? '#691D1B' : '#9ca3af' }}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        {activeTab === 'general' && (
                            <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                                <div className="border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                                    <h3 className="flex items-center gap-2 font-bold text-white">
                                        <Globe className="h-5 w-5" />
                                        Konfigurasi Umum
                                    </h3>
                                </div>
                                <div className="space-y-5 p-6">
                                    {[
                                        { label: 'Nama Platform', key: 'siteName' },
                                        { label: 'URL Platform', key: 'siteUrl' },
                                        { label: 'Email Dukungan', key: 'supportEmail' },
                                        { label: 'Ukuran Upload Maks (MB)', key: 'maxUploadSize' },
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">{field.label}</label>
                                            <input
                                                type="text"
                                                value={general[field.key]}
                                                onChange={(event) => setGeneral((previous) => ({ ...previous, [field.key]: event.target.value }))}
                                                className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm transition-colors focus:border-[#691D1B] focus:outline-none"
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Bahasa Default</label>
                                        <select
                                            value={general.defaultLanguage}
                                            onChange={(event) => setGeneral((previous) => ({ ...previous, defaultLanguage: event.target.value }))}
                                            className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none"
                                        >
                                            <option value="id">Bahasa Indonesia</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                        <Save className="h-4 w-4" />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                                <div className="border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                                    <h3 className="flex items-center gap-2 font-bold text-white">
                                        <Bell className="h-5 w-5" />
                                        Pengaturan Notifikasi
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <h4 className="mb-4 font-bold text-gray-800">Notifikasi Email</h4>
                                    <div className="mb-8 space-y-4">
                                        {[
                                            { key: 'emailNew', label: 'Pendaftaran pengguna baru', desc: 'Kirim email saat ada siswa/tutor baru mendaftar' },
                                            { key: 'emailPayment', label: 'Konfirmasi pembayaran', desc: 'Kirim email saat transaksi berhasil atau gagal' },
                                            { key: 'emailContent', label: 'Upload konten baru', desc: 'Kirim email saat ada materi baru yang perlu divalidasi' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-start justify-between rounded-xl bg-[#F7F2E7] p-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications((previous) => ({ ...previous, [item.key]: !previous[item.key] }))}
                                                    className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${notifications[item.key] ? 'bg-[#691D1B]' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${notifications[item.key] ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                        <Save className="h-4 w-4" />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                                <div className="border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                                    <h3 className="flex items-center gap-2 font-bold text-white">
                                        <CreditCard className="h-5 w-5" />
                                        Konfigurasi Pembayaran
                                    </h3>
                                </div>
                                <div className="space-y-5 p-6">
                                    <div className="rounded-xl border border-[#FFE882] bg-[#FFE88215] p-4">
                                        <p className="text-sm font-semibold text-[#691D1B]">Payment Gateway Aktif: Midtrans</p>
                                        <p className="mt-1 text-xs text-gray-600">Mode: Sandbox (Testing)</p>
                                    </div>
                                    {['Merchant ID', 'Client Key', 'Server Key'].map((field) => (
                                        <div key={field}>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">{field}</label>
                                            <input type="text" placeholder={`Masukkan ${field}`} className="w-full rounded-lg border-2 border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm focus:border-[#691D1B] focus:outline-none" />
                                        </div>
                                    ))}
                                    <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                        <Save className="h-4 w-4" />
                                        Simpan Konfigurasi
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                                <div className="border-b border-[#F7F2E7] p-5" style={{ background: '#691D1B' }}>
                                    <h3 className="flex items-center gap-2 font-bold text-white">
                                        <Shield className="h-5 w-5" />
                                        Pengaturan Keamanan
                                    </h3>
                                </div>
                                <div className="space-y-4 p-6">
                                    {[
                                        { label: 'Aktifkan 2FA untuk Admin', desc: 'Wajibkan verifikasi dua langkah untuk semua akun admin' },
                                        { label: 'Session Timeout', desc: 'Otomatis logout setelah 30 menit tidak aktif' },
                                        { label: 'Log Aktivitas', desc: 'Rekam semua aktivitas pengguna untuk audit trail' },
                                        { label: 'Blokir IP Mencurigakan', desc: 'Otomatis blokir IP yang terdeteksi aktivitas mencurigakan' },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-start justify-between rounded-xl bg-[#F7F2E7] p-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                                <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                            <button className="relative h-6 w-11 flex-shrink-0 rounded-full bg-[#691D1B]">
                                                <span className="absolute left-6 top-1 h-4 w-4 rounded-full bg-white" />
                                            </button>
                                        </div>
                                    ))}
                                    <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A1412]" style={{ background: '#691D1B' }}>
                                        <Save className="h-4 w-4" />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
