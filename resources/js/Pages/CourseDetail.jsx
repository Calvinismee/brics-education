import { Link } from '@inertiajs/react';
import BricsLogo from '@/Components/BricsLogo';
import {
  ArrowLeft,
  Play,
  FileText,
  Users,
  Clock,
  Star,
  CheckCircle,
  BookOpen,
  Award,
  Shield,
  ChevronRight,
  ArrowRight,
  CreditCard,
} from "lucide-react";

const COURSE_IMAGE =
  "https://images.unsplash.com/photo-1758612898312-708f2ffdcd53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwb25saW5lJTIwbGVhcm5pbmclMjBlZHVjYXRpb258ZW58MXx8fHwxNzc3MzgwNTA0fDA&ixlib=rb-4.1.0&q=80&w=1080";

function getCategoryName(course) {
  if (!course?.category) return "Course";
  if (typeof course.category === "string") return course.category;
  return course.category.name || "Course";
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isNaN(numericPrice)) {
    return `Rp ${numericPrice.toLocaleString("id-ID")}`;
  }

  return String(price || "-");
}

export default function CourseDetail({ course }) {
  const categoryName = getCategoryName(course);

  const benefits = [
    "Informasi paket bimbel ditampilkan dengan jelas",
    "Pembayaran dilakukan melalui sistem",
    "Status transaksi dapat dipantau",
    "Akses course aktif setelah pembayaran berhasil",
    "Materi dan jadwal dapat diakses melalui dashboard siswa",
    "Data pembelian tersimpan di sistem",
  ];

  const courseIncludes = [
    {
      icon: <BookOpen className="w-4 h-4" />,
      text: "Akses materi pembelajaran",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      text: "Informasi course dan deskripsi paket",
    },
    {
      icon: <Award className="w-4 h-4" />,
      text: "Pembelajaran terarah sesuai kebutuhan siswa",
    },
    {
      icon: <Shield className="w-4 h-4" />,
      text: "Transaksi tercatat di sistem",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F7F2E7",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Header */}
      <header className="bg-white border-b border-[#D8D7BE] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <BricsLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm text-gray-700 hover:text-[#691D1B] hover:bg-[#F7F2E7] rounded-md transition-colors"
              style={{ fontWeight: 500 }}
            >
              Beranda
            </Link>

            <Link
              href="/#katalog"
              className="px-4 py-2 text-sm text-gray-700 hover:text-[#691D1B] hover:bg-[#F7F2E7] rounded-md transition-colors"
              style={{ fontWeight: 500 }}
            >
              Katalog
            </Link>

            <Link
              href="/#tentang"
              className="px-4 py-2 text-sm text-gray-700 hover:text-[#691D1B] hover:bg-[#F7F2E7] rounded-md transition-colors"
              style={{ fontWeight: 500 }}
            >
              Tentang Kami
            </Link>
          </nav>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#691D1B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFE882] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FFE882] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <Link
            href="/#katalog"
            className="inline-flex items-center gap-2 text-[#FFE882]/85 hover:text-[#FFE882] text-sm mb-7 transition-colors"
            style={{ fontWeight: 700 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <span
                className="inline-flex items-center gap-2 bg-[#FFE882] text-[#691D1B] text-xs px-4 py-2 rounded-full mb-5"
                style={{ fontWeight: 800 }}
              >
                {categoryName}
                <span className="w-1 h-1 rounded-full bg-[#691D1B]" />
                {course?.status === "active" ? "Aktif" : "Tersedia"}
              </span>

              <h1
                className="text-3xl lg:text-5xl text-white mb-5"
                style={{ fontWeight: 900, lineHeight: 1.15 }}
              >
                {course?.title || "Detail Course"}
              </h1>

              <p className="text-[#D8D7BE] text-base leading-relaxed mb-7 max-w-3xl">
                {course?.description || "Deskripsi course belum tersedia."}
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#FFE882] text-[#FFE882]" />
                  <span className="text-white" style={{ fontWeight: 900 }}>
                    4.9
                  </span>
                  <span className="text-[#D8D7BE] text-sm">
                    Rating rata-rata
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#D8D7BE] text-sm">
                  <Users className="w-4 h-4" />
                  100+ siswa
                </div>

                <div className="flex items-center gap-2 text-[#D8D7BE] text-sm">
                  <Clock className="w-4 h-4" />
                  Fleksibel
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
                <p className="text-sm text-[#D8D7BE] mb-2">Harga course</p>
                <p className="text-3xl text-[#FFE882]" style={{ fontWeight: 900 }}>
                  {formatPrice(course?.price)}
                </p>
                <p className="text-xs text-[#D8D7BE] mt-2">
                  Harga mengikuti data pada database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D8D7BE]">
              <div className="relative">
                <img
                  src={COURSE_IMAGE}
                  alt={course?.title || "Course"}
                  className="w-full h-72 lg:h-80 object-cover"
                />

                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
                    style={{ background: "#FFE882" }}
                  >
                    <Play className="w-7 h-7 ml-1 text-[#691D1B]" />
                  </div>
                </div>

                <div className="absolute left-5 bottom-5 bg-white rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-gray-500">Preview Course</p>
                  <p className="text-sm text-[#691D1B]" style={{ fontWeight: 800 }}>
                    Lihat gambaran pembelajaran
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D8D7BE]">
              <h2
                className="text-xl text-[#691D1B] mb-4"
                style={{ fontWeight: 900 }}
              >
                Tentang Course Ini
              </h2>

              <p className="text-sm text-gray-700 leading-relaxed">
                {course?.description || "Deskripsi course belum tersedia."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D8D7BE]">
              <h2
                className="text-xl text-[#691D1B] mb-5"
                style={{ fontWeight: 900 }}
              >
                Yang Akan Kamu Dapatkan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F2E7]"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#691D1B]" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D8D7BE]">
              <h2
                className="text-xl text-[#691D1B] mb-5"
                style={{ fontWeight: 900 }}
              >
                Alur Pembelian Course
              </h2>

              <div className="space-y-4">
                {[
                  "Siswa memilih course yang sesuai kebutuhan.",
                  "Siswa masuk atau mendaftar akun.",
                  "Siswa melanjutkan ke halaman checkout.",
                  "Sistem membuat transaksi pembayaran.",
                  "Setelah pembayaran berhasil, course aktif di dashboard siswa.",
                ].map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        background: "#691D1B",
                        color: "#FFE882",
                        fontWeight: 900,
                      }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 pt-2">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-[#D8D7BE] overflow-hidden sticky top-24">
              <div className="p-6 border-b border-[#F7F2E7]">
                <span
                  className="inline-block text-xs px-3 py-1 rounded-full mb-3"
                  style={{
                    background: "#FFE882",
                    color: "#691D1B",
                    fontWeight: 800,
                  }}
                >
                  {categoryName}
                </span>

                <h3
                  className="text-xl text-gray-900 mb-3"
                  style={{ fontWeight: 900 }}
                >
                  {course?.title || "Course"}
                </h3>

                <div className="mb-5">
                  <div
                    className="text-3xl text-[#691D1B]"
                    style={{ fontWeight: 900 }}
                  >
                    {formatPrice(course?.price)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Harga mengikuti data pada database Supabase.
                  </p>
                </div>

                <Link
                  href={`/checkout/${course?.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-center text-white rounded-xl mb-3 hover:bg-[#4A1412] transition-colors"
                  style={{ background: "#691D1B", fontWeight: 800 }}
                >
                  <CreditCard className="w-4 h-4" />
                  Beli Course
                </Link>

                <Link
                  href="/#katalog"
                  className="flex items-center justify-center gap-1 w-full py-3.5 text-center rounded-xl border-2 border-[#691D1B] text-[#691D1B] hover:bg-[#691D1B] hover:text-white transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  Lihat Course Lain
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="p-6">
                <h4
                  className="text-sm text-gray-900 mb-4"
                  style={{ fontWeight: 900 }}
                >
                  Course mencakup:
                </h4>

                <div className="space-y-3">
                  {courseIncludes.map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <span className="text-[#691D1B]">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="rounded-2xl bg-[#691D1B] p-8 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h2 className="text-2xl mb-2" style={{ fontWeight: 900 }}>
              Siap mengikuti course ini?
            </h2>
            <p className="text-sm text-[#D8D7BE]">
              Lanjutkan ke checkout untuk membuat transaksi dan mengaktifkan course setelah pembayaran.
            </p>
          </div>

          <Link
            href={`/checkout/${course?.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[#691D1B] bg-[#FFE882] hover:bg-yellow-300 transition-colors"
            style={{ fontWeight: 900 }}
          >
            Lanjut Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}