import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import LoginPanel from '@/Components/LoginPanel';
import BricsLogo from '@/Components/BricsLogo';
import {
  ArrowLeft,
  Eye,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';

export default function LoginSiswa() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
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
      <Head title="Masuk - Siswa" />

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
                <UserRound className="w-6 h-6 text-[#691D1B]" />
              </div>

              <div>
                <p
                  className="text-xs text-gray-500 uppercase tracking-widest"
                  style={{ fontWeight: 700 }}
                >
                  Masuk sebagai
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
              Masuk menggunakan email dan password siswa untuk melanjutkan pembelian paket dan mengakses dashboard pembelajaran BRICS Education.
            </p>

            <form onSubmit={submit} className="space-y-5">
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
                    className="w-full pl-12 pr-12 py-3 bg-[#FDFCF8] border-2 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: errors.password ? '#dc2626' : '#D8D7BE',
                    }}
                    autoComplete="current-password"
                  />

                  <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                {errors.password && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="rounded border-[#D8D7BE]"
                  />
                  Ingat saya
                </label>

                <Link
                  href={route('password.request')}
                  className="text-sm hover:underline"
                  style={{
                    color: '#691D1B',
                    fontWeight: 700,
                  }}
                >
                  Lupa password?
                </Link>
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
                {processing ? 'Memproses...' : 'Masuk ke Dashboard'}
              </button>
            </form>

            <div
              className="h-px my-7"
              style={{ background: '#D8D7BE' }}
            />

            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link
                href={route('register')}
                style={{
                  color: '#691D1B',
                  fontWeight: 800,
                }}
                className="hover:underline"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            Dengan masuk, Anda menyetujui{' '}
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
