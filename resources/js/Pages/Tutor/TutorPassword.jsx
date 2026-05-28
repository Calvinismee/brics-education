import { Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";
import { StagedLoadingContent } from "@/Components/ui/LoadingStates";

export default function TutorPassword({ user = null, tutorClasses = [] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visible, setVisible] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });
  const form = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const toggleVisible = (key) => {
    setVisible((current) => ({ ...current, [key]: !current[key] }));
  };

  const submit = (event) => {
    event.preventDefault();

    form.patch("/tutor/password", {
      preserveScroll: true,
      onSuccess: () => form.reset(),
    });
  };

  const PasswordInput = ({ field, label, placeholder, autoComplete }) => (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="relative">
        <input
          type={visible[field] ? "text" : "password"}
          value={form.data[field]}
          onChange={(event) => form.setData(field, event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          disabled={form.processing}
          className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 pr-12 text-sm outline-none focus:border-[#691D1B]"
        />
        <button
          type="button"
          onClick={() => toggleVisible(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-white hover:text-[#691D1B]"
          aria-label={visible[field] ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {form.errors[field] && <p className="text-xs text-red-500">{form.errors[field]}</p>}
    </label>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="settings" />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="settings"
      />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Link href="/tutor/settings" className="p-2 rounded-lg hover:bg-[#F7F2E7] text-[#691D1B] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 800 }}>Ubah Password Tutor</h2>
                <p className="truncate text-xs text-gray-400">Perbarui kata sandi akun tutor Anda</p>
              </div>
            </div>
            <div className="flex-shrink-0"><TutorNotificationBell /></div>
          </div>
        </header>

        <div className="px-4 py-5 sm:p-6">
          <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
            <div className="border-b border-[#F7F2E7] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-gray-900" style={{ fontWeight: 800 }}>Keamanan Akun</h3>
                  <p className="text-sm text-gray-500">Password akan diperbarui untuk akun tutor yang sedang login.</p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5 p-5">
              <PasswordInput field="current_password" label="Password Saat Ini" placeholder="Masukkan password lama" autoComplete="current-password" />
              <PasswordInput field="password" label="Password Baru" placeholder="Minimal 8 karakter" autoComplete="new-password" />
              <PasswordInput field="password_confirmation" label="Konfirmasi Password Baru" placeholder="Ulangi password baru" autoComplete="new-password" />

              {form.recentlySuccessful && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  <ShieldCheck className="h-4 w-4" />
                  Password tutor berhasil diperbarui.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/tutor/settings"
                  className="inline-flex items-center justify-center rounded-xl border border-[#D8D7BE] px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-[#F7F2E7]"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={form.processing}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm text-white hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "#691D1B", fontWeight: 800 }}
                >
                  <StagedLoadingContent loading={form.processing} loadingLabel="Menyimpan..." longLoadingLabel="Masih menyimpan password...">
                    Simpan Password
                  </StagedLoadingContent>
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

    </div>
  );
}
