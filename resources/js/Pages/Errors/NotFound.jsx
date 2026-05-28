import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Home, LayoutDashboard, Search } from 'lucide-react';
import BricsLogo from '@/Components/BricsLogo';

export default function NotFound() {
  const { auth } = usePage().props;
  const user = auth?.user;

  return (
    <main
      className="min-h-screen bg-[#F7F2E7] px-6 py-8"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Head title="Halaman Tidak Ditemukan" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <BricsLogo size="md" />
            <span className="hidden text-sm font-extrabold uppercase tracking-[0.28em] text-[#691D1B] sm:inline">
              Brics Education
            </span>
          </Link>

          <Link
            href={user ? '/dashboard' : '/'}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D8D7BE] bg-white px-4 text-sm font-bold text-[#691D1B] transition hover:bg-[#fff9df]"
          >
            {user ? <LayoutDashboard className="h-4 w-4" /> : <Home className="h-4 w-4" />}
            {user ? 'Dashboard' : 'Beranda'}
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D8D7BE] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#691D1B]">
              <Search className="h-4 w-4" />
              Error 404
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight text-gray-950 sm:text-5xl">
              Halaman yang kamu cari tidak ditemukan.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
              Link mungkin sudah berubah, paket atau course tidak tersedia, atau alamat halaman yang dibuka kurang tepat.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#691D1B] px-5 text-sm font-extrabold text-white transition hover:bg-[#4A1412]"
              >
                <Home className="h-4 w-4" />
                Kembali ke Beranda
              </Link>

              <Link
                href="/#katalog"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#D8D7BE] bg-white px-5 text-sm font-extrabold text-[#691D1B] transition hover:bg-[#fff9df]"
              >
                <BookOpen className="h-4 w-4" />
                Lihat Paket Belajar
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#D8D7BE] bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-[#691D1B] p-6 text-white">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#FFE882]">
                  Not Found
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                  404
                </span>
              </div>

              <div className="mb-8 text-8xl font-black leading-none text-[#FFE882]">
                404
              </div>

              <p className="text-sm leading-6 text-white/75">
                Coba kembali ke katalog paket atau dashboard untuk melanjutkan belajar di BRICS Education.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#D8D7BE] text-sm font-bold text-gray-700 transition hover:bg-[#F7F2E7]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke halaman sebelumnya
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
