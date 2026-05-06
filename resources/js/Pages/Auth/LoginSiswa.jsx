import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LoginPanel from '@/Components/LoginPanel';
import BricsLogo from '@/Components/BricsLogo';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function LoginSiswa() {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--brics-cream)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Head title="Masuk - Siswa" />
      <LoginPanel />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <BricsLogo size="md" />
          </div>


          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brics-yellow)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2L12 22" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest" style={{ fontWeight: 600 }}>Masuk sebagai</p>
              <h1 className="text-xl text-gray-900" style={{ fontWeight: 800 }}>Siswa</h1>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Akun Siswa menggunakan <span style={{ fontWeight: 600, color: 'var(--brics-maroon)' }}>Google</span> untuk autentikasi yang aman dan mudah. Tidak perlu mengingat kata sandi tambahan.
          </p>

          <a href="#" className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 rounded-xl transition-all mb-4 inline-flex" style={{ fontWeight: 600, borderColor: 'var(--brics-beige)', color: 'var(--brics-maroon)' }} onMouseEnter={e => { e.target.style.borderColor = 'var(--brics-maroon)'; e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.target.style.borderColor = 'var(--brics-beige)'; e.target.style.boxShadow = 'none'; }}>
            <GoogleIcon />
            <span className="text-gray-700">Masuk dengan Google</span>
          </a>

          <p className="text-center text-xs text-gray-400 mb-8 leading-relaxed">
            Dengan masuk, Anda menyetujui{' '}
            <a href="#" style={{ color: 'var(--brics-maroon)' }} className="hover:underline">Syarat & Ketentuan</a>
            {' '}dan{' '}
            <a href="#" style={{ color: 'var(--brics-maroon)' }} className="hover:underline">Kebijakan Privasi</a> kami.
          </p>

          <div className="h-px mb-8" style={{ background: 'var(--brics-beige)' }} />

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href={route('register')} style={{ color: 'var(--brics-maroon)', fontWeight: 700 }} className="hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
