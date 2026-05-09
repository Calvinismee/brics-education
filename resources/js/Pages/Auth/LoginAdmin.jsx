import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserCog, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import LoginPanel from '@/Components/LoginPanel';
import BricsLogo from '@/Components/BricsLogo';
import { LoadingButton } from '@/Components/ui/LoadingStates';
import { toast } from 'sonner';
import { useState } from 'react';

export default function LoginAdmin() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    post(route('login.admin.store'), {
      onFinish: () => reset('password'),
      onError: (formErrors) => {
        toast.error(Object.values(formErrors)[0] || 'Login admin gagal.');
      },
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--brics-cream)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Head title="Masuk - Admin" />
      <LoginPanel />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <BricsLogo size="md" />
          </div>



          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brics-maroon)' }}>
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest" style={{ fontWeight: 600 }}>Masuk sebagai</p>
              <h1 className="text-xl text-gray-900" style={{ fontWeight: 800 }}>Admin</h1>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl mb-6" style={{ background: 'rgba(255, 232, 130, 0.15)', border: '1px solid var(--brics-yellow)' }}>
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--brics-maroon)' }} />
            <p className="text-xs text-gray-600 leading-relaxed">Halaman ini hanya untuk administrator sistem. Akses tidak sah akan dicatat dan ditindaklanjuti.</p>
          </div>

          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Username / Email</label>
              <input type="text" placeholder="admin@bricsedu.id" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl bg-white focus:outline-none text-sm transition-colors" style={{ borderColor: 'var(--brics-beige)' }} />
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Kata Sandi</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Masukkan kata sandi" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white focus:outline-none text-sm transition-colors" style={{ borderColor: 'var(--brics-beige)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: 'var(--brics-maroon)' }} />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <a href="#" className="text-sm hover:underline" style={{ fontWeight: 600, color: 'var(--brics-maroon)' }}>Lupa kata sandi?</a>
            </div>

            {processing ? (
              <LoadingButton label="Memproses..." variant="primary" />
            ) : (
              <button type="submit" className="w-full py-3.5 rounded-xl text-white hover:opacity-90 transition-all" style={{ background: 'var(--brics-maroon)', fontWeight: 700 }}>
                Masuk sebagai Admin
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
