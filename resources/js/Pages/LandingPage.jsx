import { Link, usePage } from '@inertiajs/react';
import BricsLogo from '@/Components/BricsLogo';
import PublicNavbar from '@/Components/PublicNavbar';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Play,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  CreditCard,
  Layers,
  Package as PackageIcon,
} from "lucide-react";
import { useEffect } from "react";
import { packageCheckoutHref } from '@/utils/slug';

const HERO_IMAGE =
  "/images/landing/brics-on-abts-2025.jpg";

const TUTOR_IMAGE =
  "https://images.unsplash.com/photo-1619852182277-79aa23f82c8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjB0dXRvcmluZyUyMGNsYXNzcm9vbSUyMHRlYWNoaW5nfGVufDF8fHx8MTc3NzM4MDUwNHww&ixlib=rb-4.1.0&q=80&w=1080";

const COURSE_IMAGE =
  "/images/landing/brics-zoom-lesson.jpg";

const stats = [
  { value: "15.000+", label: "Siswa Aktif" },
  { value: "200+", label: "Tutor Berpengalaman" },
  { value: "7+", label: "Subtes Terarah" },
  { value: "94%", label: "Tingkat Kelulusan" },
];

const benefits = [
  {
    icon: <BookOpen className="w-7 h-7" />,
    title: "Materi Terstruktur",
    desc: "Setiap paket berisi rangkaian subtes yang dirancang oleh pakar pendidikan berpengalaman.",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Tutor Profesional",
    desc: "Belajar langsung dari mentor terbaik yang berpengalaman dan telah terbukti mengantarkan ribuan siswa sukses.",
  },
  {
    icon: <Clock className="w-7 h-7" />,
    title: "Belajar Fleksibel",
    desc: "Akses materi kapan saja dan di mana saja. Jadwal disesuaikan dengan kebutuhan belajarmu.",
  },
  {
    icon: <Award className="w-7 h-7" />,
    title: "Sertifikasi Resmi",
    desc: "Dapatkan sertifikat yang diakui setelah menyelesaikan program belajar dengan nilai memuaskan.",
  },
  {
    icon: <TrendingUp className="w-7 h-7" />,
    title: "Pantau Progres",
    desc: "Dashboard personal untuk memantau perkembangan belajar dan persiapan ujianmu secara real-time.",
  },
  {
    icon: <CheckCircle className="w-7 h-7" />,
    title: "Garansi Kepuasan",
    desc: "Jika tidak puas dalam 7 hari, kami kembalikan uangmu. Kami percaya diri dengan kualitas layanan kami.",
  },
];

function asArray(value) {
  if (Array.isArray(value)) return value;
  return Object.values(value ?? {});
}

function getCourseCategoryName(course) {
  if (!course?.category) return "Paket";
  if (typeof course.category === "string") return course.category;
  return course.category.name || "Paket";
}

function getPackageCourses(pkg) {
  return asArray(pkg?.courses);
}

function getPackageCategories(pkg) {
  return Array.from(
    new Set(getPackageCourses(pkg).map((course) => getCourseCategoryName(course)).filter(Boolean))
  );
}

function getPackageCategoryLabel(pkg) {
  const categories = getPackageCategories(pkg);

  if (categories.length === 0) return "Paket Belajar";
  if (categories.length === 1) return categories[0];

  return "Paket Lengkap";
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isNaN(numericPrice)) {
    return `Rp ${numericPrice.toLocaleString("id-ID")}`;
  }

  return String(price);
}

