import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import LoginPanel from '@/Components/LoginPanel';
import BricsLogo from '@/Components/BricsLogo';
import { StagedLoadingContent } from '@/Components/ui/LoadingStates';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export default function LoginSiswa({ googleClientId }) {
  const [showPassword, setShowPassword] = useState(false);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const [googleProcessing, setGoogleProcessing] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const googleButtonRef = useRef(null);
  const googleButtonRendered = useRef(false);

  const { data, setData, post, processing, errors: loginErrors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleGoogleCredential = (response) => {
    const credential = response?.credential;

    if (! credential) {
      setGoogleError('Akun Google belum dipilih.');
      return;
    }

    setGoogleError('');
    setGoogleProcessing(true);

    router.post(
      route('auth.google.credential'),
      { credential },
      {
        preserveScroll: true,
        onError: (incomingErrors) => {
          setGoogleError(
            incomingErrors.google
              || incomingErrors.credential
              || 'Login Google gagal. Silakan coba lagi.'
          );
        },
        onFinish: () => setGoogleProcessing(false),
      }
    );
  };

  useEffect(() => {
    if (! googleClientId) return undefined;

    if (window.google?.accounts?.id) {
      setGoogleScriptReady(true);
      return undefined;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);
    const onLoad = () => setGoogleScriptReady(true);
    const onError = () => setGoogleError('Gagal memuat modal login Google. Silakan muat ulang halaman.');

    if (existingScript) {
      existingScript.addEventListener('load', onLoad);
      existingScript.addEventListener('error', onError);

      return () => {
        existingScript.removeEventListener('load', onLoad);
        existingScript.removeEventListener('error', onError);
      };
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId]);

  useEffect(() => {
    if (
      ! googleClientId
      || ! googleScriptReady
      || ! googleButtonRef.current
      || googleButtonRendered.current
      || ! window.google?.accounts?.id
    ) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
    });

    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      locale: 'id',
      width: Math.min(360, googleButtonRef.current.offsetWidth || 360),
    });
    googleButtonRendered.current = true;
    setGoogleButtonReady(true);
  }, [googleClientId, googleScriptReady]);

  const submit = (e) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  const googleDisplayError = googleError || loginErrors.google;

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

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <BricsLogo size="sm" />
          </div>

          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#D8D7BE] bg-white px-4 py-2.5 text-sm text-[#691D1B] shadow-sm transition-colors hover:bg-[#F7F2E7]"
            style={{ fontWeight: 700 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Landing Page
          </Link>

          <div className="bg-white border border-[#D8D7BE] rounded-3xl shadow-sm p-5 sm:p-7">
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
                  Selamat datang di
                </p>
                <h1
                  className="text-xl text-gray-900 sm:text-2xl"
                  style={{ fontWeight: 900 }}
                >
                  Brics Education
                </h1>
              </div>
            </div>


            {googleDisplayError && (
              <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {googleDisplayError}
              </p>
            )}

            {googleClientId ? (
              <div className="relative mb-6">
                <div
                  ref={googleButtonRef}
                  className={`flex w-full justify-center ${googleButtonReady ? '' : 'absolute inset-0 opacity-0 pointer-events-none'}`}
                />
                {! googleButtonReady && (
                  <button
                    type="button"
                    disabled
                    className="flex min-h-[40px] w-full items-center justify-center gap-3 rounded border border-[#DADCE0] bg-white px-4 py-2 text-sm text-[#3C4043]"
                  >
                    <span className="text-lg font-bold text-[#4285F4]">G</span>
                    Sign in with Google
                  </button>
                )}
                {googleProcessing && (
                  <div className="absolute inset-0 cursor-wait rounded bg-transparent" />
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-[#D8D7BE] bg-gray-50 px-4 py-3 text-sm text-gray-400"
                style={{ fontWeight: 800 }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-sm text-gray-400">
                  Google
                </span>
                Login Google belum dikonfigurasi
              </button>
            )}

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#D8D7BE]" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                atau
              </span>
              <div className="h-px flex-1 bg-[#D8D7BE]" />
            </div>

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
                      borderColor: loginErrors.email ? '#dc2626' : '#D8D7BE',
                    }}
                    autoComplete="username"
                  />
                </div>

                {loginErrors.email && (
                  <p className="text-sm text-red-600 mt-2">
                    {loginErrors.email}
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
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-12 pr-12 py-3 bg-[#FDFCF8] border-2 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{
                      borderColor: loginErrors.password ? '#dc2626' : '#D8D7BE',
                    }}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
                  >
                    {!showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {loginErrors.password && (
                  <p className="text-sm text-red-600 mt-2">
                    {loginErrors.password}
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
                <StagedLoadingContent loading={processing} loadingLabel="Memproses..." longLoadingLabel="Masih memproses...">
                  Masuk ke Dashboard
                </StagedLoadingContent>
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
