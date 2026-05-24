import { useMemo, useState, useEffect } from 'react';
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
  Eye,
  ExternalLink,
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
  Video,
  Volume2,
  X,
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
  if (type === 'bank_soal' || type === 'quiz') return 'Bank Soal';
  return 'Materi';
}

function getMaterialUrl(material) {
  return material?.file_url || material?.content || '';
}

function isPdfUrl(value) {
  return String(value || '').toLowerCase().split('?')[0].endsWith('.pdf');
}

function fileExtension(value) {
  const clean = String(value || '').split('?')[0].split('#')[0];
  return clean.includes('.') ? clean.split('.').pop().toLowerCase() : '';
}

function isOfficeUrl(value) {
  return ['doc', 'docx', 'ppt', 'pptx'].includes(fileExtension(value));
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

function absoluteUrl(value) {
  const raw = String(value || '');
  if (isExternalUrl(raw)) return raw;
  if (raw.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${raw}`;
  }
  return raw;
}

function isLocalUrl(value) {
  try {
    const host = new URL(value).hostname;
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host);
  } catch {
    return true;
  }
}

function officePreviewUrl(value) {
  const url = absoluteUrl(value);
  if (!isExternalUrl(url) || isLocalUrl(url)) return null;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

function youtubeEmbedUrl(value) {
  try {
    const raw = String(value || '');
    const url = new URL(isExternalUrl(raw) ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.endsWith('youtube.com')) {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      const parts = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0]) && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function youtubeWatchUrl(value) {
  try {
    const raw = String(value || '');
    const url = new URL(isExternalUrl(raw) ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/watch?v=${id}` : raw;
    }

    if (host.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.toString();

      const parts = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0]) && parts[1]) {
        return `https://www.youtube.com/watch?v=${parts[1]}`;
      }
    }

    return url.toString();
  } catch {
    return String(value || '');
  }
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
  enrollments = [],
}) {
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(null);
  const [activeResourceTab, setActiveResourceTab] = useState('video');
  const [videoPreview, setVideoPreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const courseTitle = course?.title || 'Bundling Tryout UTBK-SNBT';
  const categoryName = getCategoryName(course);

  const normalizedMaterials = useMemo(() => {
    return [...materials]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .map((material, index) => ({
        ...material,
        title: material.title || `Materi ${index + 1}`,
        duration: getMaterialDuration(index),
      }));
  }, [materials]);

  // Track progress (after normalizedMaterials is defined)
  useEffect(() => {
    if (!course?.id || normalizedMaterials.length === 0) return;
    const materialsViewed = activeMaterialIndex !== null ? activeMaterialIndex + 1 : 0;
    const percent = Math.round((materialsViewed / normalizedMaterials.length) * 100);

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    fetch('/student/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      body: JSON.stringify({
        course_id: course.id,
        material_id: materials[activeMaterialIndex]?.id || null,
        percent,
        status: 'in_progress',
      }),
    }).catch(() => {});
  }, [activeMaterialIndex, course?.id, materials, normalizedMaterials.length]);

  const hasMaterials = normalizedMaterials.length > 0;
  const videoMaterials = normalizedMaterials.filter(
    (material) => material.type === 'video' && youtubeEmbedUrl(material.content)
  );
  const latestVideoIndex = normalizedMaterials.findIndex(
    (material) => material.type === 'video' && youtubeEmbedUrl(material.content)
  );
  const resolvedActiveIndex = activeMaterialIndex ?? (latestVideoIndex >= 0 ? latestVideoIndex : 0);

  const activeMaterial = hasMaterials
    ? normalizedMaterials[resolvedActiveIndex] || normalizedMaterials[0]
    : null;

  const moduleMaterials = normalizedMaterials.filter(
    (material) => material.type === 'module'
  );

  const bankMaterials = normalizedMaterials.filter(
    (material) => material.type === 'bank_soal' || material.type === 'quiz'
  );

  const completedCount = activeMaterialIndex !== null ? activeMaterialIndex + 1 : 0;
  const courseColors = ['#691D1B', '#0F7A45', '#2447C6', '#D5A018', '#7C3AED', '#C2410C', '#0F766E'];
  const activeEnrollments = Array.isArray(enrollments) ? enrollments : Object.values(enrollments ?? {});
  const sidebarCourseItems = activeEnrollments.length > 0
    ? activeEnrollments.map((item, index) => {
      const enrolledCourse = item.course ?? {};
      const color = courseColors[index % courseColors.length];

      return {
        id: item.course_id,
        title: enrolledCourse.title || `Course ${index + 1}`,
        description: enrolledCourse.description || 'Course aktif yang sudah terdaftar di akun siswa.',
        progress: 0,
        color,
        active: Number(item.course_id) === Number(course?.id),
        href: `/course/${item.course_id}/learn`,
      };
    })
    : [
      {
        id: course?.id ?? 'current',
        title: courseTitle,
        description: course?.description || 'Course aktif yang sudah terdaftar di akun siswa.',
        progress: hasMaterials ? 20 : 0,
        color: '#691D1B',
        active: true,
        href: course?.id ? `/course/${course.id}/learn` : '/dashboard',
      },
    ];

  const averageProgress = Math.round(
    sidebarCourseItems.reduce((total, item) => total + item.progress, 0) /
      Math.max(sidebarCourseItems.length, 1)
  );

  const logout = () => {
    router.post(route('logout'));
  };

  const openMaterial = (material) => {
    const url = getMaterialUrl(material);

    if (url && (isExternalUrl(url) || url.startsWith('/'))) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const openFilePreview = (material) => {
    const materialIndex = normalizedMaterials.findIndex((item) => item.id === material.id);

    if (materialIndex >= 0) {
      setActiveMaterialIndex(materialIndex);
    }

    setFilePreview(material);
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
                {sidebarCourseItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`block rounded-xl px-3 py-2 ${
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
                  </Link>
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
                    Paket bundling ini berisi beberapa subtes UTBK. Materi, video, modul PDF, dan bank soal akan tampil setelah tersedia.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sidebarCourseItems.map((subtes) => (
                      <div
                        key={subtes.id}
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

                            {subtes.active ? (
                              <button
                                type="button"
                                disabled
                                className="w-full py-3 rounded-xl text-sm bg-[#F7F2E7] text-gray-400 cursor-not-allowed"
                                style={{ fontWeight: 900 }}
                              >
                                Materi belum tersedia
                              </button>
                            ) : (
                              <Link
                                href={subtes.href}
                                className="block w-full py-3 rounded-xl text-center text-sm text-white"
                                style={{ background: '#691D1B', fontWeight: 900 }}
                              >
                                Buka Course
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl bg-[#F7F2E7] border border-[#D8D7BE] p-5">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Catatan: saat ini paket sudah aktif di akun siswa, tetapi materi untuk subtes belum tersedia. Setelah materi disetujui, halaman belajar akan otomatis menampilkan video player, daftar materi, modul PDF, dan bank soal.
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
                      {activeMaterial?.file_url && isPdfUrl(activeMaterial.file_url) ? (
                        <iframe
                          src={activeMaterial.file_url}
                          title={activeMaterial.title}
                          className="h-full w-full border-0 bg-white"
                        />
                      ) : activeMaterial?.file_url && isOfficeUrl(activeMaterial.file_url) && officePreviewUrl(activeMaterial.file_url) ? (
                        <iframe
                          src={officePreviewUrl(activeMaterial.file_url)}
                          title={activeMaterial.title}
                          className="h-full w-full border-0 bg-white"
                        />
                      ) : activeMaterial?.file_url && isOfficeUrl(activeMaterial.file_url) ? (
                        <div className="max-w-md px-6 text-center">
                          <FileText className="mx-auto mb-4 h-14 w-14 text-[#FFE882]" />
                          <p className="text-lg font-bold text-white">Preview DOC/PPT membutuhkan URL publik</p>
                          <p className="mt-2 text-sm text-gray-300">
                            Di localhost file tetap bisa dibuka atau diunduh lewat tombol di bawah.
                          </p>
                        </div>
                      ) : activeMaterial?.type === 'video' && youtubeEmbedUrl(activeMaterial?.content) ? (
                        <iframe
                          src={youtubeEmbedUrl(activeMaterial.content)}
                          title={activeMaterial.title}
                          className="h-full w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
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
                      )}

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
                        const isActive = index === resolvedActiveIndex;

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
                      onClick={() => setActiveResourceTab('video')}
                      className={`flex items-center gap-2 px-8 py-5 text-lg ${
                        activeResourceTab === 'video'
                          ? 'text-[#691D1B] border-b-2 border-[#691D1B]'
                          : 'text-gray-500'
                      }`}
                      style={{ fontWeight: 800 }}
                    >
                      <Video className="w-5 h-5" />
                      Video
                    </button>

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
                    {activeResourceTab === 'video' && (
                      <>
                        {videoMaterials.length === 0 ? (
                          <div className="text-center py-10">
                            <Video className="w-12 h-12 mx-auto mb-3 text-[#691D1B]" />
                            <h3 className="text-[#691D1B] font-black">
                              Belum Ada Video
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Video YouTube untuk course ini belum tersedia.
                            </p>
                          </div>
                        ) : (
                          videoMaterials.map((material, index) => {
                            const materialIndex = normalizedMaterials.findIndex((item) => item.id === material.id);

                            return (
                              <div
                                key={`video-${material.id}`}
                                className="border border-[#D8D7BE] rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-xl bg-[#F8EDED] flex items-center justify-center text-[#691D1B]">
                                    <Video className="w-6 h-6" />
                                  </div>

                                  <div>
                                    <h3 className="text-lg text-gray-900" style={{ fontWeight: 900 }}>
                                      {material.title || `Video ${index + 1}`}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                      YouTube - {index === 0 ? 'Terbaru' : `Video ${index + 1}`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMaterialIndex(materialIndex);
                                      setVideoPreview(material);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white"
                                    style={{ background: '#741A18', fontWeight: 900 }}
                                  >
                                    <Play className="w-4 h-4" />
                                    Preview
                                  </button>
                                  <a
                                    href={youtubeWatchUrl(material.content)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#741A18] text-[#741A18]"
                                    style={{ fontWeight: 900 }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    YouTube
                                  </a>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </>
                    )}

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
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openFilePreview(material)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white"
                                    style={{
                                      background: '#741A18',
                                      fontWeight: 900,
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </button>

                                  <a
                                    href={material.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#741A18] px-5 py-3 text-[#741A18]"
                                    style={{ fontWeight: 900 }}
                                  >
                                    <Download className="w-4 h-4" />
                                    Unduh
                                  </a>
                                </div>
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

                                <div className="flex flex-wrap gap-2">
                                  {material.file_url && (
                                    <button
                                      type="button"
                                      onClick={() => openFilePreview(material)}
                                      className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white"
                                      style={{
                                        background: '#741A18',
                                        fontWeight: 900,
                                      }}
                                    >
                                      <Eye className="w-4 h-4" />
                                      Preview
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => openMaterial(material)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#741A18] px-5 py-3 text-[#741A18]"
                                    style={{ fontWeight: 900 }}
                                  >
                                    {material.file_url && <Download className="w-4 h-4" />}
                                    {material.file_url ? 'Unduh' : 'Kerjakan'}
                                  </button>
                                </div>
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

      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F7F2E7] px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#A56D6B]">
                  Preview Video
                </p>
                <h3 className="truncate text-lg text-gray-900" style={{ fontWeight: 900 }}>
                  {videoPreview.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setVideoPreview(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                title="Tutup preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video bg-[#0F172A]">
              <iframe
                src={youtubeEmbedUrl(videoPreview.content)}
                title={videoPreview.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Video ini berasal dari materi yang sudah disetujui untuk course ini.
              </p>

              <a
                href={youtubeWatchUrl(videoPreview.content)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm text-white"
                style={{ background: '#741A18', fontWeight: 900 }}
              >
                <ExternalLink className="h-4 w-4" />
                Tonton di YouTube
              </a>
            </div>
          </div>
        </div>
      )}

      {filePreview && (() => {
        const previewUrl = getMaterialUrl(filePreview);
        const officeUrl = officePreviewUrl(previewUrl);
        const canEmbedPdf = isPdfUrl(previewUrl);
        const canEmbedOffice = isOfficeUrl(previewUrl) && officeUrl;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#F7F2E7] px-5 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#A56D6B]">
                    Preview Materi
                  </p>
                  <h3 className="truncate text-lg text-gray-900" style={{ fontWeight: 900 }}>
                    {filePreview.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setFilePreview(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                  title="Tutup preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 bg-[#0F172A]">
                {canEmbedPdf ? (
                  <iframe
                    src={previewUrl}
                    title={filePreview.title}
                    className="h-full w-full border-0 bg-white"
                  />
                ) : canEmbedOffice ? (
                  <iframe
                    src={officeUrl}
                    title={filePreview.title}
                    className="h-full w-full border-0 bg-white"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <div className="max-w-md">
                      <FileText className="mx-auto mb-4 h-14 w-14 text-[#FFE882]" />
                      <p className="text-lg font-bold text-white">
                        Preview belum tersedia untuk file ini
                      </p>
                      <p className="mt-2 text-sm text-gray-300">
                        File tetap bisa dibuka atau diunduh lewat tombol di bawah.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#F7F2E7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Preview mendukung PDF serta DOC/PPT yang tersedia melalui URL publik.
                </p>

                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm text-white"
                    style={{ background: '#741A18', fontWeight: 900 }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka File
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
