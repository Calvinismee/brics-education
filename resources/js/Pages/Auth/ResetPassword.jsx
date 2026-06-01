import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import PasswordResetShell from '@/Components/PasswordResetShell';
import { StagedLoadingContent } from '@/Components/ui/LoadingStates';

export default function ResetPassword({ email, loginUrl, role = 'student', token }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    token,
    email,
    password: '',
    password_confirmation: '',
  });

  const submit = (event) => {
    event.preventDefault();
    post(route('password.store'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <PasswordResetShell
      description="Buat password baru untuk akun Anda. Gunakan minimal delapan karakter agar akun tetap aman."
      loginUrl={loginUrl}
      role={role}
      title="Buat Password Baru"
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-gray-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#691D1B]" />
            <input
              id="email"
              type="email"
              value={data.email}
              onChange={(event) => setData('email', event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border-2 bg-[#FDFCF8] py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-[#691D1B]"
              style={{ borderColor: errors.email ? '#dc2626' : '#D8D7BE' }}
            />
          </div>
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
        </div>

        <PasswordInput
          autoComplete="new-password"
          error={errors.password}
          id="password"
          label="Password Baru"
          onChange={(value) => setData('password', value)}
          onToggle={() => setShowPassword((current) => !current)}
          show={showPassword}
          value={data.password}
        />

        <PasswordInput
          autoComplete="new-password"
          id="password_confirmation"
          label="Konfirmasi Password Baru"
          onChange={(value) => setData('password_confirmation', value)}
          onToggle={() => setShowConfirmation((current) => !current)}
          show={showConfirmation}
          value={data.password_confirmation}
        />

        <button
          type="submit"
          disabled={processing}
          className="w-full rounded-xl bg-[#691D1B] px-4 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-[#4A1412] disabled:opacity-70"
        >
          <StagedLoadingContent loading={processing} loadingLabel="Menyimpan password..." longLoadingLabel="Masih menyimpan...">
            Simpan Password Baru
          </StagedLoadingContent>
        </button>
      </form>
    </PasswordResetShell>
  );
}

function PasswordInput({ autoComplete, error, id, label, onChange, onToggle, show, value }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#691D1B]" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={8}
          required
          className="w-full rounded-xl border-2 bg-[#FDFCF8] py-3 pl-12 pr-12 text-sm outline-none transition-colors focus:border-[#691D1B]"
          style={{ borderColor: error ? '#dc2626' : '#D8D7BE' }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          title={show ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
