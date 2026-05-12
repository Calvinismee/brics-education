import { useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  Download,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Maximize,
  Pencil,
  Play,
  SkipBack,
  SkipForward,
  Star,
  User,
  Volume2,
} from 'lucide-react';

function getInitials(name) {
  if (!name) return 'SI';

  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getCategoryName(course) {
  if (!course?.category) return 'Paket Intensif UTBK';
  if (typeof course.category === 'string') return course.category;
  return course.category.name || 'Paket Intensif UTBK';
}

function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getMaterialLabel(type) {
  if (type === 'video') return 'Video';
  if (type === 'module') return 'Modul PDF';
  if (type === 'bank_soal') return 'Bank Soal';
  return 'Materi';
}

function getMaterialDuration(index) {
  const durations = ['15 mnt', '30 mnt', '45 mnt', '60 mnt', '90 mnt'];
  return durations[index % durations.length];
}

function getDifficulty(index) {
  const difficulties = [
    { label: 'Sedang', className: 'bg-yellow-100 text-yellow-700' },
    { label: 'Sulit', className: 'bg-pink-100 text-pink-700' },
    { label: 'Mudah', className: 'bg-green-100 text-green-700' },
  ];

  return difficulties[index % difficulties.length];
}

export default function CourseLearn({
  user,
  course,
  materials = [],
  enrollment,
}) {
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [activeResourceTab, setActiveResourceTab] = useState('module');

  const courseTitle = course?.title || 'Bundling Tryout UTBK-SNBT';
  const categoryName = getCategoryName(course);

  const normalizedMaterials = useMemo(() => {
    return materials.map((material, index) => ({
      ...material,
      title: material.title || `Materi ${index + 1}`,
      duration: getMaterialDuration(index),
    }));
  }, [materials]);

  const hasMaterials = normalizedMaterials.length > 0;

  const activeMaterial = hasMaterials
    ? normalizedMaterials[activeMaterialIndex] || normalizedMaterials[0]
    : null;

  const moduleMaterials = normalizedMaterials.filter(
    (material) => material.type === 'module'
  );

  const bankMaterials = normalizedMaterials.filter(
    (material) => material.type === 'bank_soal'
  );

  const completedCount = Math.min(2, normalizedMaterials.length);

  const subtesItems = [
    {
      title: 'Penalaran Umum',
      description: 'Kemampuan memahami, menganalisis, dan menarik kesimpulan dari informasi.',
      progress: hasMaterials ? 20 : 0,
      color: '#691D1B',
      active: true,
    },
    {
      title: 'Pengetahuan Kuantitatif',
      description: 'Kemampuan menggunakan angka, logika matematika, dan penalaran kuantitatif.',
      progress: hasMaterials ? 15 : 0,
      color: '#0F7A45',
      active: false,
    },
    {
      title: 'Literasi Bahasa Indonesia',
      description: 'Kemampuan memahami bacaan, struktur teks, dan makna bahasa Indonesia.',
      progress: hasMaterials ? 10 : 0,
      color: '#2447C6',
      active: false,
    },
    {
      title: 'Literasi Bahasa Inggris',
      description: 'Kemampuan memahami teks bahasa Inggris dalam konteks akademik.',
      progress: hasMaterials ? 10 : 0,
      color: '#D5A018',
      active: false,
    },
    {
      title: 'Penalaran Matematika',
      description: 'Kemampuan menyelesaikan masalah matematika berbasis penalaran.',
      progress: hasMaterials ? 25 : 0,
      color: '#7C3AED',
      active: false,
    },
  ];

  const averageProgress = Math.round(
    subtesItems.reduce((total, item) => total + item.progress, 0) /
      subtesItems.length
  );

  const logout = () => {
    router.post(route('logout'));
  };

  const openMaterial = (material) => {
    if (material?.file_url) {
      window.open(material.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#F7F2E7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div
            className="sticky top-0 h-screen flex flex-col text-white overflow-y-auto"
            style={{ background: '#741A18' }}
          >
            <div className="px-5 py-5 border-b border-white/10">
              <p className="text-xs tracking-[0.35em] text-[#FFE882] mb-3">
                BRICS EDUCATION
              </p>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl" style={{ fontWeight: 900 }}>
                    Siswa Panel
                  </h2>
                  <p className="text-xs text-white/60 mt-1">
                    Area pembelajaran siswa
                  </p>
                </div>

                <span
                  className="px-3 py-1 rounded-full border text-xs"
                  style={{
                    borderColor: '#C8943A',
                    color: '#FFE882',
                    fontWeight: 800,
                  }}
                >
                  LIVE
                </span>
              </div>
            </div>

            <div className="px-5 py-5 border-b border-white/10">
              <div className="rounded-2xl p-4 bg-white/10 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                      style={{
                        background: '#FFE882',
                        color: '#691D1B',
                        fontWeight: 900,
                      }}
                    >
                      {getInitials(user?.name)}
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        {user?.name || 'Siswa Brics'}
                      </p>
                      <p className="text-xs text-white/70">{categoryName}</p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="text-[#FFE882] hover:scale-110 transition-transform"
                    title="Edit Profil"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-white/80">Progres Belajar</span>
                  <span className="text-[#FFE882] font-black">
                    {averageProgress}%
                  </span>
                </div>

                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${averageProgress}%`,
                      background: '#FFE882',
                    }}
                  />
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-5 space-y-2">
              <Link
                href="/dashboard"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/90 hover:bg-white/10 transition-colors"
                style={{ fontWeight: 800 }}
              >
                <Home className="w-5 h-5" />
                Beranda
              </Link>

              <Link
                href="/#katalog"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/90 hover:bg-white/10 transition-colors"
                style={{ fontWeight: 800 }}
              >
                <Star className="w-5 h-5" />
                Lihat Katalog
              </Link>

              <div
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[#691D1B]"
                style={{ background: '#FFE882', fontWeight: 800 }}
              >
                <span className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  Subtes UTBK
                </span>
                <ChevronDown className="w-4 h-4" />
              </div>

              <div className="ml-6 pl-4 border-l border-white/20 space-y-4 py-2">
                {subtesItems.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-xl px-3 py-2 ${
                      item.active ? 'bg-[#FFE882] text-[#691D1B]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span
                        className={`text-sm font-bold ${
                          item.active ? 'text-[#691D1B]' : 'text-white/90'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div className="ml-4">
                      <div
                        className={`w-full h-1.5 rounded-full overflow-hidden ${
                          item.active ? 'bg-[#E8C95A]' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.progress}%`,
                            background: item.active ? '#691D1B' : '#FFE882',
                          }}
                        />
                      </div>

                      <p
                        className={`text-xs mt-1 ${
                          item.active ? 'text-[#691D1B]' : 'text-white/60'
                        }`}
                      >
                        {item.progress}% selesai
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/90 hover:bg-white/10 transition-colors"
                style={{ fontWeight: 800 }}
              >
                <CalendarDays className="w-5 h-5" />
                Jadwal
              </Link>
            </nav>

            <div className="px-4 py-5 border-t border-white/10 space-y-2 mt-auto">
              <Link
                href="/profile"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/90 hover:bg-white/10 transition-colors"
                style={{ fontWeight: 800 }}
              >
                <User className="w-5 h-5" />
                Edit Profil
              </Link>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/90 hover:bg-white/10 transition-colors"
                style={{ fontWeight: 800 }}
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="bg-white border-b border-[#D8D7BE] sticky top-0 z-40 shadow-sm">
            <div className="px-5 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F7F2E7] text-gray-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>

                <div>
                  <p className="text-xs tracking-[0.35em] text-[#A56D6B] mb-1">
                    MATERI SISWA
                  </p>

                  <h1
                    className="text-2xl text-gray-900"
                    style={{ fontWeight: 900 }}
                  >
                    {courseTitle}
                  </h1>

                  <p className="text-sm text-gray-400">
                    Paket bundling subtes UTBK-SNBT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                  <Bell className="w-6 h-6 text-gray-700" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                </div>

                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: '#741A18',
                    color: '#FFE882',
                    fontWeight: 900,
                  }}
                >
                  {getInitials(user?.name)}
                </div>
              </div>
            </div>
          </header>

          <div className="bg-white border-b border-[#D8D7BE] px-5 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-gray-900 font-bold">
                {courseTitle} — {enrollment?.status || 'active'}
              </span>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <span className="text-sm text-gray-500">
                Aktif sejak {formatDate(enrollment?.enrolled_at)}
              </span>
            </div>

            <span
              className="inline-flex self-start sm:self-auto px-4 py-1 rounded-full text-sm"
              style={{
                background: '#FFE882',
                color: '#691D1B',
                fontWeight: 900,
              }}
            >
              Akses Materi
            </span>
          </div>

          <main className="px-5 lg:px-8 py-8">
            {!hasMaterials ? (
              <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#F7F2E7]">
                  <h2
                    className="text-2xl text-[#691D1B]"
                    style={{ fontWeight: 900 }}
                  >
                    Daftar Subtes UTBK
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Paket bundling ini berisi beberapa subtes UTBK. Materi, video, modul PDF, dan bank soal akan tampil setelah data materi ditambahkan ke database.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {subtesItems.map((subtes) => (
                      <div
                        key={subtes.title}
                        className="border border-[#D8D7BE] rounded-2xl p-5 bg-[#FDFCF8] hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: '#F8EDED',
                              color: subtes.color,
                            }}
                          >
                            <BookOpen className="w-6 h-6" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: subtes.color }}
                              />
                              <h3
                                className="text-[#691D1B]"
                                style={{ fontWeight: 900 }}
                              >
                                {subtes.title}
                              </h3>
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                              {subtes.description}
                            </p>

                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">
                                Progress belajar
                              </span>
                              <span
                                className="text-xs"
                                style={{
                                  color: subtes.color,
                                  fontWeight: 900,
                                }}
                              >
                                {subtes.progress}%
                              </span>
                            </div>

                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${subtes.progress}%`,
                                  background: subtes.color,
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              disabled
                              className="w-full py-3 rounded-xl text-sm bg-[#F7F2E7] text-gray-400 cursor-not-allowed"
                              style={{ fontWeight: 900 }}
                            >
                              Materi belum tersedia
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl bg-[#F7F2E7] border border-[#D8D7BE] p-5">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Catatan: saat ini paket sudah aktif di akun siswa, tetapi materi untuk subtes belum tersedia di database. Setelah admin menambahkan data pada tabel <strong>materials</strong> untuk course ini, halaman belajar akan otomatis menampilkan video player, daftar materi, modul PDF, dan bank soal.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/dashboard"
                      className="flex-1 text-center py-3 rounded-xl text-white"
                      style={{
                        background: '#691D1B',
                        fontWeight: 900,
                      }}
                    >
                      Kembali ke Dashboard
                    </Link>

                    <Link
                      href="/#katalog"
                      className="flex-1 text-center py-3 rounded-xl border-2 border-[#691D1B] text-[#691D1B] hover:bg-[#691D1B] hover:text-white transition-colors"
                      style={{ fontWeight: 900 }}
                    >
                      Lihat Katalog
                    </Link>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 mb-8">
                  <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
                    <div className="relative h-[360px] lg:h-[520px] bg-[#0F172A] flex items-center justify-center">
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => openMaterial(activeMaterial)}
                          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 hover:scale-105 transition-transform"
                          style={{
                            background: '#FFE882',
                            color: '#691D1B',
                          }}
                        >
                          <Play className="w-10 h-10 ml-1" />
                        </button>

                        <p className="text-white text-lg">
                          {activeMaterial?.type === 'video'
                            ? 'Klik untuk memulai video'
                            : 'Klik untuk membuka materi'}
                        </p>

                        <p className="text-gray-400 text-sm mt-2">
                          {activeMaterial?.title}
                        </p>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-600">
                        <div
                          className="h-full"
                          style={{
                            width: '35%',
                            background: '#FFE882',
                          }}
                        />
                      </div>
                    </div>

                    <div className="px-6 py-5">
                      <h2
                        className="text-2xl text-gray-900 mb-2"
                        style={{ fontWeight: 900 }}
                      >
                        {activeMaterial?.title} — {courseTitle}
                      </h2>

                      <p className="text-sm text-gray-400">
                        Jenis: {getMaterialLabel(activeMaterial?.type)} • Durasi: {activeMaterial?.duration}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                              background: '#F7F2E7',
                              color: '#691D1B',
                            }}
                          >
                            <SkipBack className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openMaterial(activeMaterial)}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                            style={{ background: '#741A18' }}
                          >
                            <Play className="w-5 h-5 ml-0.5" />
                          </button>

                          <button
                            type="button"
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                              background: '#F7F2E7',
                              color: '#691D1B',
                            }}
                          >
                            <SkipForward className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                              background: '#F7F2E7',
                              color: '#691D1B',
                            }}
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>0:00 / {activeMaterial?.duration}</span>
                          <button
                            type="button"
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                              background: '#F7F2E7',
                              color: '#691D1B',
                            }}
                          >
                            <Maximize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <aside className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden h-fit xl:sticky xl:top-28">
                    <div
                      className="px-6 py-5"
                      style={{
                        background: '#741A18',
                        color: 'white',
                      }}
                    >
                      <h2 className="text-2xl" style={{ fontWeight: 900 }}>
                        Daftar Materi
                      </h2>
                      <p className="text-sm text-[#FFE882]">
                        {completedCount} dari {normalizedMaterials.length} selesai
                      </p>
                    </div>

                    <div className="max-h-[520px] overflow-y-auto divide-y divide-[#F7F2E7]">
                      {normalizedMaterials.map((material, index) => {
                        const isDone = index < completedCount;
                        const isActive = index === activeMaterialIndex;

                        return (
                          <button
                            key={material.id}
                            type="button"
                            onClick={() => setActiveMaterialIndex(index)}
                            className={`w-full px-5 py-5 text-left flex items-center gap-4 hover:bg-[#F7F2E7] transition-colors ${
                              isActive ? 'bg-[#FFF7D6]' : 'bg-white'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-7 h-7 text-[#691D1B]" />
                              ) : (
                                <Circle className="w-7 h-7 text-gray-300" />
                              )}
                            </div>

                            <div className="flex-1">
                              <p
                                className="text-gray-900"
                                style={{ fontWeight: 800 }}
                              >
                                {material.title}
                              </p>
                              <p className="text-sm text-gray-400">
                                {getMaterialLabel(material.type)} • {material.duration}
                              </p>
                            </div>

                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                </div>

                <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
                  <div className="flex border-b border-[#D8D7BE]">
                    <button
                      type="button"
                      onClick={() => setActiveResourceTab('module')}
                      className={`flex items-center gap-2 px-8 py-5 text-lg ${
                        activeResourceTab === 'module'
                          ? 'text-[#691D1B] border-b-2 border-[#691D1B]'
                          : 'text-gray-500'
                      }`}
                      style={{ fontWeight: 800 }}
                    >
                      <FileText className="w-5 h-5" />
                      Modul PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveResourceTab('bank')}
                      className={`flex items-center gap-2 px-8 py-5 text-lg ${
                        activeResourceTab === 'bank'
                          ? 'text-[#691D1B] border-b-2 border-[#691D1B]'
                          : 'text-gray-500'
                      }`}
                      style={{ fontWeight: 800 }}
                    >
                      <HelpCircle className="w-5 h-5" />
                      Bank Soal
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {activeResourceTab === 'module' && (
                      <>
                        {moduleMaterials.length === 0 ? (
                          <div className="text-center py-10">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-[#691D1B]" />
                            <h3 className="text-[#691D1B] font-black">
                              Belum Ada Modul PDF
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Modul PDF untuk course ini belum tersedia.
                            </p>
                          </div>
                        ) : (
                          moduleMaterials.map((material, index) => (
                            <div
                              key={`module-${material.id}`}
                              className="border border-[#D8D7BE] rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#F8EDED] flex items-center justify-center text-[#691D1B]">
                                  <FileText className="w-6 h-6" />
                                </div>

                                <div>
                                  <h3
                                    className="text-lg text-gray-900"
                                    style={{ fontWeight: 900 }}
                                  >
                                    {material.title || `Modul ${index + 1}`}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    {material.file_url
                                      ? 'File tersedia'
                                      : 'Konten tersedia di halaman ini'}
                                  </p>
                                </div>
                              </div>

                              {material.file_url ? (
                                <a
                                  href={material.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white"
                                  style={{
                                    background: '#741A18',
                                    fontWeight: 900,
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                  Unduh
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveMaterialIndex(
                                      normalizedMaterials.findIndex(
                                        (item) => item.id === material.id
                                      )
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white"
                                  style={{
                                    background: '#741A18',
                                    fontWeight: 900,
                                  }}
                                >
                                  Buka
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </>
                    )}

                    {activeResourceTab === 'bank' && (
                      <>
                        {bankMaterials.length === 0 ? (
                          <div className="text-center py-10">
                            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-[#691D1B]" />
                            <h3 className="text-[#691D1B] font-black">
                              Belum Ada Bank Soal
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Bank soal untuk course ini belum tersedia.
                            </p>
                          </div>
                        ) : (
                          bankMaterials.map((material, index) => {
                            const difficulty = getDifficulty(index);

                            return (
                              <div
                                key={`bank-${material.id}`}
                                className="border border-[#D8D7BE] rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-xl bg-[#F7F2E7] flex items-center justify-center text-[#691D1B]">
                                    <HelpCircle className="w-6 h-6" />
                                  </div>

                                  <div>
                                    <h3
                                      className="text-lg text-gray-900"
                                      style={{ fontWeight: 900 }}
                                    >
                                      {material.title || `Bank Soal ${index + 1}`}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                                      <span className="px-3 py-1 rounded-full bg-[#FFF1DF] text-[#691D1B]">
                                        Pilihan Ganda
                                      </span>
                                      <span
                                        className={`px-3 py-1 rounded-full ${difficulty.className}`}
                                      >
                                        {difficulty.label}
                                      </span>
                                      <span className="text-gray-400">
                                        {index % 2 === 0 ? '20 soal' : '10 soal'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openMaterial(material)}
                                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-white"
                                  style={{
                                    background: '#741A18',
                                    fontWeight: 900,
                                  }}
                                >
                                  Kerjakan
                                </button>
                              </div>
                            );
                          })
                        )}
                      </>
                    )}
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}