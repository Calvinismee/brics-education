import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import BricsLogo from '@/Components/BricsLogo';
import LoginPanel from '@/Components/LoginPanel';

const roleLabels = {
  admin: 'Admin',
  tutor: 'Tutor',
  student: 'Siswa',
};

export default function PasswordResetShell({
  children,
  description,
  loginUrl,
  role = 'student',
  title,
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--brics-cream)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Head title={`${title} - ${roleLabels[role] || roleLabels.student}`} />
      <LoginPanel />

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BricsLogo size="sm" />
          </div>

          <Link
            href={loginUrl}
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#691D1B] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke login {roleLabels[role] || roleLabels.student}
          </Link>

          <section className="rounded-2xl border border-[#D8D7BE] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE882]">
                <KeyRound className="h-6 w-6 text-[#691D1B]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Akun {roleLabels[role] || roleLabels.student}
                </p>
                <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
              </div>
            </div>

            <p className="mb-6 text-sm leading-6 text-gray-600">{description}</p>
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
