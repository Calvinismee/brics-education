import { router } from "@inertiajs/react";
import { useState } from "react";
import { Bell, BookOpen, Lock, Shield } from "lucide-react";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
      style={{ background: checked ? "#691D1B" : "#D8D7BE" }}
    >
      <span
        className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all"
        style={{ left: checked ? 24 : 4 }}
      />
    </button>
  );
}

export function TutorSettings({ user = null, tutorClasses = [], settings = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [prefs, setPrefs] = useState({
    classReminder: settings.notifications?.classReminder ?? true,
    showProgressWarnings: settings.teaching?.showProgressWarnings ?? true,
  });

  const setPref = (key, value) => {
    setRecentlySaved(false);
    setPrefs((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    router.patch(
      "/tutor/settings",
      {
        notifications: {
          classReminder: prefs.classReminder,
        },
        teaching: {
          showProgressWarnings: prefs.showProgressWarnings,
        },
      },
      {
        preserveScroll: true,
        onSuccess: () => setRecentlySaved(true),
      }
    );
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="settings" />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="settings"
      />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-10 border-b border-[#D8D7BE] bg-white px-4 py-3 shadow-sm sm:px-5 lg:px-6 lg:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 700 }}>Settings</h2>
                <p className="truncate text-xs text-gray-400">Preferensi monitoring dan keamanan akun</p>
              </div>
            </div>
            <div className="flex-shrink-0"><TutorNotificationBell /></div>
          </div>
        </header>

        <div className="space-y-5 px-4 py-5 sm:p-6">
          <section className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white">
            <div className="flex items-center gap-3 border-b border-[#F7F2E7] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Notifikasi</h3>
                <p className="text-xs text-gray-400">Atur pengingat yang dikirim ke panel tutor</p>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Pengingat kelas</p>
                <p className="mt-0.5 text-xs leading-5 text-gray-400">Kirim notifikasi 10 menit sebelum live class atau konsultasi dimulai.</p>
              </div>
              <Toggle checked={prefs.classReminder} onChange={(value) => setPref("classReminder", value)} />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white">
              <div className="flex items-center gap-3 border-b border-[#F7F2E7] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Monitoring Kelas</h3>
                  <p className="text-xs text-gray-400">Atur tampilan daftar siswa</p>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Tampilkan peringatan progres</p>
                  <p className="mt-0.5 text-xs leading-5 text-gray-400">Sorot siswa dengan progres rendah pada halaman Monitor Kelas.</p>
                </div>
                <Toggle checked={prefs.showProgressWarnings} onChange={(value) => setPref("showProgressWarnings", value)} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white">
              <div className="flex items-center gap-3 border-b border-[#F7F2E7] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Keamanan Akun</h3>
                  <p className="text-xs text-gray-400">Kelola password akun tutor</p>
                </div>
              </div>
              <div className="p-5">
                <button
                  type="button"
                  onClick={() => router.visit("/tutor/password")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8D7BE] px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[#F7F2E7]"
                >
                  <Lock className="h-4 w-4" />
                  Ubah Password
                </button>
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-10 flex flex-col justify-between gap-3 rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-lg sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                {recentlySaved ? "Perubahan sudah disimpan" : "Perubahan belum disimpan"}
              </p>
              <p className="text-xs text-gray-400">Preferensi baru berlaku setelah disimpan.</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl px-5 py-2.5 text-sm transition-all hover:opacity-90"
              style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TutorSettings;
