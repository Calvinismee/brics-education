import { Head, Link } from '@inertiajs/react';
import {
  ArrowLeft,
  LockKeyhole,
  Shield,
  User,
} from 'lucide-react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#F7F2E7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <Head title="Edit Profil" />

      <header className="bg-white border-b border-[#D8D7BE] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl border border-[#D8D7BE] flex items-center justify-center text-[#691D1B] hover:bg-[#F7F2E7] transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <p className="text-xs tracking-[0.35em] text-[#A56D6B] mb-1">
                SISWA WORKSPACE
              </p>
              <h1
                className="text-2xl text-gray-900"
                style={{ fontWeight: 900 }}
              >
                Edit Profil
              </h1>
              <p className="text-sm text-gray-500">
                Kelola informasi akun dan password siswa.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-5 py-3 rounded-xl text-white hover:bg-[#4A1412] transition-colors"
            style={{
              background: '#691D1B',
              fontWeight: 800,
            }}
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <aside className="space-y-5">
            <div
              className="rounded-2xl p-6 text-white shadow-sm"
              style={{ background: '#741A18' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: '#FFE882',
                  color: '#691D1B',
                }}
              >
                <User className="w-7 h-7" />
              </div>

              <h2 className="text-xl mb-2" style={{ fontWeight: 900 }}>
                Profil Siswa
              </h2>

              <p className="text-sm text-white/70 leading-relaxed">
                Halaman ini digunakan siswa untuk memperbarui nama, email, dan password akun.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: '#F8EDED',
                    color: '#691D1B',
                  }}
                >
                  <Shield className="w-5 h-5" />
                </div>

                <div>
                  <h3
                    className="text-[#691D1B] mb-1"
                    style={{ fontWeight: 900 }}
                  >
                    Keamanan Akun
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Gunakan password yang kuat dan jangan bagikan akses akun kepada orang lain.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F7F2E7] flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: '#F8EDED',
                    color: '#691D1B',
                  }}
                >
                  <User className="w-5 h-5" />
                </div>

                <div>
                  <h2
                    className="text-xl text-[#691D1B]"
                    style={{ fontWeight: 900 }}
                  >
                    Informasi Profil
                  </h2>
                  <p className="text-sm text-gray-500">
                    Perbarui nama dan email akun siswa.
                  </p>
                </div>
              </div>

              <div className="p-6">
                <UpdateProfileInformationForm
                  mustVerifyEmail={mustVerifyEmail}
                  status={status}
                  className="max-w-2xl"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F7F2E7] flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: '#F8EDED',
                    color: '#691D1B',
                  }}
                >
                  <LockKeyhole className="w-5 h-5" />
                </div>

                <div>
                  <h2
                    className="text-xl text-[#691D1B]"
                    style={{ fontWeight: 900 }}
                  >
                    Ubah Password
                  </h2>
                  <p className="text-sm text-gray-500">
                    Perbarui password akun untuk menjaga keamanan.
                  </p>
                </div>
              </div>

              <div className="p-6">
                <UpdatePasswordForm className="max-w-2xl" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#D8D7BE] bg-[#FFF9D9] p-5">
              <p className="text-sm text-[#691D1B] leading-relaxed">
                Catatan: fitur hapus akun tidak ditampilkan pada halaman siswa karena tidak termasuk scope utama dashboard siswa. Jika dibutuhkan, admin dapat mengelola data pengguna melalui panel admin.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}