import { Link } from '@inertiajs/react';
import BricsLogo from '@/Components/BricsLogo';
import { Search, BookOpen, Users, Clock, Star, ChevronRight, Play, Award, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1758612898312-708f2ffdcd53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwb25saW5lJTIwbGVhcm5pbmclMjBlZHVjYXRpb258ZW58MXx8fHwxNzc3MzgwNTA0fDA&ixlib=rb-4.1.0&q=80&w=1080";
const TUTOR_IMAGE = "https://images.unsplash.com/photo-1619852182277-79aa23f82c8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjB0dXRvcmluZyUyMGNsYXNzcm9vbSUyMHRlYWNoaW5nfGVufDF8fHx8MTc3NzM4MDUwNHww&ixlib=rb-4.1.0&q=80&w=1080";

const courses = [
  {
    id: 1,
    name: "Matematika UTBK Intensif",
    category: "Persiapan UTBK",
    price: "Rp 299.000",
    originalPrice: "Rp 450.000",
    rating: 4.9,
    students: 1240,
    duration: "48 jam",
    tutor: "Dr. Ahmad Fauzi",
    image: "https://images.unsplash.com/photo-1758685849145-cd8bfb57ab2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMHNjaWVuY2UlMjBwcmVwYXJhdGlvbiUyMGV4YW18ZW58MXx8fHwxNzc3MzgwNTA4fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 2,
    name: "Pemrograman Web Full Stack",
    category: "Teknologi",
    price: "Rp 399.000",
    originalPrice: "Rp 550.000",
    rating: 4.8,
    students: 856,
    duration: "60 jam",
    tutor: "Budi Santoso, M.Kom",
    image: "https://images.unsplash.com/photo-1759884248009-92c5e957708e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGluZyUyMGNvdXJzZSUyMGxhcHRvcHxlbnwxfHx8fDE3NzczODA1MDd8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 3,
    name: "Bahasa Inggris Bisnis",
    category: "Bahasa",
    price: "Rp 249.000",
    originalPrice: "Rp 350.000",
    rating: 4.7,
    students: 2100,
    duration: "36 jam",
    tutor: "Sarah Johnson, MA",
    image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGVuZ2xpc2glMjBsYW5ndWFnZSUyMGNvdXJzZXxlbnwxfHx8fDE3NzczODA1MTF8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 4,
    name: "Persiapan SNBT Komprehensif",
    category: "Persiapan UTBK",
    price: "Rp 499.000",
    originalPrice: "Rp 700.000",
    rating: 4.9,
    students: 3450,
    duration: "80 jam",
    tutor: "Tim Pengajar BRICS",
    image: "https://images.unsplash.com/photo-1760348082205-8bda5fbdd7b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwYWNoaWV2ZW1lbnQlMjBzdWNjZXNzJTIwZ3JhZHVhdGlvbnxlbnwxfHx8fDE3NzczODA1MTF8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 5,
    name: "Fisika & Kimia UTBK",
    category: "Sains",
    price: "Rp 329.000",
    originalPrice: "Rp 480.000",
    rating: 4.8,
    students: 980,
    duration: "52 jam",
    tutor: "Prof. Dewi Rahayu",
    image: "https://images.unsplash.com/photo-1758685849145-cd8bfb57ab2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMHNjaWVuY2UlMjBwcmVwYXJhdGlvbiUyMGV4YW18ZW58MXx8fHwxNzc3MzgwNTA4fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 6,
    name: "Data Science & AI Dasar",
    category: "Teknologi",
    price: "Rp 449.000",
    originalPrice: "Rp 600.000",
    rating: 4.6,
    students: 620,
    duration: "44 jam",
    tutor: "Rina Kusuma, Ph.D",
    image: "https://images.unsplash.com/photo-1759884248009-92c5e957708e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGluZyUyMGNvdXJzZSUyMGxhcHRvcHxlbnwxfHx8fDE3NzczODA1MDd8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
];

const stats = [
  { value: "15.000+", label: "Siswa Aktif" },
  { value: "200+", label: "Tutor Berpengalaman" },
  { value: "500+", label: "Kursus Tersedia" },
  { value: "94%", label: "Tingkat Kelulusan" },
];

const benefits = [
  {
    icon: <BookOpen className="w-7 h-7" />,
    title: "Materi Terstruktur",
    desc: "Kurikulum dirancang oleh pakar pendidikan berpengalaman dengan pendekatan sistematis dan mudah dipahami.",
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

const categories = ["Semua", "Persiapan UTBK", "Teknologi", "Bahasa", "Sains", "Bisnis"];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filtered = courses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "Semua" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#D8D7BE]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <BricsLogo size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Beranda", to: "/" },
              { label: "Katalog", to: "/#katalog" },
              { label: "Tentang Kami", to: "/tentang-kami" },
              { label: "Blog", to: "#" },
            ].map((item) => (
                <Link
                  key={item.label}
                  href={item.to}
                className="px-4 py-2 text-sm text-gray-700 hover:text-[#691D1B] hover:bg-[#F7F2E7] rounded-md transition-colors"
                style={{ fontWeight: 500 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={route('login')}
              className="px-5 py-2 text-sm text-white bg-[#691D1B] rounded-md hover:bg-[#4A1412] transition-colors"
            >
              Masuk
            </Link>
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
              <h1 className="text-4xl lg:text-5xl text-white mb-6" style={{ fontWeight: 800, lineHeight: 1.2 }}>
                Raih Impianmu Bersama{" "}
                <span className="text-[#FFE882]">BRICS Education</span>
              </h1>
              <p className="text-[#D8D7BE] text-base mb-8 leading-relaxed">
                Platform edukasi online terpercaya dengan ratusan kursus berkualitas, tutor profesional, dan sistem pembelajaran adaptif yang membantu kamu mencapai tujuan pendidikan.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-8 py-4 bg-[#FFE882] text-[#691D1B] rounded-lg hover:bg-yellow-300 transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  Mulai Belajar Gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors">
                  <Play className="w-5 h-5" />
                  Lihat Demo
                </button>
              </div>
              <div className="flex flex-wrap gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl text-[#FFE882]" style={{ fontWeight: 800 }}>{s.value}</div>
                    <div className="text-xs text-[#D8D7BE]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img src={HERO_IMAGE} alt="Students learning" className="w-full h-80 object-cover" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#691D1B] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#FFE882]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Kelulusan UTBK</div>
                    <div className="text-sm text-[#691D1B]" style={{ fontWeight: 700 }}>+94% Sukses</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#FFE882] rounded-xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="text-xl text-[#691D1B]" style={{ fontWeight: 800 }}>4.9★</div>
                  <div className="text-xs text-[#691D1B]">Rating Rata-rata</div>
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
                placeholder="Cari kursus, topik, atau tutor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#D8D7BE] rounded-lg bg-[#F7F2E7] focus:outline-none focus:border-[#691D1B] text-sm transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
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

      {/* Course Catalog */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-[#691D1B] mb-1" style={{ fontWeight: 800 }}>Kursus Populer</h2>
            <p className="text-gray-600 text-sm">Dipilih oleh ribuan pelajar di seluruh Indonesia</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-[#691D1B] hover:underline"
            style={{ fontWeight: 600 }}
          >
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D8D7BE] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
            >
              <div className="relative">
                <img src={course.image} alt={course.name} className="w-full h-44 object-cover" />
                <span className="absolute top-3 left-3 bg-[#FFE882] text-[#691D1B] text-xs px-3 py-1 rounded-full" style={{ fontWeight: 700 }}>
                  {course.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700 }}>{course.name}</h3>
                <p className="text-sm text-gray-500 mb-3">oleh {course.tutor}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#FFE882] text-[#FFE882]" />
                    <span style={{ fontWeight: 700, color: "#691D1B" }}>{course.rating}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students.toLocaleString()} siswa
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F7F2E7]">
                  <div>
                    <div className="text-[#691D1B]" style={{ fontWeight: 800 }}>{course.price}</div>
                    <div className="text-xs text-gray-400 line-through">{course.originalPrice}</div>
                  </div>
                  <Link
                    href={`/course/${course.id}`}
                    className="flex items-center gap-1 px-4 py-2 bg-[#691D1B] text-white text-xs rounded-lg hover:bg-[#4A1412] transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Detail <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why BRICS */}
      <section className="bg-white border-y border-[#D8D7BE] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl text-[#691D1B] mb-3" style={{ fontWeight: 800 }}>Mengapa Memilih BRICS Education?</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              Kami berkomitmen memberikan pengalaman belajar terbaik yang membantu kamu meraih tujuan akademis dan karier.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 p-6 rounded-xl bg-[#F7F2E7] hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#691D1B] flex items-center justify-center text-[#FFE882]">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1" style={{ fontWeight: 700 }}>{b.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial/CTA Banner */}
      <section className="bg-[#691D1B] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#FFE882]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#FFE882]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl text-white mb-4" style={{ fontWeight: 800 }}>
                Siap untuk memulai perjalanan belajarmu?
              </h2>
              <p className="text-[#D8D7BE] mb-8 text-sm leading-relaxed">
                Bergabunglah dengan lebih dari 15.000 siswa yang telah merasakan manfaat belajar bersama BRICS Education. Daftar sekarang dan dapatkan akses gratis ke kelas perdana kami.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-[#FFE882] text-[#691D1B] rounded-lg hover:bg-yellow-300 transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  Daftar Gratis Sekarang
                </Link>
                <Link
                  href={route('login')}
                  className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Sudah punya akun? Masuk
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={TUTOR_IMAGE} alt="Tutor teaching" className="w-full h-72 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="mb-4">
                <BricsLogo variant="light" size="sm" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Platform edukasi online terpercaya untuk persiapan ujian dan pengembangan skill profesional.
              </p>
              <div className="flex gap-3">
                {["IG", "FB", "TW", "YT"].map((s) => (
                  <div
                    key={s}
                    className="w-9 h-9 rounded-full bg-[#691D1B] flex items-center justify-center text-xs cursor-pointer hover:bg-[#8B2523] transition-colors"
                    style={{ fontWeight: 700 }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {[
              {
                title: "Kursus",
                links: ["Persiapan UTBK", "Teknologi", "Bahasa Inggris", "Sains", "Bisnis"],
              },
              {
                title: "Perusahaan",
                links: ["Tentang Kami", "Blog", "Karier", "Press Kit", "Kontak"],
              },
              {
                title: "Bantuan",
                links: ["FAQ", "Pusat Bantuan", "Kebijakan Privasi", "Syarat & Ketentuan"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[#FFE882] mb-4" style={{ fontWeight: 700 }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2025 BRICS Education. All rights reserved.</p>
            <p className="text-sm text-gray-500">Dibuat dengan ❤️ untuk pelajar Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}