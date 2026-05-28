import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import LoginPanel from '@/Components/LoginPanel';
import BricsLogo from '@/Components/BricsLogo';
import { StagedLoadingContent } from '@/Components/ui/LoadingStates';
import {
  ArrowLeft,
  LockKeyhole,
  Mail,
  UserRound,
  UserPlus,
} from 'lucide-react';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();

    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: '#F7F2E7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <Head title="Daftar - Siswa" />

      <LoginPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <BricsLogo size="md" />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#691D1B] hover:underline mb-6"
            style={{ fontWeight: 700 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <div className="bg-white border border-[#D8D7BE] rounded-3xl shadow-sm p-7">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: '#FFE882' }}
              >
                <UserPlus className="w-6 h-6 text-[#691D1B]" />
              </div>

              <div>
                <p
                  className="text-xs text-gray-500 uppercase tracking-widest"
                  style={{ fontWeight: 700 }}
                >
                  Daftar sebagai
                </p>
                <h1
                  className="text-2xl text-gray-900"
                  style={{ fontWeight: 900 }}
                >
                  Siswa
                </h1>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              Buat akun siswa BRICS Education untuk membeli paket, mengakses dashboard, melihat jadwal, dan mengikuti materi pembelajaran.
            </p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-gray-700 mb-2"
                  style={{ fontWeight: 700 }}
                >
                  Nama Lengkap
                </label>

                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#691D1B]" />

                  <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-12 pr-4 py-3 bg-[#FDFCF8] border-2 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.name ? '#dc2626' : '#D8D7BE',
                    }}
                    autoComplete="name"
                  />
                </div>

                {errors.name && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-700 mb-2"
                  style={{ fontWeight: 700 }}
                >
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#691D1B]" />

                  <input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Masukkan email siswa"
                    className="w-full pl-12 pr-4 py-3 bg-[#FDFCF8] border-2 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.email ? '#dc2626' : '#D8D7BE',
                    }}
                    autoComplete="username"
                  />
                </div>

                {errors.email && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700 mb-2"
                  style={{ fontWeight: 700 }}
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#691D1B]" />

                  <input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-12 pr-4 py-3 bg-[#FDFCF8] border-2 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.password ? '#dc2626' : '#D8D7BE',
                    }}
                    autoComplete="new-password"
                  />
                </div>

                {errors.password && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm text-gray-700 mb-2"
                  style={{ fontWeight: 700 }}
                >
                  Konfirmasi Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#691D1B]" />

                  <input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                      setData('password_confirmation', e.target.value)
                    }
                    placeholder="Ulangi password"
                    className="w-full pl-12 pr-4 py-3 bg-[#FDFCF8] border-2 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.password_confirmation
                        ? '#dc2626'
                        : '#D8D7BE',
                    }}
                    autoComplete="new-password"
                  />
                </div>

                {errors.password_confirmation && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.password_confirmation}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 rounded-xl text-white transition-colors disabled:opacity-70 hover:bg-[#4A1412]"
                style={{
                  background: '#691D1B',
                  fontWeight: 800,
                }}
              >
                <StagedLoadingContent loading={processing} loadingLabel="Memproses..." longLoadingLabel="Masih memproses...">
                  Daftar Akun Siswa
                </StagedLoadingContent>
              </button>
            </form>

            <div
              className="h-px my-7"
              style={{ background: '#D8D7BE' }}
            />

            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link
                href={route('login')}
                style={{
                  color: '#691D1B',
                  fontWeight: 800,
                }}
                className="hover:underline"
              >
                Masuk Sekarang
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            Dengan mendaftar, Anda menyetujui{' '}
            <a
              href="#"
              style={{ color: '#691D1B' }}
              className="hover:underline"
            >
              Syarat & Ketentuan
            </a>{' '}
            dan{' '}
            <a
              href="#"
              style={{ color: '#691D1B' }}
              className="hover:underline"
            >
              Kebijakan Privasi
            </a>{' '}
            BRICS Education.
          </p>
        </div>
      </div>
    </div>
  );
}
