import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import {
  ArrowLeft,
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
  Menu,
  Pencil,
  Play,
  Star,
  Video,
  X,
} from 'lucide-react';
import { DashboardNotificationBell } from '@/Components/DashboardNotificationBell';
import { StagedLoadingContent } from '@/Components/ui/LoadingStates';
import { courseLearnHref } from '@/utils/slug';

const studentSidebarScrollKey = 'brics-student-sidebar-scroll-top';

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

function progressRecordsToMap(records) {
  const map = {};
  const rows = Array.isArray(records) ? records : Object.values(records ?? {});

  rows.forEach((record) => {
    if (record?.course_id) {
      map[record.course_id] = Number(record.percent ?? 0);
    }
  });

  return map;
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
  progressRecords = [],
}) {
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(null);
  const [activeResourceTab, setActiveResourceTab] = useState('video');
  const [videoPreview, setVideoPreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subtesOpen, setSubtesOpen] = useState(true);
  const [progressMap, setProgressMap] = useState(() => progressRecordsToMap(progressRecords));
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const sidebarScrollRef = useRef(null);
  const profileForm = useForm({
    name: user?.name ?? '',
    gender: user?.gender ?? '',
    phone: user?.phone ?? '',
    school_origin: user?.school_origin ?? '',
  });

  const courseTitle = course?.title || 'Bundling Tryout UTBK-SNBT';
  const categoryName = getCategoryName(course);

  useEffect(() => {
    setProgressMap(progressRecordsToMap(progressRecords));
  }, [progressRecords]);

  useEffect(() => {
    fetch('/student/progress')
      .then((res) => res.json())
      .then((data) => {
        setProgressMap(progressRecordsToMap(data.courses));
      })
      .catch(() => {});
  }, []);

  const normalizedMaterials = useMemo(() => {
    return [...materials]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .map((material, index) => ({
        ...material,
        title: material.title || `Materi ${index + 1}`,
        duration: getMaterialDuration(index),
      }));
  }, [materials]);

  const currentCourseProgress = Number(progressMap[course?.id] ?? 0);

  // Track progress (after normalizedMaterials is defined)
  useEffect(() => {
    if (!course?.id || normalizedMaterials.length === 0 || activeMaterialIndex === null) return;

    const activeTrackedMaterial = normalizedMaterials[activeMaterialIndex];
    if (!activeTrackedMaterial) return;

    const materialsViewed = activeMaterialIndex + 1;
    const percent = Math.round((materialsViewed / normalizedMaterials.length) * 100);
    const nextPercent = Math.max(currentCourseProgress, percent);

    setProgressMap((current) => ({
      ...current,
      [course.id]: Math.max(Number(current[course.id] ?? 0), nextPercent),
    }));

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
        material_id: activeTrackedMaterial.id,
        percent: nextPercent,
        status: 'in_progress',
      }),
    }).catch(() => {});
  }, [activeMaterialIndex, course?.id, currentCourseProgress, normalizedMaterials]);

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

  const completedCount = Math.min(
    normalizedMaterials.length,
    Math.max(
      activeMaterialIndex !== null ? activeMaterialIndex + 1 : 0,
      Math.round((currentCourseProgress / 100) * normalizedMaterials.length)
    )
  );
  const courseColors = ['#691D1B', '#0F7A45', '#2447C6', '#D5A018', '#7C3AED', '#C2410C', '#0F766E'];
  const activeEnrollments = Array.isArray(enrollments) ? enrollments : Object.values(enrollments ?? {});
  const sidebarCourseItems = activeEnrollments.length > 0
    ? activeEnrollments.map((item, index) => {
      const enrolledCourse = item.course ?? {};
      const color = courseColors[index % courseColors.length];
      const materialCount = Number(enrolledCourse.approved_materials_count ?? 0);

      return {
        id: item.course_id,
        title: enrolledCourse.title || `Course ${index + 1}`,
        description: enrolledCourse.description || 'Course aktif yang sudah terdaftar di akun siswa.',
        progress: Number(progressMap[item.course_id] ?? 0),
        color,
        active: Number(item.course_id) === Number(course?.id),
        href: courseLearnHref(enrolledCourse, item.course_id),
        hasMaterials: materialCount > 0,
        materialCount,
      };
    })
    : [
      {
        id: course?.id ?? 'current',
        title: courseTitle,
        description: course?.description || 'Course aktif yang sudah terdaftar di akun siswa.',
        progress: Number(progressMap[course?.id] ?? 0),
        color: '#691D1B',
        active: true,
        href: courseLearnHref(course),
        hasMaterials,
        materialCount: normalizedMaterials.length,
      },
    ];

  const averageProgress = Math.round(
    sidebarCourseItems.reduce((total, item) => total + item.progress, 0) /
      Math.max(sidebarCourseItems.length, 1)
  );

  const logout = () => {
    router.post(route('logout'));
  };

  const openProfileEditor = () => {
    profileForm.setData({
      name: user?.name ?? '',
      gender: user?.gender ?? '',
      phone: user?.phone ?? '',
      school_origin: user?.school_origin ?? '',
    });
    profileForm.clearErrors();
    setProfileEditorOpen(true);
  };

  const closeProfileEditor = () => {
    if (profileForm.processing) return;

    setProfileEditorOpen(false);
  };

  const saveSidebarScroll = (element = sidebarScrollRef.current) => {
    if (typeof window === 'undefined' || !element) return;

    sessionStorage.setItem(studentSidebarScrollKey, String(element.scrollTop));
  };

  const restoreSidebarScroll = (element) => {
    if (typeof window === 'undefined' || !element) return;

    const scrollTop = Number(sessionStorage.getItem(studentSidebarScrollKey) ?? 0);

    if (Number.isFinite(scrollTop) && scrollTop > 0) {
      element.scrollTop = scrollTop;
    }
  };

  const setSidebarScrollElement = (element) => {
    sidebarScrollRef.current = element;
    restoreSidebarScroll(element);
  };

  const closeAndSaveSidebar = () => {
    saveSidebarScroll();
    setSidebarOpen(false);
  };

  const submitProfileEditor = (event) => {
    event.preventDefault();

    profileForm.patch(route('profile.update'), {
      preserveScroll: true,
      onSuccess: () => setProfileEditorOpen(false),
    });
  };

  const materialStatusText = (item) => (
    item.hasMaterials
      ? `${item.materialCount} materi tersedia`
      : 'Materi belum tersedia'
  );

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

  const activeMaterialHasInlineContent = Boolean(
    activeMaterial?.content
      && !activeMaterial?.file_url
      && activeMaterial?.type !== 'video'
      && !isExternalUrl(activeMaterial.content)
  );

  const renderProfileEditorModal = () => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={closeProfileEditor}
        aria-label="Tutup editor profil"
      />

      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-[#F7F2E7] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: '#F8EDED', color: '#691D1B' }}
            >
              <Pencil className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
                Edit Profil
              </h2>
              <p className="truncate text-sm text-gray-500">
                Data diri siswa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeProfileEditor}
            disabled={profileForm.processing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#F7F2E7] hover:text-[#691D1B] disabled:opacity-60"
            aria-label="Tutup editor profil"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submitProfileEditor} className="grid gap-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-bold text-gray-700">Nama Lengkap</span>
            <input
              type="text"
              value={profileForm.data.name}
              onChange={(event) => profileForm.setData('name', event.target.value)}
              disabled={profileForm.processing}
              className="w-full rounded-xl border border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm outline-none transition-colors focus:border-[#691D1B]"
              placeholder="Masukkan nama lengkap"
              autoComplete="name"
              required
            />
            {profileForm.errors.name && (
              <p className="text-xs font-semibold text-red-600">{profileForm.errors.name}</p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-gray-700">Jenis Kelamin</span>
            <select
              value={profileForm.data.gender}
              onChange={(event) => profileForm.setData('gender', event.target.value)}
              disabled={profileForm.processing}
              className="w-full rounded-xl border border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm outline-none transition-colors focus:border-[#691D1B]"
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
            {profileForm.errors.gender && (
              <p className="text-xs font-semibold text-red-600">{profileForm.errors.gender}</p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-gray-700">No Telepon/WhatsApp</span>
            <input
              type="tel"
              value={profileForm.data.phone}
              onChange={(event) => profileForm.setData('phone', event.target.value)}
              disabled={profileForm.processing}
              className="w-full rounded-xl border border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm outline-none transition-colors focus:border-[#691D1B]"
              placeholder="Contoh: 081234567890"
              autoComplete="tel"
            />
            {profileForm.errors.phone && (
              <p className="text-xs font-semibold text-red-600">{profileForm.errors.phone}</p>
            )}
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-bold text-gray-700">Sekolah Asal</span>
            <input
              type="text"
              value={profileForm.data.school_origin}
              onChange={(event) => profileForm.setData('school_origin', event.target.value)}
              disabled={profileForm.processing}
              className="w-full rounded-xl border border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm outline-none transition-colors focus:border-[#691D1B]"
              placeholder="Masukkan nama sekolah asal"
              autoComplete="organization"
            />
            {profileForm.errors.school_origin && (
              <p className="text-xs font-semibold text-red-600">{profileForm.errors.school_origin}</p>
            )}
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-[#F7F2E7] pt-4 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="button"
              onClick={closeProfileEditor}
              disabled={profileForm.processing}
              className="rounded-xl border border-[#D8D7BE] px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-[#F7F2E7] disabled:opacity-60"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={profileForm.processing}
              className="rounded-xl px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#4A1412] disabled:opacity-70"
              style={{ background: '#691D1B' }}
            >
              <StagedLoadingContent loading={profileForm.processing} loadingLabel="Menyimpan..." longLoadingLabel="Masih menyimpan profil...">
                Simpan Profil
              </StagedLoadingContent>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSidebarContent = () => (
    <div
      ref={setSidebarScrollElement}
      onScroll={(event) => saveSidebarScroll(event.currentTarget)}
      className="h-full flex flex-col text-white overflow-y-scroll overflow-x-hidden"
      style={{
        background: '#741A18',
        scrollbarGutter: 'stable',
      }}
    >
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-[10px] tracking-[0.32em] text-[#FFE882] mb-2">
          BRICS EDUCATION
        </p>

        <div>
          <h2 className="text-lg" style={{ fontWeight: 900 }}>
            Siswa Panel
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Area pembelajaran siswa
          </p>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-white/10">
        <div className="rounded-2xl border border-white/15 bg-white/[0.12] p-4 shadow-sm">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center text-base"
              style={{
                background: '#FFE882',
                color: '#691D1B',
                fontWeight: 900,
              }}
            >
              {getInitials(user?.name)}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className="overflow-hidden text-sm leading-snug text-white"
                style={{
                  fontWeight: 900,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
                title={user?.name || 'Siswa Brics'}
              >
                {user?.name || 'Siswa Brics'}
              </p>
              <p className="mt-1.5 truncate text-xs leading-tight text-white/65" title={categoryName}>
                {categoryName}
              </p>
            </div>

            <Link
              href="/dashboard?tab=profil"
              onClick={closeAndSaveSidebar}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{
                background: '#FFE882',
                color: '#691D1B',
              }}
              title="Edit Profil"
              aria-label="Edit Profil"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-white/80">Progres Belajar</span>
              <span className="rounded-full bg-[#FFE882]/20 px-2 py-0.5 text-[#FFE882] font-black">
                {averageProgress}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
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
      </div>

      <nav className="flex-1 px-3.5 py-4 space-y-2">
        <Link
          href="/dashboard"
          onClick={closeAndSaveSidebar}
          className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
          style={{ fontWeight: 800 }}
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm">Beranda</span>
        </Link>

        <Link
          href="/dashboard?tab=katalog"
          onClick={closeAndSaveSidebar}
          className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
          style={{ fontWeight: 800 }}
        >
          <Star className="h-4 w-4 flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm">Lihat Katalog</span>
        </Link>

        <button
          type="button"
          onClick={() => setSubtesOpen((value) => !value)}
          aria-expanded={subtesOpen}
          className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
          style={{ fontWeight: 800 }}
        >
          <span className="flex min-w-0 items-center gap-3 text-sm">
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Subtes UTBK</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 transition-transform ${
              subtesOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {subtesOpen && (
          <div className="ml-5 space-y-2 border-l border-white/20 py-2 pl-3.5">
            {sidebarCourseItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeAndSaveSidebar}
                className={`group block w-full rounded-lg px-2 py-2 text-left transition-colors ${
                  item.active ? 'bg-white/10' : 'hover:bg-white/10'
                }`}
              >
                <div className="mb-1 flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span
                    className={`min-w-0 truncate text-xs font-bold leading-snug ${
                      item.active ? 'text-[#FFE882]' : 'text-white/90 group-hover:text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <div className="ml-4">
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/20">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.progress}%`,
                        background: '#FFE882',
                      }}
                    />
                  </div>

                  <p
                    className={`text-[11px] mt-1 ${
                      item.active || !item.hasMaterials ? 'text-[#FFE882]' : 'text-white/60'
                    }`}
                  >
                    {item.hasMaterials ? `${item.progress}% selesai` : materialStatusText(item)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/dashboard?tab=jadwal"
          onClick={closeAndSaveSidebar}
          className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-all hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
          style={{ fontWeight: 800 }}
        >
          <CalendarDays className="h-4 w-4 flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm">Jadwal</span>
        </Link>

        <Link
          href="/dashboard?tab=profil"
          onClick={closeAndSaveSidebar}
          className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
          style={{ fontWeight: 800 }}
        >
          <Pencil className="h-4 w-4 flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm">Profil</span>
        </Link>
      </nav>

      <div className="px-3.5 py-4 border-t border-white/10 space-y-2 mt-auto">
        <button
          type="button"
          onClick={() => {
            setSidebarOpen(false);
            logout();
          }}
          className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-white/90 transition-colors hover:bg-white/10"
          style={{ fontWeight: 800 }}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm">Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#F7F2E7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div
              ref={setSidebarScrollElement}
              onScroll={(event) => saveSidebarScroll(event.currentTarget)}
              className="sticky top-0 h-screen flex flex-col text-white overflow-y-scroll overflow-x-hidden"
              style={{
              background: '#741A18',
              scrollbarGutter: 'stable',
            }}
          >
            <div className="px-4 py-4 border-b border-white/10">
              <p className="text-[10px] tracking-[0.32em] text-[#FFE882] mb-2">
                BRICS EDUCATION
              </p>

              <div>
                <h2 className="text-lg" style={{ fontWeight: 900 }}>
                  Siswa Panel
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Area pembelajaran siswa
                </p>
              </div>
            </div>

            <div className="px-4 py-4 border-b border-white/10">
              <div className="rounded-2xl border border-white/15 bg-white/[0.12] p-4 shadow-sm">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center text-base"
                    style={{
                      background: '#FFE882',
                      color: '#691D1B',
                      fontWeight: 900,
                    }}
                  >
                    {getInitials(user?.name)}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p
                      className="overflow-hidden text-sm leading-snug text-white"
                      style={{
                        fontWeight: 900,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={user?.name || 'Siswa Brics'}
                    >
                      {user?.name || 'Siswa Brics'}
                    </p>
                    <p className="mt-1.5 truncate text-xs leading-tight text-white/65" title={categoryName}>
                      {categoryName}
                    </p>
                  </div>

                  <Link
                    href="/dashboard?tab=profil"
                    onClick={closeAndSaveSidebar}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
                    style={{
                      background: '#FFE882',
                      color: '#691D1B',
                    }}
                    title="Edit Profil"
                    aria-label="Edit Profil"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-white/80">Progres Belajar</span>
                    <span className="rounded-full bg-[#FFE882]/20 px-2 py-0.5 text-[#FFE882] font-black">
                      {averageProgress}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
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
            </div>

            <nav className="flex-1 px-3.5 py-4 space-y-2">
              <Link
                href="/dashboard"
                onClick={closeAndSaveSidebar}
                className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
                style={{ fontWeight: 800 }}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm">Beranda</span>
              </Link>

              <Link
                href="/dashboard?tab=katalog"
                onClick={closeAndSaveSidebar}
                className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
                style={{ fontWeight: 800 }}
              >
                <Star className="h-4 w-4 flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm">Lihat Katalog</span>
              </Link>

              <button
                type="button"
                onClick={() => setSubtesOpen((value) => !value)}
                aria-expanded={subtesOpen}
                className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
                style={{ fontWeight: 800 }}
              >
                <span className="flex min-w-0 items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Subtes UTBK</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 transition-transform ${
                    subtesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {subtesOpen && (
                <div className="ml-5 space-y-2 border-l border-white/20 py-2 pl-3.5">
                  {sidebarCourseItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={closeAndSaveSidebar}
                      className={`group block w-full rounded-lg px-2 py-2 text-left transition-colors ${
                        item.active ? 'bg-white/10' : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="mb-1 flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span
                          className={`min-w-0 truncate text-xs font-bold leading-snug ${
                            item.active ? 'text-[#FFE882]' : 'text-white/90 group-hover:text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      <div className="ml-4">
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/20">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.progress}%`,
                              background: '#FFE882',
                            }}
                          />
                        </div>

                        <p
                          className={`text-[11px] mt-1 ${
                            item.active || !item.hasMaterials ? 'text-[#FFE882]' : 'text-white/60'
                          }`}
                        >
                          {item.hasMaterials ? `${item.progress}% selesai` : materialStatusText(item)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/dashboard?tab=jadwal"
                onClick={closeAndSaveSidebar}
                className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-all hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
                style={{ fontWeight: 800 }}
              >
                <CalendarDays className="h-4 w-4 flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm">Jadwal</span>
              </Link>

              <Link
                href="/dashboard?tab=profil"
                onClick={closeAndSaveSidebar}
                className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-white/90 transition-colors hover:bg-white/10"
                style={{ fontWeight: 800 }}
              >
                <Pencil className="h-4 w-4 flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm">Profil</span>
              </Link>
            </nav>

            <div className="px-3.5 py-4 border-t border-white/10 space-y-2 mt-auto">
              <button
                type="button"
                onClick={logout}
                className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-white/90 transition-colors hover:bg-white/10"
                style={{ fontWeight: 800 }}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm">Keluar</span>
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup sidebar"
            />

            <div className="relative h-full w-[min(20rem,85vw)]">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#691D1B]"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>

              {renderSidebarContent()}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <header className="bg-white border-b border-[#D8D7BE] sticky top-0 z-40 shadow-sm">
            <div className="px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#D8D7BE] text-[#691D1B] lg:hidden"
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <Link
                  href="/dashboard"
                  className="w-9 h-9 flex-shrink-0 rounded-xl border border-[#D8D7BE] flex items-center justify-center text-[#691D1B] hover:bg-[#F7F2E7]"
                  aria-label="Kembali ke dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.22em] text-[#A56D6B] mb-1 sm:tracking-[0.32em]">
                    MATERI SISWA
                  </p>

                  <h1
                    className="truncate text-lg text-gray-900 sm:text-xl"
                    style={{ fontWeight: 900 }}
                  >
                    {courseTitle}
                  </h1>

                  <p className="truncate text-xs text-gray-400 sm:text-sm">
                    Paket bundling subtes UTBK-SNBT
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-3">
                <DashboardNotificationBell
                  markAllHref="/notifications/mark-all-as-read"
                  historyLabel="Riwayat terbaru siswa"
                />
              </div>
            </div>
          </header>

          <div className="bg-white border-b border-[#D8D7BE] px-4 py-2.5 sm:px-5 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-gray-900 text-sm font-bold">
                {courseTitle} — {enrollment?.status || 'active'}
              </span>
            </div>

            <span
              className="inline-flex self-start sm:self-auto px-3.5 py-1 rounded-full text-xs"
              style={{
                background: hasMaterials ? '#FFE882' : '#FFF6CC',
                color: '#691D1B',
                fontWeight: 900,
              }}
            >
              {hasMaterials ? 'Akses Materi' : 'Materi Belum Tersedia'}
            </span>
          </div>

          <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
            {!hasMaterials ? (
              <section className="min-h-[calc(100vh-190px)] rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                <div className="flex h-full min-h-[420px] items-center justify-center px-4 py-8 sm:min-h-[520px] sm:px-5 sm:py-10">
                  <div className="w-full max-w-2xl text-center">
                    <div
                      className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        background: '#FFF6CC',
                        color: '#691D1B',
                      }}
                    >
                      <BookOpen className="h-8 w-8" />
                    </div>

                    <span
                      className="mb-4 inline-flex rounded-full px-3.5 py-1.5 text-xs"
                      style={{
                        background: '#F7F2E7',
                        color: '#691D1B',
                        fontWeight: 900,
                      }}
                    >
                      {courseTitle}
                    </span>

                    <h2
                      className="text-xl text-[#691D1B] sm:text-2xl md:text-3xl"
                      style={{ fontWeight: 900 }}
                    >
                      Maaf, materi belum tersedia
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-500 md:text-base">
                      Materi untuk subtes ini belum memiliki konten yang disetujui. Setelah tutor atau admin menerbitkan materi, halaman ini akan otomatis menampilkan video, modul, dan bank soal.
                    </p>

                    <div className="mx-auto mt-7 max-w-md rounded-2xl border border-[#D8D7BE] bg-[#FDFCF8] p-4 text-left">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#D5A018]" />
                        <div>
                          <p className="text-sm text-gray-900" style={{ fontWeight: 900 }}>
                            Status materi
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Belum ada materi dengan status disetujui untuk course ini.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/dashboard"
                        className="flex-1 rounded-xl py-3 text-center text-sm text-white"
                        style={{
                          background: '#691D1B',
                          fontWeight: 900,
                        }}
                      >
                        Kembali ke Dashboard
                      </Link>

                      <Link
                        href="/dashboard?tab=katalog"
                        className="flex-1 rounded-xl border-2 border-[#691D1B] py-3 text-center text-sm text-[#691D1B] transition-colors hover:bg-[#691D1B] hover:text-white"
                        style={{ fontWeight: 900 }}
                      >
                        Lihat Katalog
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 mb-6 xl:grid-cols-[1fr_420px] xl:gap-8 xl:mb-8">
                  <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
                    <div className="relative h-[240px] bg-[#0F172A] flex items-center justify-center sm:h-[360px] lg:h-[520px]">
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
                      ) : activeMaterialHasInlineContent ? (
                        <div className="max-w-2xl px-6 text-left">
                          <FileText className="mb-4 h-14 w-14 text-[#FFE882]" />
                          <p className="text-lg font-bold text-white">
                            Materi teks tersedia
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-gray-300">
                            {activeMaterial.content}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FileText className="mx-auto mb-4 h-14 w-14 text-[#FFE882]" />
                          <p className="text-white text-lg font-bold">
                            File materi belum tersedia
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

                    <div className="px-4 py-4 sm:px-6 sm:py-5">
                      <h2
                        className="break-words text-lg text-gray-900 mb-2 sm:text-2xl"
                        style={{ fontWeight: 900 }}
                      >
                        {activeMaterial?.title} — {courseTitle}
                      </h2>

                      <p className="break-words text-sm text-gray-400">
                        Jenis: {getMaterialLabel(activeMaterial?.type)} • Durasi: {activeMaterial?.duration}
                      </p>

                      {activeMaterial?.type !== 'video' && activeMaterial?.file_url ? (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={activeMaterial.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#741A18] px-5 py-3 text-sm text-[#741A18] sm:w-auto"
                            style={{ fontWeight: 900 }}
                          >
                            <Download className="h-4 w-4" />
                            Download File
                          </a>
                        </div>
                      ) : activeMaterial?.type !== 'video' ? (
                        <div className="mt-4 rounded-xl bg-[#F7F2E7] px-4 py-3 text-sm text-gray-500">
                          Materi ini berupa konten teks dan tidak memiliki file lampiran.
                        </div>
                      ) : null}
                    </div>
                  </section>

                  <aside className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden h-fit xl:sticky xl:top-28">
                    <div
                      className="px-4 py-4 sm:px-6 sm:py-5"
                      style={{
                        background: '#741A18',
                        color: 'white',
                      }}
                    >
                      <h2 className="text-xl sm:text-2xl" style={{ fontWeight: 900 }}>
                        Daftar Materi
                      </h2>
                      <p className="text-sm text-[#FFE882]">
                        {completedCount} dari {normalizedMaterials.length} selesai
                      </p>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto divide-y divide-[#F7F2E7] sm:max-h-[520px]">
                      {normalizedMaterials.map((material, index) => {
                        const isDone = index < completedCount;
                        const isActive = index === resolvedActiveIndex;

                        return (
                          <button
                            key={material.id}
                            type="button"
                            onClick={() => setActiveMaterialIndex(index)}
                            className={`w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-[#F7F2E7] transition-colors sm:px-5 sm:py-5 sm:gap-4 ${
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

                            <div className="min-w-0 flex-1">
                              <p
                                className="break-words text-sm text-gray-900 sm:text-base"
                                style={{ fontWeight: 800 }}
                              >
                                {material.title}
                              </p>
                              <p className="break-words text-xs text-gray-400 sm:text-sm">
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
                  <div className="flex overflow-x-auto border-b border-[#D8D7BE]">
                    <button
                      type="button"
                      onClick={() => setActiveResourceTab('video')}
                      className={`flex flex-shrink-0 items-center gap-2 px-4 py-4 text-sm sm:px-8 sm:py-5 sm:text-lg ${
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
                      className={`flex flex-shrink-0 items-center gap-2 px-4 py-4 text-sm sm:px-8 sm:py-5 sm:text-lg ${
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
                      className={`flex flex-shrink-0 items-center gap-2 px-4 py-4 text-sm sm:px-8 sm:py-5 sm:text-lg ${
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

                  <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
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
                                className="border border-[#D8D7BE] rounded-2xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between sm:p-5"
                              >
                                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8EDED] text-[#691D1B] sm:h-14 sm:w-14">
                                    <Video className="w-6 h-6" />
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="break-words text-base text-gray-900 sm:text-lg" style={{ fontWeight: 900 }}>
                                      {material.title || `Video ${index + 1}`}
                                    </h3>
                                    <p className="break-words text-sm text-gray-400">
                                      YouTube - {index === 0 ? 'Terbaru' : `Video ${index + 1}`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMaterialIndex(materialIndex);
                                      setVideoPreview(material);
                                    }}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 rounded-xl text-white sm:w-auto"
                                    style={{ background: '#741A18', fontWeight: 900 }}
                                  >
                                    <Play className="w-4 h-4" />
                                    Preview
                                  </button>
                                  <a
                                    href={youtubeWatchUrl(material.content)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#741A18] text-[#741A18] sm:w-auto"
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
                              className="border border-[#D8D7BE] rounded-2xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between sm:p-5"
                            >
                              <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8EDED] text-[#691D1B] sm:h-14 sm:w-14">
                                  <FileText className="w-6 h-6" />
                                </div>

                                <div className="min-w-0">
                                  <h3
                                    className="break-words text-base text-gray-900 sm:text-lg"
                                    style={{ fontWeight: 900 }}
                                  >
                                    {material.title || `Modul ${index + 1}`}
                                  </h3>
                                  <p className="break-words text-sm text-gray-400">
                                    {material.file_url
                                      ? 'File tersedia'
                                      : 'Konten teks tersedia'}
                                  </p>
                                </div>
                              </div>

                              {material.file_url ? (
                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => openFilePreview(material)}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-white sm:w-auto"
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
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#741A18] px-5 py-3 text-[#741A18] sm:w-auto"
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
                                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 rounded-xl text-white sm:w-auto"
                                  style={{
                                    background: '#741A18',
                                    fontWeight: 900,
                                  }}
                                >
                                  Baca
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
                                className="border border-[#D8D7BE] rounded-2xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between sm:p-5"
                              >
                                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#F7F2E7] text-[#691D1B] sm:h-14 sm:w-14">
                                    <HelpCircle className="w-6 h-6" />
                                  </div>

                                  <div className="min-w-0">
                                    <h3
                                      className="break-words text-base text-gray-900 sm:text-lg"
                                      style={{ fontWeight: 900 }}
                                    >
                                      {material.title || `Bank Soal ${index + 1}`}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:gap-3 sm:text-sm">
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

                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                  {material.file_url && (
                                    <button
                                      type="button"
                                      onClick={() => openFilePreview(material)}
                                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-white sm:w-auto"
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
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#741A18] px-5 py-3 text-[#741A18] sm:w-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#F7F2E7] px-4 py-4 sm:px-5">
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

            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-gray-500">
                Video ini berasal dari materi yang sudah disetujui untuk course ini.
              </p>

              <a
                href={youtubeWatchUrl(videoPreview.content)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm text-white sm:w-auto"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-4">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[88vh]">
              <div className="flex items-center justify-between gap-3 border-b border-[#F7F2E7] px-4 py-4 sm:px-5">
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

              <div className="flex flex-col gap-3 border-t border-[#F7F2E7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-gray-500">
                  Preview mendukung PDF serta DOC/PPT yang tersedia melalui URL publik.
                </p>

                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm text-white sm:w-auto"
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

      {profileEditorOpen && renderProfileEditorModal()}
    </div>
  );
}
