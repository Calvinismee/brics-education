import { Link, router, usePage } from '@inertiajs/react';
import BricsLogo from '@/Components/BricsLogo';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Star,
  ChevronRight,
  Play,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  CreditCard,
  Layers,
  Package as PackageIcon,
} from "lucide-react";
import { useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1758612898312-708f2ffdcd53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwb25saW5lJTIwbGVhcm5pbmclMjBlZHVjYXRpb258ZW58MXx8fHwxNzc3MzgwNTA0fDA&ixlib=rb-4.1.0&q=80&w=1080";

const TUTOR_IMAGE =
  "https://images.unsplash.com/photo-1619852182277-79aa23f82c8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjB0dXRvcmluZyUyMGNsYXNzcm9vbSUyMHRlYWNoaW5nfGVufDF8fHx8MTc3NzM4MDUwNHww&ixlib=rb-4.1.0&q=80&w=1080";

const COURSE_IMAGE =
  "https://images.unsplash.com/photo-1758612898312-708f2ffdcd53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwb25saW5lJTIwbGVhcm5pbmclMjBlZHVjYXRpb258ZW58MXx8fHwxNzc3MzgwNTA0fDA&ixlib=rb-4.1.0&q=80&w=400";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = [
    "Semua",
    ...Array.from(
      new Set(packageList.flatMap((pkg) => getPackageCategories(pkg)).filter(Boolean))
    ),
  ];

  const filtered = packageList.filter((pkg) => {
    const packageCategories = getPackageCategories(pkg);
    const searchText = [
      pkg.name,
      pkg.description,
      ...getPackageCourses(pkg).map((course) => course.title),
      ...(Array.isArray(pkg.features) ? pkg.features : []),
    ].join(" ");
    const matchSearch = searchText
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "Semua" || packageCategories.includes(activeCategory);

    return matchSearch && matchCat;
  });

  const resetCatalogFilter = () => {
    setSearchQuery("");
    setActiveCategory("Semua");
  };

  const logout = () => {
    router.post(route("logout"));
  };

  const scrollToTarget = (href, behavior = "smooth") => {
    const url = new URL(href, window.location.origin);
    const targetId = url.hash ? decodeURIComponent(url.hash.slice(1)) : "landing-page-top";
    const target = document.getElementById(targetId);

    if (!target) {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const stickyOffset = targetId === "landing-page-top" ? 0 : 148;
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
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#D8D7BE]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <BricsLogo size="lg" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Beranda", to: "/" },
              { label: "Katalog", to: "/#katalog" },
              { label: "Tentang Kami", to: "#tentang" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.to}
                onClick={(event) => handleAnchorNavigation(event, item.to)}
                onSuccess={() => scrollToTarget(item.to)}
                className="px-4 py-2 text-sm text-gray-700 hover:text-[#691D1B] hover:bg-[#F7F2E7] rounded-md transition-colors"
                style={{ fontWeight: 500 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-5 py-2 text-sm text-[#691D1B] border border-[#691D1B] rounded-md hover:bg-[#F7F2E7] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="px-5 py-2 text-sm text-white bg-[#691D1B] rounded-md hover:bg-[#4A1412] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href={route("register")}
                  className="hidden sm:inline-flex px-5 py-2 text-sm text-[#691D1B] border border-[#691D1B] rounded-md hover:bg-[#F7F2E7] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Daftar
                </Link>

                <Link
                  href={route("login")}
                  className="px-5 py-2 text-sm text-white bg-[#691D1B] rounded-md hover:bg-[#4A1412] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#691D1B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFE882] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FFE882] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFE882] text-[#691D1B] px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Star className="w-4 h-4 fill-[#691D1B]" />
                Platform Belajar #1 di Indonesia
              </div>

              <h1
                className="text-4xl lg:text-5xl text-white mb-6"
                style={{ fontWeight: 800, lineHeight: 1.2 }}
              >
                Raih Impianmu Bersama{" "}
                <span className="text-[#FFE882]">BRICS Education</span>
              </h1>

              <p className="text-[#D8D7BE] text-base mb-8 leading-relaxed">
                Platform edukasi online terpercaya dengan paket belajar
                terarah, tutor profesional, dan sistem pembelajaran adaptif
                yang membantu kamu mencapai tujuan pendidikan.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href={user ? "/dashboard" : route("register")}
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

              <div className="flex flex-wrap gap-6">
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

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src={HERO_IMAGE}
                  alt="Students learning"
                  className="w-full h-80 object-cover"
                />
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
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

              <div className="absolute -top-4 -right-4 bg-[#FFE882] rounded-xl p-4 shadow-xl">
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

      {/* Search & Filter */}
      <section className="bg-white border-b border-[#D8D7BE] py-6 sticky top-[61px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#691D1B]" />
              <input
                type="text"
                placeholder="Cari paket, subtes, atau fitur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#D8D7BE] rounded-lg bg-[#F7F2E7] focus:outline-none focus:border-[#691D1B] text-sm transition-colors"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                    activeCategory === cat
                      ? "bg-[#691D1B] text-white"
                      : "bg-[#F7F2E7] text-gray-600 border border-[#D8D7BE] hover:border-[#691D1B]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Package Catalog */}
      <section id="katalog" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
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

          <button
            type="button"
            onClick={resetCatalogFilter}
            className="flex items-center gap-1 text-sm text-[#691D1B] hover:underline"
            style={{ fontWeight: 600 }}
          >
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-[#D8D7BE] rounded-2xl p-8 text-center text-gray-600">
            Belum ada paket aktif yang tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pkg) => {
              const packageCourses = getPackageCourses(pkg);
              const packageFeatures = Array.isArray(pkg.features) ? pkg.features : [];

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D8D7BE] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
                >
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
                        href={`/checkout/package/${pkg.id}`}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-[#691D1B] text-white text-xs rounded-lg hover:bg-[#4A1412] transition-colors"
                        style={{ fontWeight: 800 }}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Beli Paket
                      </Link>
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
          <div className="text-center mb-14">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex gap-4 p-6 rounded-xl bg-[#F7F2E7] hover:shadow-md transition-shadow"
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
            <div>
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
                  href={user ? "/dashboard" : route("register")}
                  className="px-8 py-4 bg-[#FFE882] text-[#691D1B] rounded-lg hover:bg-yellow-300 transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  {user ? "Masuk Dashboard" : "Daftar Gratis Sekarang"}
                </Link>

                {!user && (
                  <Link
                    href={route("login")}
                    className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Sudah punya akun? Masuk
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="mb-4 bg-[var(--accent)] rounded-lg w-max p-2">
                <BricsLogo variant="light" size="lg" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Platform edukasi online terpercaya untuk persiapan ujian dan
                pengembangan skill profesional.
              </p>

              <div className="flex gap-3">
                <a
                  onClick={(e) => window.open("https://www.instagram.com/bricseducation/")}
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-[#691D1B] flex items-center justify-center text-white hover:bg-[#8B2523] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  onClick={(e) => window.open("https://www.youtube.com/@BricsEdu-t4m")}
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-[#691D1B] flex items-center justify-center text-white hover:bg-[#8B2523] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.56 12 3.56 12 3.56s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.57V8.43L15.86 12 9.6 15.57Z" />
                  </svg>
                </a>
              </div>
            </div>

            {[
              {
                title: "Paket",
                links: [
                  "Persiapan UTBK",
                  "Tryout",
                  "Live Class",
                ],
              },
              {
                title: "Perusahaan",
                links: ["Tentang Kami", "Kontak"],
              },
              {
                title: "Bantuan",
                links: [
                  "FAQ",
                  "Pusat Bantuan",
                  "Kebijakan Privasi",
                  "Syarat & Ketentuan",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  className="text-[#FFE882] mb-4"
                  style={{ fontWeight: 700 }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 BRICS Education. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Dibuat dengan ❤️ untuk pelajar Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
