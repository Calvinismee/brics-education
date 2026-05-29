import { Link, router, usePage } from "@inertiajs/react";
import BricsLogo from "@/Components/BricsLogo";
import {
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  LogOut,
  Mail,
  Menu,
  Star,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

function LinkedInMark({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.28 8.05h4.44V23H.28V8.05Zm7.22 0h4.25v2.04h.06c.59-1.12 2.04-2.31 4.2-2.31 4.49 0 5.32 2.96 5.32 6.8V23h-4.43v-7.48c0-1.78-.03-4.08-2.48-4.08-2.49 0-2.87 1.94-2.87 3.95V23H7.5V8.05Z" />
    </svg>
  );
}

const tutors = [
  {
    name: "Bagas Dzakwan Nabihan",
    education: "Kedokteran, Universitas Airlangga",
    teaches: "Penalaran Umum",
    photo: "/images/tutors/bagas-dzakwan-nabihan.jpg",
    description:
      "Bagas membantu siswa membangun logika berpikir yang rapi, cepat, dan akurat. Pendekatannya tenang, runtut, dan cocok untuk latihan pola soal PU yang sering mengecoh.",
  },
  {
    name: "Raisa Gischa",
    education: "Sosiologi, Universitas Gadjah Mada",
    teaches: "Pengetahuan dan Pemahaman Umum",
    photo: "/images/tutors/raisa-gischa.jpg",
    description:
      "Raisa mengajar dengan gaya komunikatif dan dekat dengan konteks sehari-hari. Ia fokus membantu siswa memahami konsep umum, membaca informasi, dan menarik kesimpulan dengan percaya diri.",
  },
  {
    name: "Jihan Khaila Salsabil",
    education: "FTTM, Institut Teknologi Bandung",
    teaches: "Penalaran Kuantitatif",
    photo: "/images/tutors/jihan-khaila-salsabil.jpg",
    description:
      "Jihan membimbing siswa memecah soal kuantitatif menjadi langkah kecil yang mudah diikuti. Ia menekankan ketelitian, pola hitung, dan strategi memilih cara tercepat.",
  },
  {
    name: "Fairuz Febry Al Habsy",
    education: "FMIPA-M, Institut Teknologi Bandung",
    teaches: "Penalaran Kuantitatif",
    photo: "/images/tutors/fairuz-febry-al-habsy.jpg",
    description:
      "Habsy kuat dalam membangun dasar matematika dan penalaran angka. Sesi belajarnya dibuat sistematis supaya siswa tidak sekadar menghafal rumus, tapi tahu kapan menggunakannya.",
  },
  {
    name: "Shafiyah Nuril",
    education: "Teknologi Informasi, Universitas Gadjah Mada",
    teaches: "Penalaran Kuantitatif",
    photo: "/images/tutors/shafiyah-nuril.jpg",
    description:
      "Shafiyah menggabungkan logika analitis dan latihan bertahap untuk membantu siswa lebih nyaman dengan data, angka, dan pola. Ia cocok untuk siswa yang ingin belajar lebih terstruktur.",
  },
  {
    name: "Akira Neutriansyah",
    education: "FMIPA-I, Institut Teknologi Bandung",
    teaches: "Pemahaman Bacaan dan Menulis",
    photo: "/images/tutors/akira-neutriansyah.jpg",
    description:
      "Akira membantu siswa membaca teks dengan lebih tajam dan menulis jawaban dengan lebih presisi. Ia menekankan pemahaman gagasan utama, struktur kalimat, dan konteks bacaan.",
  },
  {
    name: "Yuan Banny Albyan",
    education: "Teknologi Informasi, Institut Teknologi Sepuluh November",
    teaches: "Pemahaman Bacaan dan Menulis",
    photo: "/images/tutors/yuan-banny-albyan.jpg",
    description:
      "Yuan mengajar PBM dengan pendekatan praktis: mengenali pola teks, menyaring informasi penting, dan menghindari jebakan pilihan jawaban. Kelasnya jelas dan langsung ke inti.",
  },
  {
    name: "Muhammad Farras Ahnaf Anaqi",
    education: "FTMD, Institut Teknologi Bandung",
    teaches: "Literasi Bahasa Indonesia",
    photo: "/images/tutors/muhammad-farras-ahnaf-anaqi.jpg",
    description:
      "Ahnaf mendampingi siswa memahami teks bahasa Indonesia secara kritis. Ia fokus pada argumentasi, hubungan antarparagraf, dan cara membaca soal literasi dengan efisien.",
  },
  {
    name: "Aliya Khairun Nisa",
    education: "Ilmu Komputer, Universitas Gadjah Mada",
    teaches: "Literasi Bahasa Indonesia",
    photo: "/images/tutors/aliya-khairun-nisa.jpg",
    description:
      "Aliya membuat materi literasi terasa lebih ringan tanpa kehilangan kedalaman. Ia membantu siswa meningkatkan akurasi membaca, memahami nuansa teks, dan menjawab dengan tenang.",
  },
  {
    name: "Amabel Maritza Maudina",
    education: "Akuntansi, Universitas Airlangga",
    teaches: "Literasi Bahasa Inggris",
    photo: "/images/tutors/amabel-maritza-maudina.jpg",
    description:
      "Amabel menguatkan kemampuan membaca bahasa Inggris melalui kosakata, konteks, dan strategi scanning. Ia membimbing siswa agar lebih cepat memahami isi teks panjang.",
  },
  {
    name: "Azalia Noverizqy Aqila Pramono",
    education: "Ilmu Komputer, Institut Pertanian Bogor",
    teaches: "Literasi Bahasa Inggris",
    photo: "/images/tutors/azalia-noverizqy-aqila-pramono.jpg",
    description:
      "Aqila membantu siswa menghadapi soal literasi Inggris dengan metode yang terukur. Fokusnya ada pada inferensi, detail penting, dan cara membaca pilihan jawaban secara kritis.",
  },
  {
    name: "Fayyaz Abimanyu",
    education: "SAPPK, Institut Teknologi Bandung",
    teaches: "Penalaran Matematika",
    photo: "/images/tutors/fayyaz-abimanyu.jpg",
    description:
      "Fayyaz membimbing siswa membangun intuisi matematika dari konsep dasar sampai soal campuran. Ia menekankan visualisasi masalah dan pemilihan strategi yang paling efektif.",
  },
  {
    name: "Muhammad Fadhlan Hamidy",
    education: "SAPPK, Institut Teknologi Bandung",
    teaches: "Penalaran Matematika",
    photo: "/images/tutors/muhammad-fadhlan-hamidy.jpg",
    description:
      "Fadhlan mengajar PM dengan alur yang sabar dan bertahap. Siswa diajak memahami pola, membangun model soal, dan memperkuat kebiasaan mengecek jawaban.",
  },
].map((tutor) => ({
  ...tutor,
  title: `Tutor ${tutor.teaches}`,
  educationList: [tutor.education],
  courses: [tutor.teaches],
  emailHref: "#",
  linkedinHref: "#",
}));

const navItems = [
  { label: "Beranda", to: "/" },
  { label: "Katalog", to: "/#katalog" },
  { label: "Tentang Kami", to: "/#tentang" },
  { label: "Tutor Kami", to: "/tutors" },
];

export default function Tutors() {
  const { auth } = usePage().props;
  const user = auth?.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = () => {
    router.post(route("logout"));
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <header className="sticky top-0 z-50 border-b border-[#D8D7BE] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex-shrink-0">
            <BricsLogo size="lg" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.to}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition-all hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                style={item.to === "/tutors" ? { fontWeight: 700, color: "#691D1B" } : { fontWeight: 500 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden rounded-xl border border-[#691D1B] px-4 py-2 text-sm text-[#691D1B] transition-colors hover:bg-[#F7F2E7] md:inline-flex"
                  style={{ fontWeight: 700 }}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-white transition-all hover:opacity-90 md:inline-flex"
                  style={{ background: "#691D1B", fontWeight: 700 }}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href={route("login")}
                className="hidden rounded-xl px-5 py-2 text-sm text-white transition-all hover:opacity-90 md:inline-flex"
                style={{ background: "#691D1B", fontWeight: 600 }}
              >
                Masuk
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8D7BE] text-[#691D1B] transition-colors hover:bg-[#F7F2E7] md:hidden"
              aria-label="Buka menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 md:hidden ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/35 transition-opacity ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={closeMobileMenu}
            aria-label="Tutup menu"
          />

          <div
            className={`absolute right-0 top-0 flex h-full w-[min(82vw,320px)] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#E7DFC9] px-5 py-4">
              <BricsLogo size="md" />
              <button
                type="button"
                onClick={closeMobileMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#691D1B] transition-colors hover:bg-[#F7F2E7]"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.to}
                  onSuccess={closeMobileMenu}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-gray-800 transition-colors hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                  style={item.to === "/tutors" ? { color: "#691D1B" } : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-[#E7DFC9] p-4">
              {user ? (
                <div className="grid gap-3">
                  <Link
                    href="/dashboard"
                    onSuccess={closeMobileMenu}
                    className="rounded-xl border border-[#691D1B] px-4 py-3 text-center text-sm font-semibold text-[#691D1B] transition-colors hover:bg-[#F7F2E7]"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: "#691D1B" }}
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={route("register")}
                    onSuccess={closeMobileMenu}
                    className="rounded-xl border border-[#691D1B] px-4 py-3 text-center text-sm font-semibold text-[#691D1B] transition-colors hover:bg-[#F7F2E7]"
                  >
                    Daftar
                  </Link>
                  <Link
                    href={route("login")}
                    onSuccess={closeMobileMenu}
                    className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: "#691D1B" }}
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:py-24" style={{ background: "#691D1B" }}>
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full opacity-10" style={{ background: "#FFE882", transform: "translate(20%, -40%)" }} />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full opacity-10" style={{ background: "#FFE882", transform: "translate(-20%, 40%)" }} />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <span
              className="mb-6 inline-block rounded-full px-4 py-1.5 text-xs"
              style={{ background: "#FFE882", color: "#691D1B", fontWeight: 700 }}
            >
              Tim Pengajar Kami
            </span>
            <h1 className="text-4xl leading-tight text-white sm:text-5xl" style={{ fontWeight: 800 }}>
              Belajar dari Para <span style={{ color: "#FFE882" }}>Tutor Terbaik</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#D8D7BE] sm:text-base">
              BRICS Education menghadirkan tutor dengan latar belakang akademik yang kuat untuk mendampingi persiapan UTBK secara terarah.
            </p>

            <div className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-3 sm:gap-6">
              {[
                { value: `${tutors.length}`, label: "Tutor UTBK" },
                { value: "7", label: "Subtes UTBK" },
                { value: "BRICS", label: "Education" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm sm:p-4">
                  <div className="text-xl text-[#FFE882] sm:text-2xl" style={{ fontWeight: 800 }}>{stat.value}</div>
                  <div className="mt-0.5 text-[11px] text-[#D8D7BE] sm:text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-col gap-10 lg:gap-12">
            {tutors.map((tutor, index) => (
              <article
                key={tutor.name}
                className={`flex flex-col overflow-hidden rounded-3xl border border-[#D8D7BE] bg-white shadow-sm transition-all hover:shadow-xl md:flex-row ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="relative min-h-[340px] shrink-0 overflow-hidden md:w-72">
                  <img
                    src={tutor.photo}
                    alt={tutor.name}
                    className="h-full min-h-[340px] w-full object-cover object-center"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(to top, rgba(105,29,27,0.9), transparent)" }}>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-[#FFE882] text-[#FFE882]" />
                      <span className="text-sm text-white" style={{ fontWeight: 700 }}>Tutor UTBK</span>
                      <span className="text-xs text-[#D8D7BE]">- {tutor.teaches}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5 sm:p-8">
                  <div>
                    <div className="mb-5">
                      <h2 className="mb-1 text-2xl text-gray-900" style={{ fontWeight: 800 }}>{tutor.name}</h2>
                      <p className="text-sm" style={{ color: "#691D1B", fontWeight: 600 }}>{tutor.title}</p>
                    </div>

                    <p className="mb-6 text-sm leading-relaxed text-gray-600">{tutor.description}</p>

                    <div className="mb-6">
                      <div className="mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" style={{ color: "#691D1B" }} />
                        <span className="text-xs uppercase tracking-widest text-gray-500" style={{ fontWeight: 700 }}>Latar Belakang Pendidikan</span>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {tutor.educationList.map((education) => (
                          <li key={education} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#691D1B" }} />
                            {education}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" style={{ color: "#691D1B" }} />
                        <span className="text-xs uppercase tracking-widest text-gray-500" style={{ fontWeight: 700 }}>Kursus yang Diajarkan</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tutor.courses.map((course) => (
                          <span
                            key={course}
                            className="rounded-lg px-3 py-1.5 text-xs"
                            style={{ background: "#F7F2E7", color: "#691D1B", fontWeight: 600, border: "1px solid #D8D7BE" }}
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4 border-t border-[#D8D7BE] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Award className="h-4 w-4" style={{ color: "#691D1B" }} />
                        <span>Pengajar UTBK</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="h-4 w-4" style={{ color: "#691D1B" }} />
                        <span>{tutor.teaches}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={tutor.emailHref}
                        aria-label={`Email ${tutor.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D7BE] bg-white text-gray-400 transition-colors hover:border-[#691D1B] hover:text-[#691D1B]"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a
                        href={tutor.linkedinHref}
                        aria-label={`LinkedIn ${tutor.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D7BE] bg-white text-gray-400 transition-colors hover:border-[#691D1B] hover:text-[#691D1B]"
                      >
                        <LinkedInMark className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:py-20">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl p-8 text-center sm:p-14" style={{ background: "#691D1B" }}>
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full opacity-10" style={{ background: "#FFE882", transform: "translate(25%, -25%)" }} />
            <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full opacity-10" style={{ background: "#FFE882", transform: "translate(-25%, 25%)" }} />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl text-white" style={{ fontWeight: 800 }}>
                Siap Belajar bersama Tutor BRICS?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-[#D8D7BE]">
                Pilih paket belajar yang sesuai dan mulai persiapan UTBK bersama tutor pilihan BRICS Education.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={user ? "/dashboard" : route("register")}
                  className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-[#691D1B] transition-all hover:opacity-90"
                  style={{ background: "#FFE882", fontWeight: 700 }}
                >
                  {user ? "Masuk Dashboard" : "Daftar Gratis"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/#katalog"
                  className="rounded-xl border-2 border-white/40 px-7 py-3.5 text-sm text-white transition-all hover:border-white"
                  style={{ fontWeight: 600 }}
                >
                  Lihat Paket
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#D8D7BE] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <BricsLogo size="lg" />
          <p className="text-sm text-gray-400">&copy; 2025 BRICS Education. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 transition-colors hover:text-[#691D1B]">Beranda</Link>
            <Link href={route("login")} className="text-sm text-gray-500 transition-colors hover:text-[#691D1B]">Masuk</Link>
            <Link href={route("register")} className="text-sm text-gray-500 transition-colors hover:text-[#691D1B]">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
