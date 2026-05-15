import { Link, router } from '@inertiajs/react';
import BricsLogo from '@/Components/BricsLogo';
import {
  ArrowLeft,
  CreditCard,
  BookOpen,
  CheckCircle,
  Shield,
  Clock,
  Wallet,
  QrCode,
  Building2,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";
import { useState } from "react";

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

export default function Checkout({ course }) {
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryName = getCategoryName(course);

  const paymentMethods = [
    {
      id: "transfer_bank",
      title: "Transfer Bank",
      desc: "Simulasi pembayaran melalui transfer bank.",
      icon: Building2,
    },
    {
      id: "ewallet",
      title: "E-Wallet",
      desc: "Simulasi pembayaran melalui dompet digital.",
      icon: Wallet,
    },
    {
      id: "qris",
      title: "QRIS",
      desc: "Simulasi pembayaran menggunakan QRIS.",
      icon: QrCode,
    },
  ];

  const handleCheckout = () => {
    setIsSubmitting(true);

    router.post(
      "/checkout",
      {
        course_id: course.id,
        payment_method: paymentMethod,
      },
      {
        preserveScroll: true,
        onFinish: () => setIsSubmitting(false),
      }
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F7F2E7",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
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
              href={route("login")}
              className="px-5 py-2 text-sm text-white bg-[#691D1B] rounded-md hover:bg-[#4A1412] transition-colors"
              style={{ fontWeight: 600 }}
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#691D1B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFE882] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FFE882] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
          <Link
            href={`/course/${course.id}`}
            className="inline-flex items-center gap-2 text-[#FFE882]/85 hover:text-[#FFE882] text-sm mb-6"
            style={{ fontWeight: 700 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Detail Course
          </Link>

          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 bg-[#FFE882] text-[#691D1B] text-xs px-4 py-2 rounded-full mb-5"
              style={{ fontWeight: 800 }}
            >
              Checkout Siswa
            </span>

            <h1
              className="text-3xl lg:text-4xl text-white mb-4"
              style={{ fontWeight: 900, lineHeight: 1.2 }}
            >
              Selesaikan Pembelian Course
            </h1>

            <p className="text-[#D8D7BE] text-sm lg:text-base leading-relaxed">
              Periksa kembali detail course dan pilih metode pembayaran sebelum sistem membuat data transaksi.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F7F2E7]">
                <h2
                  className="text-xl text-[#691D1B]"
                  style={{ fontWeight: 900 }}
                >
                  Detail Course
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Course yang akan kamu beli.
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#691D1B] text-[#FFE882] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7" />
                  </div>

                  <div className="flex-1">
                    <span
                      className="inline-block text-xs px-3 py-1 rounded-full mb-2"
                      style={{
                        background: "#FFE882",
                        color: "#691D1B",
                        fontWeight: 800,
                      }}
                    >
                      {categoryName}
                    </span>

                    <h3
                      className="text-xl text-gray-900 mb-2"
                      style={{ fontWeight: 900 }}
                    >
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {course.description || "Deskripsi course belum tersedia."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F7F2E7]">
                <h2
                  className="text-xl text-[#691D1B]"
                  style={{ fontWeight: 900 }}
                >
                  Pilih Metode Pembayaran
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih salah satu metode pembayaran yang tersedia.
                </p>
              </div>

              <div className="p-6 space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isActive = paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`block border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                        isActive
                          ? "border-[#691D1B] bg-[#F7F2E7]"
                          : "border-[#D8D7BE] bg-white hover:border-[#691D1B]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive ? "#691D1B" : "#F7F2E7",
                            color: isActive ? "#FFE882" : "#691D1B",
                          }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p
                                className="text-sm text-gray-900"
                                style={{ fontWeight: 900 }}
                              >
                                {method.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {method.desc}
                              </p>
                            </div>

                            <input
                              type="radio"
                              name="payment_method"
                              value={method.id}
                              checked={isActive}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F7F2E7]">
                <h2
                  className="text-xl text-[#691D1B]"
                  style={{ fontWeight: 900 }}
                >
                  Catatan Sistem
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Informasi yang berhubungan dengan transaksi siswa.
                </p>
              </div>

              <div className="p-6 space-y-4 text-sm text-gray-700">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#691D1B] flex-shrink-0" />
                  <span>Transaksi akan dibuat dengan status awal menunggu pembayaran.</span>
                </div>

                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-[#691D1B] flex-shrink-0" />
                  <span>Setelah pembayaran dikonfirmasi, akses course akan diaktifkan.</span>
                </div>

                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-[#691D1B] flex-shrink-0" />
                  <span>Pembayaran akan diverifikasi setelah transaksi dikirim.</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#D8D7BE] shadow-lg overflow-hidden sticky top-24">
              <div className="p-6 border-b border-[#F7F2E7]">
                <h2
                  className="text-xl text-[#691D1B] mb-5"
                  style={{ fontWeight: 900 }}
                >
                  Ringkasan Pembayaran
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-600">Course</span>
                    <span
                      className="text-sm text-gray-900 text-right"
                      style={{ fontWeight: 800 }}
                    >
                      {course.title}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-600">Kategori</span>
                    <span
                      className="text-sm text-gray-900 text-right"
                      style={{ fontWeight: 800 }}
                    >
                      {categoryName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-600">Metode</span>
                    <span
                      className="text-sm text-gray-900 text-right"
                      style={{ fontWeight: 800 }}
                    >
                      {paymentMethods.find((method) => method.id === paymentMethod)?.title}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-600">Status Course</span>
                    <span
                      className="text-sm text-green-600 text-right"
                      style={{ fontWeight: 800 }}
                    >
                      {course.status || "active"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-end mb-6">
                  <span
                    className="text-base text-gray-900"
                    style={{ fontWeight: 800 }}
                  >
                    Total
                  </span>

                  <span
                    className="text-3xl text-[#691D1B]"
                    style={{ fontWeight: 900 }}
                  >
                    {formatPrice(course.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-white hover:bg-[#4A1412] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ background: "#691D1B", fontWeight: 900 }}
                >
                  <CreditCard className="w-5 h-5" />
                  {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
                </button>

                <div className="mt-5 rounded-xl bg-[#F7F2E7] p-4">
                  <div className="flex gap-3">
                    <LockKeyhole className="w-5 h-5 text-[#691D1B] flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Dengan menekan tombol bayar, sistem akan membuat data transaksi dan mengarahkan kamu ke halaman status pembayaran.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/course/${course.id}`}
                  className="mt-4 flex items-center justify-center gap-1 w-full py-3 text-center rounded-xl border-2 border-[#691D1B] text-[#691D1B] hover:bg-[#691D1B] hover:text-white transition-colors"
                  style={{ fontWeight: 800 }}
                >
                  Cek Detail Lagi
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
