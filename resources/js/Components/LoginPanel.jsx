import React from 'react';
import BricsLogo from './BricsLogo';

const stats = [
  { value: '15.000+', label: 'Siswa Aktif' },
  { value: '94%', label: 'Tingkat Kelulusan' },
  { value: '200+', label: 'Tutor Ahli' },
  { value: '500+', label: 'Materi Kursus' },
];

export function LoginPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden"
      style={{ background: 'var(--brics-maroon)' }}
    >
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'var(--brics-yellow)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'var(--brics-yellow)', transform: 'translate(-30%, 30%)' }}
      />
      <div className="absolute right-8 top-8 z-10 inline-flex items-center justify-center rounded-3xl bg-[#FFFDF4]/95 p-5 shadow-2xl backdrop-blur-md">
        <BricsLogo size="lg" />
      </div>

      <div className="relative z-10">
        <h2 className="text-4xl text-white mb-4" style={{ fontWeight: 800, lineHeight: 1.2 }}>
          Selamat Datang!
        </h2>
        <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--brics-beige)' }}>
          Masuk ke akun Anda dan lanjutkan perjalanan belajar yang menakjubkan bersama BRICS Education.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl" style={{ fontWeight: 800, color: 'var(--brics-yellow)' }}>{s.value}</div>
              <div className="text-sm" style={{ color: 'var(--brics-beige)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-sm" style={{ color: 'var(--brics-beige)' }}>© 2025 BRICS Education. All rights reserved.</div>
    </div>
  );
}

export default LoginPanel;
