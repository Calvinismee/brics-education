import React from 'react';
import { useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import PasswordResetShell from '@/Components/PasswordResetShell';
import { StagedLoadingContent } from '@/Components/ui/LoadingStates';

export default function ForgotPassword({ loginUrl, role = 'student', status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    role,
  });

  const submit = (event) => {
    event.preventDefault();
    post(route('password.email'));
  };

  return (
    <PasswordResetShell
      description="Masukkan email akun Anda. Kami akan mengirimkan tautan untuk membuat password baru."
      loginUrl={loginUrl}
      role={role}
      title="Lupa Password"
    >
      {status && (
        <p className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
          {status}
        </p>
      )}

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
              placeholder="contoh@email.com"
              autoComplete="email"
              autoFocus
              required
              className="w-full rounded-xl border-2 bg-[#FDFCF8] py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-[#691D1B]"
              style={{ borderColor: errors.email ? '#dc2626' : '#D8D7BE' }}
            />
          </div>
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full rounded-xl bg-[#691D1B] px-4 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-[#4A1412] disabled:opacity-70"
        >
          <StagedLoadingContent loading={processing} loadingLabel="Mengirim tautan..." longLoadingLabel="Masih mengirim...">
            Kirim Tautan Reset
          </StagedLoadingContent>
        </button>
      </form>
    </PasswordResetShell>
  );
}