export default function LandingPage({ packages = [] }) {
  const { auth } = usePage().props;
  const user = auth?.user;

  const packageList = asArray(packages);

  useEffect(() => {
    const root = document.getElementById("landing-page-top");
    const revealElements = root?.querySelectorAll(".brics-scroll-reveal");

    if (!root || !revealElements?.length) return undefined;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.16,
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [packageList.length]);

  const scrollToTarget = (href, behavior = "smooth") => {
    const url = new URL(href, window.location.origin);
    const targetId = url.hash ? decodeURIComponent(url.hash.slice(1)) : "landing-page-top";
    const target = document.getElementById(targetId);

    if (!target) {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const stickyOffset = targetId === "landing-page-top" ? 0 : window.innerWidth < 768 ? 120 : 84;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - stickyOffset;

    window.scrollTo({ top: Math.max(targetTop, 0), behavior });
  };

  const handleAnchorNavigation = (event, href) => {
    const url = new URL(href, window.location.origin);
    const isSamePage = url.pathname === window.location.pathname;

    if (isSamePage) {
      event.preventDefault();
      scrollToTarget(href);
    }
  };

  return (
    <div
      id="landing-page-top"
      className="min-h-screen"
      style={{
        background: "#F7F2E7",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>
        {`
          @keyframes bricsFadeUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bricsFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes bricsPulseSoft {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.04);
            }
          }

          .brics-fade-up {
            animation: bricsFadeUp 700ms ease-out both;
          }

          .brics-fade-up-delay-1 {
            animation-delay: 120ms;
          }

          .brics-fade-up-delay-2 {
            animation-delay: 240ms;
          }

          .brics-fade-up-delay-3 {
            animation-delay: 360ms;
          }

          .brics-float {
            animation: bricsFloat 5s ease-in-out infinite;
          }

          .brics-pulse-soft {
            animation: bricsPulseSoft 3.5s ease-in-out infinite;
          }

          .brics-scroll-reveal {
            opacity: 0;
            transform: translateY(22px);
            transition: opacity 650ms ease, transform 650ms ease, box-shadow 200ms ease;
            will-change: opacity, transform;
          }

          .brics-scroll-reveal.is-visible {
            opacity: 1;
            transform: translateY(0);
          }

          .brics-stagger > .brics-scroll-reveal:nth-child(2) {
            transition-delay: 80ms;
          }

          .brics-stagger > .brics-scroll-reveal:nth-child(3) {
            transition-delay: 160ms;
          }

          .brics-stagger > .brics-scroll-reveal:nth-child(4) {
            transition-delay: 40ms;
          }

          .brics-stagger > .brics-scroll-reveal:nth-child(5) {
            transition-delay: 120ms;
          }

          .brics-stagger > .brics-scroll-reveal:nth-child(6) {
            transition-delay: 200ms;
          }

          @media (prefers-reduced-motion: reduce) {
            .brics-fade-up,
            .brics-float,
            .brics-pulse-soft {
              animation: none;
            }

            .brics-scroll-reveal {
              opacity: 1;
              transform: none;
              transition: none;
            }
          }
        `}
      </style>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-[#691D1B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFE882] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FFE882] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="brics-fade-up inline-flex items-center gap-2 bg-[#FFE882] text-[#691D1B] px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Star className="w-4 h-4 fill-[#691D1B]" />
                Platform Belajar #1 di Indonesia
              </div>

              <h1
                className="brics-fade-up brics-fade-up-delay-1 text-4xl lg:text-5xl text-white mb-6"
                style={{ fontWeight: 800, lineHeight: 1.2 }}
              >
                Raih Impianmu Bersama{" "}
                <span className="text-[#FFE882]">BRICS Education</span>
              </h1>

              <p className="brics-fade-up brics-fade-up-delay-2 text-[#D8D7BE] text-base mb-8 leading-relaxed">
                Platform edukasi online terpercaya dengan paket belajar
                terarah, tutor profesional, dan sistem pembelajaran adaptif
                yang membantu kamu mencapai tujuan pendidikan.
              </p>

              <div className="brics-fade-up brics-fade-up-delay-3 flex flex-wrap gap-4 mb-10">
                <Link
                  href={user ? "/dashboard" : route("login")}
                  className="flex items-center gap-2 px-8 py-4 bg-[#FFE882] text-[#691D1B] rounded-lg hover:bg-yellow-300 transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  {user ? "Masuk Dashboard" : "Mulai Perjalananmu!"}
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#katalog"
                  onClick={(event) => handleAnchorNavigation(event, "#katalog")}
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <Play className="w-5 h-5" />
                  Lihat Katalog
                </a>
              </div>

              <div className="brics-fade-up brics-fade-up-delay-3 flex flex-wrap gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-2xl text-[#FFE882]"
                      style={{ fontWeight: 800 }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-[#D8D7BE]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="brics-fade-up brics-fade-up-delay-2 relative">
              <div className="brics-float rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src={HERO_IMAGE}
                  alt="BRICS on ABTS 2025"
                  className="w-full h-80 object-cover"
                />
              </div>

              <div className="brics-pulse-soft absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#691D1B] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#FFE882]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Kelulusan UTBK</div>
                    <div
                      className="text-sm text-[#691D1B]"
                      style={{ fontWeight: 700 }}
                    >
                      +94% Sukses
                    </div>
                  </div>
                </div>
              </div>

              <div className="brics-pulse-soft absolute -top-4 -right-4 bg-[#FFE882] rounded-xl p-4 shadow-xl">
                <div className="text-center">
                  <div
                    className="text-xl text-[#691D1B]"
                    style={{ fontWeight: 800 }}
                  >
                    4.9★
                  </div>
                  <div className="text-xs text-[#691D1B]">
                    Rating Rata-rata
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Catalog */}
      <section id="katalog" className="max-w-7xl mx-auto px-6 py-16">
        <div className="brics-scroll-reveal mb-8">
          <div>
            <h2
              className="text-3xl text-[#691D1B] mb-1"
              style={{ fontWeight: 800 }}
            >
              Paket Belajar
            </h2>
            <p className="text-gray-600 text-sm">
              Pilih satu paket, lalu akses semua course yang termasuk di dalamnya.
            </p>
          </div>
        </div>

        {packageList.length === 0 ? (
          <div className="brics-scroll-reveal bg-white border border-[#D8D7BE] rounded-2xl p-8 text-center text-gray-600">
            Belum ada paket aktif yang tersedia.
          </div>
        ) : (
          <div className="brics-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packageList.map((pkg) => {
              const packageCourses = getPackageCourses(pkg);
              const packageFeatures = Array.isArray(pkg.features) ? pkg.features : [];

              return (
                <div
                  key={pkg.id}
                  className="brics-scroll-reveal"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D8D7BE] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex h-full flex-col">
                    <div className="relative">
                      <img
                        src={COURSE_IMAGE}
                        alt={pkg.name}
                        className="w-full h-44 object-cover"
                      />
                      <span
                        className="absolute top-3 left-3 bg-[#FFE882] text-[#691D1B] text-xs px-3 py-1 rounded-full"
                        style={{ fontWeight: 700 }}
                      >
                        {getPackageCategoryLabel(pkg)}
                      </span>

                      {pkg.popular && (
                        <span
                          className="absolute top-3 right-3 bg-white text-[#691D1B] text-xs px-3 py-1 rounded-full shadow-sm"
                          style={{ fontWeight: 800 }}
                        >
                          Paling Populer
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#691D1B] text-[#FFE882] flex items-center justify-center flex-shrink-0">
                          <PackageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3
                            className="text-gray-900"
                            style={{ fontWeight: 800 }}
                          >
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {packageCourses.length} course dalam satu paket
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {pkg.description || "Deskripsi paket belum tersedia."}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1 rounded-lg bg-[#F7F2E7] px-2 py-2">
                          <Layers className="w-3.5 h-3.5 text-[#691D1B]" />
                          {packageCourses.length} subtes
                        </span>
                        <span className="flex items-center gap-1 rounded-lg bg-[#F7F2E7] px-2 py-2">
                          <Star className="w-3.5 h-3.5 fill-[#FFE882] text-[#D5A018]" />
                          4.9
                        </span>
                        <span className="flex items-center gap-1 rounded-lg bg-[#F7F2E7] px-2 py-2">
                          <Clock className="w-3.5 h-3.5 text-[#0F7A45]" />
                          Fleksibel
                        </span>
                      </div>

                      {packageFeatures.length > 0 && (
                        <ul className="mb-4 space-y-2">
                          {packageFeatures.slice(0, 3).map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-[#0F7A45] flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mb-5 rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] p-3">
                        <div className="mb-2 text-xs uppercase text-gray-500" style={{ fontWeight: 800 }}>
                          Course dalam paket
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {packageCourses.slice(0, 5).map((course) => (
                            <span key={course.id} className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600" style={{ fontWeight: 700 }}>
                              {course.title}
                            </span>
                          ))}
                          {packageCourses.length > 5 && (
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600" style={{ fontWeight: 700 }}>
                              +{packageCourses.length - 5} course
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-[#F7F2E7]">
                        <div>
                          <div className="text-xs text-gray-500">Harga paket</div>
                          <div
                            className="text-[#691D1B]"
                            style={{ fontWeight: 900 }}
                          >
                            {formatPrice(pkg.price)}
                          </div>
                        </div>

                        <Link
                          href={packageCheckoutHref(pkg)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#691D1B] text-white text-xs rounded-lg hover:bg-[#4A1412] transition-colors"
                          style={{ fontWeight: 800 }}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Beli Paket
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Why BRICS */}
      <section id="tentang" className="bg-white border-y border-[#D8D7BE] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="brics-scroll-reveal text-center mb-14">
            <h2
              className="text-3xl text-[#691D1B] mb-3"
              style={{ fontWeight: 800 }}
            >
              Mengapa Memilih BRICS Education?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Kami berkomitmen memberikan pengalaman belajar terbaik yang
              membantu kamu meraih tujuan akademis dan karier.
            </p>
          </div>

          <div className="brics-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="brics-scroll-reveal flex gap-4 p-6 rounded-xl bg-[#F7F2E7] hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#691D1B] flex items-center justify-center text-[#FFE882]">
                  {b.icon}
                </div>
                <div>
                  <h4
                    className="text-gray-900 mb-1"
                    style={{ fontWeight: 700 }}
                  >
                    {b.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#691D1B] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#FFE882]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FFE882]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="brics-scroll-reveal">
              <h2
                className="text-3xl text-white mb-4"
                style={{ fontWeight: 800 }}
              >
                Siap untuk memulai perjalanan belajarmu?
              </h2>
              <p className="text-[#D8D7BE] mb-8 text-sm leading-relaxed">
                Bergabunglah dengan lebih dari 15.000 siswa yang telah merasakan
                manfaat belajar bersama BRICS Education. Pilih paket yang sesuai
                lalu mulai belajar dari dashboard siswa.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={user ? "/dashboard" : route("login")}
                  className="px-8 py-4 bg-[#FFE882] text-[#691D1B] rounded-lg hover:bg-yellow-300 transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  {user ? "Masuk Dashboard" : "Mulai Perjalananmu Sekarang!"}
                </Link>

              </div>
            </div>

            <div className="brics-scroll-reveal rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={TUTOR_IMAGE}
                alt="Tutor teaching"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="brics-stagger grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="brics-scroll-reveal md:col-span-2">
              <div className="mb-4 bg-[var(--accent)] rounded-lg w-max p-2">
                <BricsLogo variant="light" size="lg" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Platform belajar UTBK dengan paket course, materi, jadwal live class,
                dan dashboard progres siswa.
              </p>
            </div>

            {[
              {
                title: "Belajar",
                links: [
                  { label: "Paket Belajar", to: "/#katalog" },
                  { label: "Tentang BRICS", to: "#tentang" },
                  { label: "Tutor Kami", to: "/tutors" },
                ],
              },
              {
                title: "Mulai Belajar",
                links: [
                  { label: "Daftar Akun", to: route("register") },
                  { label: "Masuk Siswa", to: route("login") },
                  { label: "Dashboard Belajar", to: "/dashboard" },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="brics-scroll-reveal">
                <h4
                  className="text-[#FFE882] mb-4"
                  style={{ fontWeight: 700 }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.to}
                        onClick={(event) => handleAnchorNavigation(event, item.to)}
                        onSuccess={() => scrollToTarget(item.to, "auto")}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="brics-scroll-reveal border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 BRICS Education.
            </p>
            <p className="text-sm text-gray-500">
              Paket belajar, pembayaran, materi, jadwal, dan dashboard dalam satu aplikasi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
