import { Link, router } from '@inertiajs/react';
import BricsLogo from '@/Components/BricsLogo';
import {
  CheckCircle,
  Clock,
  BookOpen,
  CreditCard,
  ArrowLeft,
  Home,
  Shield,
  ChevronRight,
  AlertCircle,
  Receipt,
} from 'lucide-react';

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isNaN(numericPrice)) {
    return `Rp ${numericPrice.toLocaleString('id-ID')}`;
  }

  return String(price || '-');
}

function getCategoryName(course) {
  if (!course?.category) return 'Course';
  if (typeof course.category === 'string') return course.category;
  return course.category.name || 'Course';
}

function formatPaymentMethod(method) {
  if (method === 'transfer_bank') return 'Transfer Bank';
  if (method === 'ewallet') return 'E-Wallet';
  if (method === 'qris') return 'QRIS';

  return method || '-';
}

export default function PaymentStatus({ transaction }) {
  const course = transaction.course;
  const isSuccess = transaction.payment_status === 'success';
  const isPending = transaction.payment_status === 'pending';

  const confirmPayment = () => {
    router.post(`/payment-status/${transaction.id}/confirm`);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#F7F2E7',
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
              href="/dashboard"
              className="px-4 py-2 text-sm text-gray-700 hover:text-[#691D1B] hover:bg-[#F7F2E7] rounded-md transition-colors"
              style={{ fontWeight: 500 }}
            >
              Dashboard
            </Link>
          </nav>

          <Link
            href="/"
            className="px-5 py-2 text-sm text-white bg-[#691D1B] rounded-md hover:bg-[#4A1412] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Kembali
          </Link>
        </div>
      </header>

      <section className="bg-[#691D1B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FFE882] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FFE882] -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
          <Link
            href="/#katalog"
            className="inline-flex items-center gap-2 text-[#FFE882]/85 hover:text-[#FFE882] text-sm mb-6"
            style={{ fontWeight: 700 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#FFE882' }}
            >
              {isSuccess ? (
                <CheckCircle className="w-9 h-9 text-[#691D1B]" />
              ) : (
                <Clock className="w-9 h-9 text-[#691D1B]" />
              )}
            </div>

            <div>
              <span
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#FFE882] text-xs px-4 py-2 rounded-full mb-3"
                style={{ fontWeight: 800 }}
              >
                Status Pembayaran
              </span>

              <h1
                className="text-3xl lg:text-4xl text-white mb-3"
                style={{ fontWeight: 900, lineHeight: 1.2 }}
              >
                {isSuccess ? 'Pembayaran Berhasil' : 'Transaksi Berhasil Dibuat'}
              </h1>

              <p className="text-[#D8D7BE] text-sm lg:text-base leading-relaxed">
                {isPending
                  ? 'Transaksi kamu sudah tercatat di sistem dan menunggu simulasi konfirmasi pembayaran.'
                  : 'Status pembayaran sudah berhasil. Course dapat diakses melalui dashboard siswa.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#F7F2E7] flex items-center gap-3">
              <Receipt className="w-5 h-5 text-[#691D1B]" />
              <div>
                <h2
                  className="text-xl text-[#691D1B]"
                  style={{ fontWeight: 900 }}
                >
                  Detail Transaksi
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Informasi pembayaran yang tersimpan di database.
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="border border-[#D8D7BE] rounded-2xl p-5 bg-[#FDFCF8]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#F8EDED] flex items-center justify-center text-[#691D1B]">
                      <BookOpen className="w-5 h-5" />
                    </div>

                    <div>
                      <h3
                        className="text-gray-900"
                        style={{ fontWeight: 900 }}
                      >
                        Detail Course
                      </h3>
                      <p className="text-xs text-gray-500">
                        Course yang dibeli siswa.
                      </p>
                    </div>
                  </div>

                  <p
                    className="text-lg text-[#691D1B] mb-2"
                    style={{ fontWeight: 900 }}
                  >
                    {course?.title || 'Course'}
                  </p>

                  <span
                    className="inline-flex px-3 py-1 rounded-full text-xs"
                    style={{
                      background: '#FFE882',
                      color: '#691D1B',
                      fontWeight: 800,
                    }}
                  >
                    {getCategoryName(course)}
                  </span>
                </div>

                <div className="border border-[#D8D7BE] rounded-2xl p-5 bg-[#FDFCF8]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#F8EDED] flex items-center justify-center text-[#691D1B]">
                      <CreditCard className="w-5 h-5" />
                    </div>

                    <div>
                      <h3
                        className="text-gray-900"
                        style={{ fontWeight: 900 }}
                      >
                        Detail Pembayaran
                      </h3>
                      <p className="text-xs text-gray-500">
                        Ringkasan metode dan nominal.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Total</span>
                      <span
                        className="text-[#691D1B] text-right"
                        style={{ fontWeight: 900 }}
                      >
                        {formatPrice(transaction.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Metode</span>
                      <span
                        className="text-gray-900 text-right"
                        style={{ fontWeight: 800 }}
                      >
                        {formatPaymentMethod(transaction.payment_method)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Status</span>
                      <span
                        className={isSuccess ? 'text-green-600' : 'text-yellow-600'}
                        style={{ fontWeight: 900 }}
                      >
                        {transaction.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-5 border ${
                  isSuccess
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex gap-3">
                  {isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  )}

                  <div>
                    <p
                      className={isSuccess ? 'text-green-800' : 'text-yellow-800'}
                      style={{ fontWeight: 900 }}
                    >
                      {isSuccess ? 'Course sudah aktif' : 'Menunggu konfirmasi pembayaran'}
                    </p>

                    <p
                      className={`text-sm leading-relaxed mt-1 ${
                        isSuccess ? 'text-green-700' : 'text-yellow-700'
                      }`}
                    >
                      {isSuccess
                        ? 'Pembayaran sudah berhasil. Kamu dapat membuka dashboard siswa untuk mengakses course, materi, dan jadwal pembelajaran.'
                        : 'Untuk tahap development ini, transaksi sudah berhasil tersimpan di database dengan status pending. Klik tombol simulasi untuk mengubah status menjadi success.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#D8D7BE] shadow-lg overflow-hidden sticky top-24">
              <div className="p-6 border-b border-[#F7F2E7]">
                <h2
                  className="text-xl text-[#691D1B] mb-5"
                  style={{ fontWeight: 900 }}
                >
                  Ringkasan Status
                </h2>

                <div
                  className={`rounded-2xl p-5 text-center ${
                    isSuccess ? 'bg-green-50' : 'bg-yellow-50'
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      isSuccess ? 'bg-green-100' : 'bg-yellow-100'
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle className="w-9 h-9 text-green-700" />
                    ) : (
                      <Clock className="w-9 h-9 text-yellow-700" />
                    )}
                  </div>

                  <p
                    className={isSuccess ? 'text-green-800' : 'text-yellow-800'}
                    style={{ fontWeight: 900 }}
                  >
                    {isSuccess ? 'Success' : 'Pending'}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    ID Transaksi #{transaction.id}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {isPending ? (
                  <button
                    type="button"
                    onClick={confirmPayment}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white hover:bg-[#4A1412] transition-colors"
                    style={{ background: '#691D1B', fontWeight: 900 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Simulasikan Pembayaran Berhasil
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white hover:bg-[#4A1412] transition-colors"
                    style={{ background: '#691D1B', fontWeight: 900 }}
                  >
                    <Home className="w-5 h-5" />
                    Lihat Dashboard
                  </Link>
                )}

                <Link
                  href="/#katalog"
                  className="w-full flex items-center justify-center gap-1 py-3.5 rounded-xl border-2 border-[#691D1B] text-[#691D1B] hover:bg-[#691D1B] hover:text-white transition-colors"
                  style={{ fontWeight: 800 }}
                >
                  Kembali ke Katalog
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {course?.id && (
                  <Link
                    href={`/course/${course.id}`}
                    className="w-full flex items-center justify-center gap-1 py-3.5 rounded-xl bg-[#F7F2E7] text-[#691D1B] hover:bg-[#EFE8D8] transition-colors"
                    style={{ fontWeight: 800 }}
                  >
                    Detail Course
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="px-6 pb-6">
                <div className="rounded-xl bg-[#F7F2E7] p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-[#691D1B] flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Data transaksi ini tersimpan pada sistem dan digunakan untuk mengaktifkan akses course siswa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}