import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  Home,
  Lock,
  LogOut,
  Monitor,
  Pencil,
  Settings as SettingsIcon,
  Shield,
  Star,
  Upload,
  User,
  Users,
} from "lucide-react";
import { BricsLogo } from "@/Components/BricsLogo";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";

const fallbackTutorClasses = [
  { id: 0, name: "Penalaran Umum", students: 24, progress: 75 },
  { id: 1, name: "Pengetahuan dan Pemahaman Umum", students: 18, progress: 60 },
  { id: 2, name: "Pemahaman Bacaan dan Menulis", students: 22, progress: 68 },
  { id: 3, name: "Pengetahuan Kuantitatif", students: 20, progress: 72 },
];

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? "#691D1B" : "#D8D7BE" }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: checked ? 24 : 4 }}
      />
    </button>
  );
}

export function TutorSettings({ user = null, tutorClasses: serverTutorClasses = [], settings = {} }) {
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorClasses = Array.isArray(serverTutorClasses) && serverTutorClasses.length > 0 ? serverTutorClasses : fallbackTutorClasses;
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [prefs, setPrefs] = useState({
    materialReview: settings.notifications?.materialReview ?? true,
    classReminder: settings.notifications?.classReminder ?? true,
    studentQuestion: settings.notifications?.studentQuestion ?? true,
    weeklyReport: settings.notifications?.weeklyReport ?? false,
    autoPublishApprovedMaterial: settings.teaching?.autoPublishApprovedMaterial ?? true,
    showProgressWarnings: settings.teaching?.showProgressWarnings ?? true,
    showEmailToStudents: settings.privacy?.showEmailToStudents ?? false,
    showRating: settings.privacy?.showRating ?? true,
  });
  const [theme, setTheme] = useState(settings.appearance?.theme ?? "system");

  const setPref = (key, value) => {
    setRecentlySaved(false);
    setPrefs((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    router.patch(
      "/tutor/settings",
      {
        notifications: {
          materialReview: prefs.materialReview,
          classReminder: prefs.classReminder,
          studentQuestion: prefs.studentQuestion,
          weeklyReport: prefs.weeklyReport,
        },
        teaching: {
          defaultSessionDuration: 90,
          autoPublishApprovedMaterial: prefs.autoPublishApprovedMaterial,
          showProgressWarnings: prefs.showProgressWarnings,
        },
        privacy: {
          showEmailToStudents: prefs.showEmailToStudents,
          showRating: prefs.showRating,
        },
        appearance: {
          theme,
        },
      },
      {
        preserveScroll: true,
        onSuccess: () => setRecentlySaved(true),
      }
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="settings" onEditProfile={() => setShowProfileModal(true)} />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="settings"
        onEditProfile={() => setShowProfileModal(true)}
      />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 700 }}>Settings</h2>
                <p className="truncate text-xs text-gray-400">Preferensi tutor dan pengalaman mengajar</p>
              </div>
            </div>
            <div className="flex-shrink-0"><TutorNotificationBell /></div>
          </div>
        </header>

        <div className="px-4 py-5 sm:p-6 space-y-5 sm:space-y-6">
          <section className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden">
            <div className="p-5 border-b border-[#F7F2E7] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#691D1B15", color: "#691D1B" }}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Notifikasi</h3>
                <p className="text-xs text-gray-400">Atur peringatan yang masuk ke dashboard dan email</p>
              </div>
            </div>
            <div className="divide-y divide-[#F7F2E7]">
              {[
                ["materialReview", "Review materi", "Saat materi disetujui atau ditolak admin"],
                ["classReminder", "Pengingat kelas", "Sebelum live class atau sesi konsultasi dimulai"],
                ["studentQuestion", "Pertanyaan siswa", "Saat siswa mengirim pertanyaan baru"],
                ["weeklyReport", "Laporan mingguan", "Ringkasan performa kelas setiap minggu"],
              ].map(([key, title, description]) => (
                <div key={key} className="p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                  </div>
                  <Toggle checked={prefs[key]} onChange={(value) => setPref(key, value)} />
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden">
              <div className="p-5 border-b border-[#F7F2E7] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#691D1B15", color: "#691D1B" }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Preferensi Mengajar</h3>
                  <p className="text-xs text-gray-400">Default sesi dan alur materi</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Auto-publish materi approved</p>
                    <p className="text-xs text-gray-400">Materi langsung tampil ke siswa setelah disetujui</p>
                  </div>
                  <Toggle checked={prefs.autoPublishApprovedMaterial} onChange={(value) => setPref("autoPublishApprovedMaterial", value)} />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Tampilkan peringatan progres</p>
                    <p className="text-xs text-gray-400">Sorot siswa dengan progres rendah</p>
                  </div>
                  <Toggle checked={prefs.showProgressWarnings} onChange={(value) => setPref("showProgressWarnings", value)} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden">
              <div className="p-5 border-b border-[#F7F2E7] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#691D1B15", color: "#691D1B" }}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Privasi & Keamanan</h3>
                  <p className="text-xs text-gray-400">Kontrol visibilitas profil dan akses akun</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Tampilkan email ke siswa</p>
                    <p className="text-xs text-gray-400">Siswa dapat melihat email tutor di halaman kelas</p>
                  </div>
                  <Toggle checked={prefs.showEmailToStudents} onChange={(value) => setPref("showEmailToStudents", value)} />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Tampilkan rating tutor</p>
                    <p className="text-xs text-gray-400">Rating terlihat pada profil tutor</p>
                  </div>
                  <Toggle checked={prefs.showRating} onChange={(value) => setPref("showRating", value)} />
                </div>
                <button
                  type="button"
                  onClick={() => router.visit("/tutor/password")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8D7BE] text-sm text-gray-700 hover:bg-[#F7F2E7] transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Ubah Password
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden">
            <div className="p-5 border-b border-[#F7F2E7] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#691D1B15", color: "#691D1B" }}>
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Tampilan</h3>
                <p className="text-xs text-gray-400">Preferensi visual dashboard tutor</p>
              </div>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {["system", "light", "dark"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setRecentlySaved(false);
                    setTheme(item);
                  }}
                  className="px-4 py-2 rounded-xl text-sm capitalize transition-colors"
                  style={theme === item ? { background: "#691D1B", color: "#FFE882", fontWeight: 700 } : { background: "#F7F2E7", color: "#4b5563", border: "1px solid #D8D7BE" }}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <div className="sticky bottom-4 z-10 bg-white rounded-2xl border border-[#D8D7BE] shadow-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                {recentlySaved ? "Perubahan sudah disimpan" : "Perubahan belum disimpan"}
              </p>
              <p className="text-xs text-gray-400">
                Toggle baru akan berlaku di halaman lain setelah disimpan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-sm transition-all hover:opacity-90"
              style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>

      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}

export default TutorSettings;
