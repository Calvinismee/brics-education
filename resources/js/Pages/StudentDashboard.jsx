import { useState, useEffect, useMemo } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Pencil,
  Star,
  Video,
  ClipboardList,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Package as PackageIcon,
  X,
} from 'lucide-react';
import { StagedLoadingContent } from '@/Components/ui/LoadingStates';
import { courseLearnHref, packageCheckoutHref, transactionStatusHref } from '@/utils/slug';

function asArray(value) {
  if (Array.isArray(value)) return value;
  return Object.values(value ?? {});
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isNaN(numericPrice)) {
    return `Rp ${numericPrice.toLocaleString('id-ID')}`;
  }

  return String(price || '-');
}

function formatDate(dateString) {
  if (!dateString) return '-';

  const date = parseScheduleDate(dateString);

  if (!date) {
    return dateString;
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateString) {
  if (!dateString) return '-';

  const date = parseScheduleDate(dateString);

  if (!date) {
    return dateString;
  }

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseScheduleDate(dateString) {
  if (!dateString) return null;

  const date = new Date(String(dateString).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonday(date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const offset = (day + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function sameLocalDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function createWeekDays(baseDate = new Date()) {
  const today = new Date();
  const monday = getMonday(baseDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      date,
      dateKey: dateKey(date),
      shortLabel: date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      fullLabel: date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      isToday: sameLocalDate(date, today),
    };
  });
}

function getInitials(name) {
  if (!name) return 'SI';

  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function formatGender(gender) {
  if (gender === 'male') return 'Laki-laki';
  if (gender === 'female') return 'Perempuan';

  return '-';
}

function getCategoryName(course) {
  if (!course?.category) return 'Tryout SNBT';
  if (typeof course.category === 'string') return course.category;
  return course.category.name || 'Tryout SNBT';
}

function scheduleType(schedule) {
  const title = String(schedule?.title || '').toLowerCase();

  if (schedule?.type) return schedule.type;
  if (title.includes('tryout')) return 'tryout';
  if (title.includes('deadline') || title.includes('tugas')) return 'student_deadline';
  if (title.includes('konsultasi') || title.includes('consult')) return 'consultation';
  return 'live';
}

const studentScheduleTypes = {
  live: { label: 'Live Class', color: '#691D1B', bg: '#F8EDED', icon: Video, linkLabel: 'Bergabung', needsMeeting: true, location: 'Zoom Meeting' },
  consultation: { label: 'Konsultasi', color: '#0F7A45', bg: '#EAF7F0', icon: FileText, linkLabel: 'Bergabung', needsMeeting: true, location: 'Online Meeting' },
  student_deadline: { label: 'Deadline Tugas', color: '#DB2777', bg: '#FCE7F3', icon: Clock, linkLabel: 'Kumpulkan Tugas', needsActionLink: true, location: 'Link Pengumpulan' },
  tryout: { label: 'Tryout', color: '#2563EB', bg: '#DBEAFE', icon: ClipboardList, linkLabel: 'Buka Tryout', needsActionLink: true, location: 'Platform Tryout' },
};

const studentScheduleConfig = (schedule) => studentScheduleTypes[scheduleType(schedule)] || studentScheduleTypes.live;
const isScheduleCompleted = (schedule, now = new Date()) => {
  if (schedule?.status === 'completed') return true;

  const endTime = parseScheduleDate(schedule?.end_time);
  return endTime ? endTime.getTime() <= now.getTime() : false;
};
const studentScheduleLink = (schedule, now = new Date()) => {
  if (isScheduleCompleted(schedule, now)) return null;

  const config = studentScheduleConfig(schedule);
  return config.needsMeeting ? schedule.meeting_link : schedule.action_link;
};

const dashboardTabs = ['beranda', 'katalog', 'subtes', 'jadwal', 'profil'];

function getInitialDashboardTab() {
  if (typeof window === 'undefined') return 'beranda';

  const tab = new URLSearchParams(window.location.search).get('tab');

  return dashboardTabs.includes(tab) ? tab : 'beranda';
}

export default function StudentDashboard({
  user,
  enrollments = [],
  transactions = [],
  availablePackages = [],
  schedules = [],
  scheduleDays = [],
  scheduleWeek = null,
  scheduleStats = {},
  materials = [],
  notifications: serverNotifications = [],
}) {
  const [activeTab, setActiveTab] = useState(getInitialDashboardTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subtesOpen, setSubtesOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const profileForm = useForm({
    name: user?.name ?? '',
    gender: user?.gender ?? '',
    phone: user?.phone ?? '',
    school_origin: user?.school_origin ?? '',
  });
  const [progressMap, setProgressMap] = useState({});
  const [calendarNow, setCalendarNow] = useState(() => new Date());
  const [scheduleNow, setScheduleNow] = useState(() => new Date());
  const [selectedScheduleDateKey, setSelectedScheduleDateKey] = useState(null);

  useEffect(() => {
    const interval = window.setInterval(() => setScheduleNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/student/progress')
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        (data.courses || []).forEach((c) => {
          if (c.course_id) map[c.course_id] = c.percent;
        });
        setProgressMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const timeout = nextDay.getTime() - new Date().getTime();
    const timer = setTimeout(() => {
      const now = new Date();
      setCalendarNow(now);
      setSelectedScheduleDateKey(null);
    }, timeout + 1000);

    return () => clearTimeout(timer);
  }, [calendarNow]);

  const activeEnrollments = enrollments.filter((item) => item.status === 'active');
  const activePackageEnrollments = activeEnrollments.filter((item) => item.package_id || item.package?.id);
  const hasActivePackage = activePackageEnrollments.length > 0;
  const showStudentSidebar = hasActivePackage;
  const latestEnrollment = activePackageEnrollments[0];
  const activeCourse = latestEnrollment?.course;

  const currentPackageName = hasActivePackage
    ? (latestEnrollment?.package?.name || activeCourse?.title || 'Bundling Tryout UTBK-SNBT')
    : 'Belum ada paket aktif';
  const currentCategoryName = getCategoryName(activeCourse);
  const packageOptions = asArray(availablePackages);

  const pendingTransactions = transactions.filter(
    (item) => item.payment_status === 'pending'
  );
  const pendingPackageTransactions = pendingTransactions.filter((item) => item.package_id || item.package?.id);
  const notificationItems = Array.isArray(serverNotifications)
    ? serverNotifications
    : Object.values(serverNotifications ?? {});
  const materialItems = Array.isArray(materials) ? materials : Object.values(materials ?? {});
  const weekDays = useMemo(() => {
    const serverDays = asArray(scheduleDays);

    if (serverDays.length > 0 && serverDays.every((day) => Array.isArray(day.events))) {
      return serverDays.map((day) => {
        const date = parseScheduleDate(`${day.dayKey}T00:00:00`) ?? new Date();

        return {
          date,
          dateKey: day.dayKey,
          shortLabel: day.dateShort,
          fullLabel: day.date,
          isToday: day.isToday,
          events: day.events,
        };
      });
    }

    return createWeekDays(calendarNow).map((day) => ({
      ...day,
      events: [],
    }));
  }, [calendarNow, scheduleDays]);
  const weekDateKeys = useMemo(
    () => new Set(weekDays.map((day) => day.dateKey)),
    [weekDays]
  );
  const schedulesThisWeek = useMemo(() => {
    if (weekDays.some((day) => day.events.length > 0)) {
      return weekDays.flatMap((day) => day.events);
    }

    return schedules.filter((schedule) => {
      const date = parseScheduleDate(schedule.start_time);
      return date ? weekDateKeys.has(dateKey(date)) : false;
    });
  }, [schedules, weekDateKeys, weekDays]);
  const selectedWeekDay = weekDays.find((day) => day.dateKey === selectedScheduleDateKey)
    ?? weekDays.find((day) => day.isToday)
    ?? weekDays[0];
  const selectedDaySchedules = useMemo(() => {
    if (selectedWeekDay.events.length > 0) {
      return selectedWeekDay.events;
    }

    return schedulesThisWeek.filter((schedule) => {
      const date = parseScheduleDate(schedule.start_time);
      return date ? dateKey(date) === selectedWeekDay.dateKey : false;
    });
  }, [schedulesThisWeek, selectedWeekDay]);

  const fallbackSubtesItems = [
    {
      title: 'Penalaran Umum',
      progress: 0,
      color: '#691D1B',
      iconBg: '#F8EDED',
      iconColor: '#691D1B',
      description:
        'Kemampuan memahami, menganalisis, dan menarik kesimpulan dari informasi.',
    },
    {
      title: 'Pengetahuan Kuantitatif',
      progress: 0,
      color: '#0F7A45',
      iconBg: '#EAF7F0',
      iconColor: '#0F7A45',
      description:
        'Kemampuan menggunakan angka, logika matematika, dan penalaran kuantitatif.',
    },
    {
      title: 'Literasi Bahasa Indonesia',
      progress: 0,
      color: '#2447C6',
      iconBg: '#EEF2FF',
      iconColor: '#2447C6',
      description:
        'Kemampuan memahami bacaan, struktur teks, dan makna bahasa Indonesia.',
    },
    {
      title: 'Literasi Bahasa Inggris',
      progress: 0,
      color: '#D5A018',
      iconBg: '#FFF6CC',
      iconColor: '#D5A018',
      description:
        'Kemampuan memahami teks bahasa Inggris dalam konteks akademik.',
    },
    {
      title: 'Penalaran Matematika',
      progress: 0,
      color: '#7C3AED',
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
      description:
        'Kemampuan menyelesaikan masalah matematika berbasis penalaran.',
    },
  ];
  const courseColors = ['#691D1B', '#0F7A45', '#2447C6', '#D5A018', '#7C3AED', '#C2410C', '#0F766E'];
  const learningItems = hasActivePackage
    ? activePackageEnrollments.map((enrollment, index) => {
      const course = enrollment.course ?? {};
      const color = courseColors[index % courseColors.length];
      const materialCount = Number(course.approved_materials_count ?? 0);

      return {
        id: enrollment.course_id,
        title: course.title || `Course ${index + 1}`,
        category: getCategoryName(course),
        progress: progressMap[enrollment.course_id] ?? 0,
        color,
        iconBg: '#F8EDED',
        iconColor: color,
        description: course.description || 'Course aktif yang sudah terdaftar di akun siswa.',
        href: courseLearnHref(course, enrollment.course_id),
        enrolled: true,
        hasMaterials: materialCount > 0,
        materialCount,
      };
    })
    : fallbackSubtesItems.map((item) => ({
      ...item,
      category: currentCategoryName,
      href: '/dashboard?tab=katalog',
      enrolled: false,
      hasMaterials: false,
      materialCount: 0,
    }));

  const averageProgress = Math.round(
    learningItems.reduce((total, item) => total + item.progress, 0) /
      Math.max(learningItems.length, 1)
  );

  const fallbackNotifications = hasActivePackage
    ? [
      {
        id: 1,
        title: 'Paket aktif',
        message: `${currentPackageName} sedang aktif dan bisa kamu akses dari menu Subtes UTBK.`,
        type: 'course',
        time: 'Terbaru',
      },
      {
        id: 2,
        title: 'Jadwal pembelajaran',
        message:
          schedules.length > 0
            ? `${schedules.length} jadwal tersedia untuk course aktifmu.`
            : 'Belum ada jadwal terbaru.',
        type: 'schedule',
        time: 'Hari ini',
      },
      {
        id: 3,
        title: 'Status pembayaran',
        message:
          pendingTransactions.length > 0
            ? `${pendingTransactions.length} transaksi masih pending.`
            : 'Tidak ada transaksi pending.',
        type: 'payment',
        time: 'Info',
      },
    ]
    : [
      {
        id: 1,
        title: 'Pilih paket',
        message: 'Beli paket belajar untuk membuka akses subtes, materi, dan jadwal.',
        type: 'payment',
        time: 'Info',
      },
      {
        id: 2,
        title: 'Status pembayaran',
        message:
          pendingPackageTransactions.length > 0
            ? `${pendingPackageTransactions.length} transaksi paket masih pending.`
            : 'Belum ada paket aktif.',
        type: 'payment',
        time: 'Info',
      },
    ];
  const notifications = notificationItems.length > 0
    ? notificationItems.map((notification) => ({
      id: notification.id,
      title: notification.title || 'Notifikasi',
      message: notification.message || 'Ada informasi baru untuk akun belajarmu.',
      type: notification.is_read ? 'info' : 'course',
      time: notification.created_at ? formatDate(notification.created_at) : 'Terbaru',
    }))
    : fallbackNotifications;

  const logout = () => {
    router.post(route('logout'));
  };

  const updateDashboardTabUrl = (tab) => {
    if (typeof window === 'undefined' || !dashboardTabs.includes(tab)) return;

    const nextUrl = tab === 'beranda'
      ? window.location.pathname
      : `${window.location.pathname}?tab=${encodeURIComponent(tab)}`;

    window.history.replaceState(window.history.state, '', nextUrl);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    updateDashboardTabUrl(tab);
  };

  const toggleSubtesMenu = () => {
    setSubtesOpen((value) => (activeTab === 'subtes' ? !value : true));
    setActiveTab('subtes');
    updateDashboardTabUrl('subtes');
  };

  const openProfileEditor = () => {
    profileForm.setData({
      name: user?.name ?? '',
      gender: user?.gender ?? '',
      phone: user?.phone ?? '',
      school_origin: user?.school_origin ?? '',
    });
    profileForm.clearErrors();
    setNotificationOpen(false);
    setSidebarOpen(false);
    setProfileEditorOpen(true);
  };

  const closeProfileEditor = () => {
    if (profileForm.processing) return;

    setProfileEditorOpen(false);
  };

  const submitProfileEditor = (event) => {
    event.preventDefault();

    profileForm.patch(route('profile.update'), {
      preserveScroll: true,
      onSuccess: () => setProfileEditorOpen(false),
    });
  };

  const materialStatusText = (item) => {
    if (!item.enrolled) return 'Pilih course';
    return item.hasMaterials
      ? `${item.materialCount} materi tersedia`
      : 'Materi belum tersedia';
  };

  const SidebarMenuButton = ({ active, icon: Icon, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all hover:translate-x-0.5 hover:brightness-105 ${
        active ? 'text-[#691D1B]' : 'text-white/90 hover:bg-white/10 hover:text-white'
      }`}
      style={{
        fontWeight: 800,
        ...(active ? { background: '#FFE882' } : {}),
      }}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
    </button>
  );

  const renderSidebarContent = () => (
    <div
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
              <p className="mt-1.5 truncate text-xs leading-tight text-white/65" title={currentCategoryName}>
                {currentCategoryName}
              </p>
            </div>

            <button
              type="button"
              onClick={openProfileEditor}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{
                background: '#FFE882',
                color: '#691D1B',
              }}
              title="Edit Profil"
              aria-label="Edit Profil"
            >
              <Pencil className="h-4 w-4" />
            </button>
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
        <SidebarMenuButton
          active={activeTab === 'beranda'}
          icon={Home}
          label="Beranda"
          onClick={() => changeTab('beranda')}
        />

        <SidebarMenuButton
          active={activeTab === 'katalog'}
          icon={Star}
          label="Lihat Katalog"
          onClick={() => changeTab('katalog')}
        />

        <button
          type="button"
          onClick={toggleSubtesMenu}
          aria-expanded={subtesOpen}
          className={`flex min-h-[42px] w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${
            activeTab === 'subtes'
              ? 'text-[#691D1B]'
              : 'text-white/90 hover:bg-white/10'
          }`}
          style={{
            fontWeight: 800,
            ...(activeTab === 'subtes' ? { background: '#FFE882' } : {}),
          }}
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
            {learningItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="group block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10"
              >
                <div className="mb-1 flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="min-w-0 truncate text-xs font-bold leading-snug text-white/90 group-hover:text-white">
                    {item.title}
                  </span>
                </div>

                <div className="ml-4">
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.progress}%`,
                        background: '#FFE882',
                      }}
                    />
                  </div>
                  <p
                    className={`mt-1 text-[11px] ${
                      item.hasMaterials ? 'text-white/60' : 'text-[#FFE882]'
                    }`}
                  >
                    {item.hasMaterials ? `${item.progress}% selesai` : materialStatusText(item)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <SidebarMenuButton
          active={activeTab === 'jadwal'}
          icon={CalendarDays}
          label="Jadwal"
          onClick={() => changeTab('jadwal')}
        />

        <SidebarMenuButton
          active={activeTab === 'profil'}
          icon={Pencil}
          label="Profil"
          onClick={() => changeTab('profil')}
        />
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
  );

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-xl">
      <div className="px-4 py-3 border-b border-[#F7F2E7]">
        <h3 className="text-[#691D1B] text-base" style={{ fontWeight: 900 }}>
          Notifikasi
        </h3>
        <p className="text-xs text-gray-500">
          Informasi terbaru dari akun belajarmu.
        </p>
      </div>

      <div className="divide-y divide-[#F7F2E7]">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => {
              if (notification.type === 'schedule') {
                changeTab('jadwal');
              }

              if (notification.type === 'course') {
                changeTab('subtes');
              }

              setNotificationOpen(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-[#F7F2E7] transition-colors"
          >
            <p className="text-sm text-gray-900" style={{ fontWeight: 800 }}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              {notification.message}
            </p>
            <p
              className="text-[11px] text-[#691D1B] mt-2"
              style={{ fontWeight: 800 }}
            >
              {notification.time}
            </p>
          </button>
        ))}
      </div>

      <div className="px-4 py-3 bg-[#F7F2E7]">
        <button
          type="button"
          onClick={() => setNotificationOpen(false)}
          className="w-full text-sm text-[#691D1B]"
          style={{ fontWeight: 800 }}
        >
          Tutup
        </button>
      </div>
    </div>
  );

  const Topbar = ({ title, subtitle }) => (
    <header className="bg-white border-b border-[#D8D7BE] sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          {showStudentSidebar && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#D8D7BE] text-[#691D1B] lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="min-w-0">
            <p className="mb-1 truncate text-[10px] tracking-[0.22em] text-[#A56D6B] sm:tracking-[0.32em]">
              SISWA WORKSPACE
            </p>
            <h1 className="truncate text-lg text-gray-900 sm:text-xl" style={{ fontWeight: 900 }}>
              {title}
            </h1>
            <p className="truncate text-xs text-gray-400 sm:text-sm">
              {subtitle || currentPackageName}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((value) => !value)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] transition-colors hover:bg-[#EFE8D8] sm:h-11 sm:w-11"
              aria-label="Buka notifikasi"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-black">
                {notifications.length}
              </span>
            </button>

            {notificationOpen && <NotificationDropdown />}
          </div>

          {!hasActivePackage && (
            <button
              type="button"
              onClick={openProfileEditor}
              className="group relative hidden max-w-[18rem] items-center gap-3 rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] px-3.5 py-2 transition-colors hover:bg-[#EFE8D8] md:flex"
              title="Edit Profil"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: '#741A18',
                  color: '#FFE882',
                  fontWeight: 900,
                }}
              >
                {getInitials(user?.name)}
              </div>

              <div className="min-w-0 text-left">
                <p className="text-[10px] tracking-[0.22em] text-gray-400">
                  SISWA
                </p>
                <p className="truncate text-sm text-gray-900" style={{ fontWeight: 800 }}>
                  {user?.name || 'Siswa'}
                </p>
              </div>

              <span
                className="flex h-7 flex-shrink-0 items-center gap-1 rounded-full px-2 text-[11px] transition-colors group-hover:bg-[#691D1B] group-hover:text-white"
                style={{
                  background: '#FFE882',
                  color: '#691D1B',
                  fontWeight: 900,
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const StatusBar = () => (
    <div className="flex flex-col gap-3 border-b border-[#D8D7BE] bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${hasActivePackage ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="min-w-0 text-sm font-bold text-gray-900">
          {hasActivePackage ? `${currentPackageName} — Aktif` : 'Belum ada paket aktif'}
        </span>
        <span className="text-gray-400 hidden sm:inline">|</span>
        <span className="text-sm text-gray-500">
          {hasActivePackage ? 'Valid hingga 30 Juni 2025' : 'Pilih paket untuk membuka akses belajar'}
        </span>
      </div>

      <span
        className="inline-flex self-start sm:self-auto px-3.5 py-1 rounded-full text-xs"
        style={{
          background: '#FFE882',
          color: '#691D1B',
          fontWeight: 900,
        }}
      >
        {hasActivePackage ? '63 hari' : 'Pilih Paket'}
      </span>
    </div>
  );

  const PackagePurchasePanel = () => (
    <section className="space-y-5">
      {pendingPackageTransactions.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base text-yellow-900" style={{ fontWeight: 900 }}>
                  Transaksi paket menunggu pembayaran
                </h2>
                <p className="mt-1 text-sm text-yellow-800">
                  Selesaikan konfirmasi pembayaran agar paket aktif di dashboard.
                </p>
              </div>
            </div>

            <Link
              href={transactionStatusHref(pendingPackageTransactions[0])}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#691D1B] px-4 py-2.5 text-sm text-white sm:w-auto"
              style={{ fontWeight: 900 }}
            >
              Lihat Status
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
        <div className="border-b border-[#F7F2E7] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDED] text-[#691D1B]">
              <PackageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
                Pilih Paket Belajar
              </h2>
              <p className="text-sm text-gray-500">
                Beli paket untuk membuka akses subtes, materi, jadwal, dan dashboard belajar.
              </p>
            </div>
          </div>
        </div>

        {packageOptions.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">
            Belum ada paket aktif yang tersedia.
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
            {packageOptions.map((pkg) => {
              const packageCourses = asArray(pkg.courses);
              const packageFeatures = Array.isArray(pkg.features) ? pkg.features : [];

              return (
                <article key={pkg.id} className="flex min-w-0 flex-col rounded-2xl border border-[#D8D7BE] bg-[#FDFCF8] p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {pkg.popular && (
                          <span className="rounded-full bg-[#FFE882] px-3 py-1 text-xs text-[#691D1B]" style={{ fontWeight: 900 }}>
                            Paling Populer
                          </span>
                        )}
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-600" style={{ fontWeight: 800 }}>
                          {packageCourses.length} course
                        </span>
                      </div>

                      <h3 className="break-words text-lg text-gray-900" style={{ fontWeight: 900 }}>
                        {pkg.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {pkg.description || 'Paket belajar BRICS Education.'}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-xs text-gray-500">Harga</p>
                      <p className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
                        {formatPrice(pkg.price)}
                      </p>
                    </div>
                  </div>

                  {packageFeatures.length > 0 && (
                    <ul className="mb-4 space-y-2">
                      {packageFeatures.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0F7A45]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mb-5 rounded-xl border border-[#D8D7BE] bg-white p-3">
                    <p className="mb-2 text-xs uppercase text-gray-500" style={{ fontWeight: 900 }}>
                      Course dalam paket
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {packageCourses.slice(0, 5).map((course) => (
                        <span key={course.id} className="rounded-full bg-[#F7F2E7] px-2.5 py-1 text-xs text-gray-600" style={{ fontWeight: 800 }}>
                          {course.title}
                        </span>
                      ))}
                      {packageCourses.length > 5 && (
                        <span className="rounded-full bg-[#F7F2E7] px-2.5 py-1 text-xs text-gray-600" style={{ fontWeight: 800 }}>
                          +{packageCourses.length - 5} course
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={packageCheckoutHref(pkg)}
                    className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#691D1B] px-4 py-3 text-center text-sm text-white hover:bg-[#4A1412]"
                    style={{ fontWeight: 900 }}
                  >
                    <CreditCard className="h-4 w-4" />
                    Beli Paket
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );

  const StatsCards = () => (
    <div className="mb-5 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
      <div className="min-w-0 rounded-2xl border border-[#D8D7BE] bg-white p-3 shadow-sm sm:p-5">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8EDED] sm:mb-4 sm:h-11 sm:w-11">
          <BookOpen className="h-4 w-4 text-[#691D1B] sm:h-5 sm:w-5" />
        </div>
        <p className="text-xl leading-none text-gray-900 sm:text-2xl" style={{ fontWeight: 900 }}>
          {learningItems.length}
        </p>
        <p className="mt-1.5 text-[11px] leading-tight text-gray-500 sm:text-sm">Subtes UTBK</p>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#D8D7BE] bg-white p-3 shadow-sm sm:p-5">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8EDED] sm:mb-4 sm:h-11 sm:w-11">
          <Star className="h-4 w-4 text-[#691D1B] sm:h-5 sm:w-5" />
        </div>
        <p className="text-xl leading-none text-gray-900 sm:text-2xl" style={{ fontWeight: 900 }}>
          {averageProgress}%
        </p>
        <p className="mt-1.5 text-[11px] leading-tight text-gray-500 sm:text-sm">Rata-rata Progres</p>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#D8D7BE] bg-white p-3 shadow-sm sm:p-5">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8EDED] sm:mb-4 sm:h-11 sm:w-11">
          <Clock className="h-4 w-4 text-[#691D1B] sm:h-5 sm:w-5" />
        </div>
        <p className="text-xl leading-none text-gray-900 sm:text-2xl" style={{ fontWeight: 900 }}>
          24 jam
        </p>
        <p className="mt-1.5 text-[11px] leading-tight text-gray-500 sm:text-sm">Jam Belajar</p>
      </div>
    </div>
  );

  const SubtesCard = () => (
    <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[#F7F2E7] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#691D1B]" />
          <h2 className="truncate text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
            Subtes UTBK
          </h2>
        </div>

        <button
          type="button"
          onClick={() => changeTab('subtes')}
          className="inline-flex items-center gap-1 text-sm text-[#691D1B]"
          style={{ fontWeight: 800 }}
        >
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-[#F7F2E7]">
        {learningItems.slice(0, 3).map((item) => (
          <div key={item.title} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: item.iconBg, color: item.iconColor }}
            >
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 break-words text-sm font-bold text-gray-900">{item.title}</p>
              {item.enrolled && (
                <p
                  className="mb-2 text-xs"
                  style={{
                    color: item.hasMaterials ? '#0F7A45' : '#8A5A00',
                    fontWeight: 800,
                  }}
                >
                  {materialStatusText(item)}
                </p>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.progress}%`,
                      background: item.color,
                    }}
                  />
                </div>
                <span
                  className="text-sm"
                  style={{ color: item.color, fontWeight: 900 }}
                >
                  {item.progress}%
                </span>
              </div>
            </div>

            <ChevronRight className="hidden h-5 w-5 flex-shrink-0 text-gray-300 sm:block" />
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <button
          type="button"
          onClick={() => changeTab('subtes')}
          className="w-full py-2.5 rounded-xl text-sm text-[#691D1B] hover:bg-[#EFE8D8] transition-colors"
          style={{ background: '#F7F2E7', fontWeight: 900 }}
        >
          Lanjutkan Belajar
        </button>
      </div>
    </section>
  );

  const SchedulePreviewCard = () => {
    const previewSchedules = schedulesThisWeek.slice(0, 2);

    return (
      <section className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-[#F7F2E7] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <CalendarDays className="h-5 w-5 flex-shrink-0 text-[#691D1B]" />
            <h2 className="truncate text-base text-[#691D1B] sm:text-lg" style={{ fontWeight: 900 }}>
              Jadwal Minggu Ini
            </h2>
          </div>

          <span className="flex-shrink-0 rounded-full bg-[#F8EDED] px-3 py-1 text-xs text-[#691D1B]" style={{ fontWeight: 900 }}>
            {schedulesThisWeek.length} sesi
          </span>
        </div>

        {previewSchedules.length === 0 ? (
          <div className="px-5 py-7 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8EDED] text-[#691D1B]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-gray-800">Belum ada jadwal minggu ini</p>
            <p className="mt-1 text-sm text-gray-500">Jadwal terbaru akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-3 p-4 sm:p-5">
            {previewSchedules.map((schedule) => {
              const config = studentScheduleConfig(schedule);
              const targetLink = studentScheduleLink(schedule, scheduleNow);
              const completed = isScheduleCompleted(schedule, scheduleNow);
              const ScheduleIcon = config.icon;

              return (
              <div key={schedule.id} className="rounded-2xl border border-[#EFE7D3] bg-[#FDFCF8] p-4">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: config.bg, color: config.color }}>
                    <ScheduleIcon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="break-words text-sm text-gray-900" style={{ fontWeight: 900 }}>
                        {schedule.title}
                      </p>
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: config.bg, color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                    <p className="break-words text-xs text-gray-500 sm:text-sm">
                      {schedule.time || `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}
                      {' '}• {schedule.course?.title || currentPackageName}
                    </p>
                  </div>
                </div>

                {targetLink ? (
                  <a
                    href={targetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white hover:bg-[#4A1412]"
                    style={{ background: '#691D1B', fontWeight: 900 }}
                  >
                    {config.linkLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-400">
                    {completed ? 'Jadwal sudah berakhir' : 'Belum ada link'}
                  </span>
                )}
              </div>
              );
            })}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => changeTab('jadwal')}
                className="w-full py-2.5 rounded-xl text-sm text-[#691D1B] hover:bg-[#EFE8D8] transition-colors"
                style={{ background: '#F7F2E7', fontWeight: 900 }}
              >
                Lihat Jadwal Lengkap
              </button>
            </div>
          </div>
        )}
      </section>
    );
  };

  const ContinueCard = () => (
    <section
      className="mt-6 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white"
      style={{ background: '#741A18' }}
    >
      <div>
        <h2 className="text-lg mb-1" style={{ fontWeight: 900 }}>
          Lanjutkan di mana kamu berhenti
        </h2>
        <p className="text-sm text-[#F7D7D6]">
          {currentPackageName} • Pilih subtes untuk mulai belajar
        </p>
      </div>

      <button
        type="button"
        onClick={() => changeTab('subtes')}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm text-[#691D1B] md:w-auto"
        style={{ background: '#FFE882', fontWeight: 900 }}
      >
        <BookOpen className="w-4 h-4" />
        Lanjutkan
      </button>
    </section>
  );

  const MaterialPreviewCard = () => (
    <section className="mt-5 bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[#F7F2E7] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="w-5 h-5 text-[#691D1B]" />
          <h2 className="truncate text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
            Materi Terbaru
          </h2>
        </div>
        {latestEnrollment && (
          <Link
            href={courseLearnHref(latestEnrollment.course, latestEnrollment.course_id)}
            className="inline-flex flex-shrink-0 items-center gap-1 text-sm text-[#691D1B]"
            style={{ fontWeight: 800 }}
          >
            Buka Materi
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {materialItems.length === 0 ? (
        <div className="p-5 text-sm text-gray-600">
          Belum ada materi yang disetujui untuk course aktifmu.
        </div>
      ) : (
        <div className="divide-y divide-[#F7F2E7]">
          {materialItems.map((material) => (
            <Link
              key={material.id}
              href={courseLearnHref(material.course, material.course_title || material.title)}
              className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#F7F2E7] sm:gap-4 sm:px-5"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8EDED] text-[#691D1B]">
                {material.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{material.title}</p>
                <p className="text-xs text-gray-400 truncate">{material.course?.title || currentPackageName}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );

  const BerandaPage = () => (
    <>
      <Topbar
        title="Beranda"
        subtitle={hasActivePackage ? currentPackageName : 'Pilih paket belajar untuk mulai akses dashboard'}
      />
      <StatusBar />

      <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
        {hasActivePackage ? (
          <>
            <StatsCards />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <SubtesCard />
              <SchedulePreviewCard />
            </div>

            <MaterialPreviewCard />
            <ContinueCard />
          </>
        ) : (
          <PackagePurchasePanel />
        )}
      </main>
    </>
  );

  const SubtesPage = () => (
    <>
      <Topbar title={hasActivePackage ? 'Subtes UTBK' : 'Pilih Paket'} subtitle={currentPackageName} />
      <StatusBar />

      <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
        {!hasActivePackage ? (
          <PackagePurchasePanel />
        ) : (
        <section className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#F7F2E7] px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
                Daftar Subtes UTBK
              </h2>
              <p className="text-sm text-gray-500">
                Subtes dari paket aktif yang sudah kamu beli.
              </p>
            </div>

            <button
              type="button"
              onClick={() => changeTab('katalog')}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#691D1B] px-4 py-2.5 text-sm text-[#691D1B] transition-colors hover:bg-[#691D1B] hover:text-white sm:w-auto"
              style={{ fontWeight: 900 }}
            >
              Lihat Katalog
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-2">
            {learningItems.map((subtes) => (
              <div
                key={subtes.title}
                className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: subtes.iconBg,
                      color: subtes.iconColor,
                    }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs"
                        style={{
                          background: '#FFE882',
                          color: '#691D1B',
                          fontWeight: 900,
                        }}
                      >
                        {subtes.category || currentCategoryName}
                      </span>

                      {subtes.enrolled && (
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs"
                          style={{
                            background: subtes.hasMaterials ? '#EAF7F0' : '#FFF6CC',
                            color: subtes.hasMaterials ? '#0F7A45' : '#8A5A00',
                            fontWeight: 900,
                          }}
                        >
                          {materialStatusText(subtes)}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 break-words text-base text-gray-900" style={{ fontWeight: 900 }}>
                      {subtes.title}
                    </h3>

                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {subtes.description}
                    </p>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${subtes.progress}%`,
                            background: subtes.color,
                          }}
                        />
                      </div>

                      <span
                        className="text-sm"
                        style={{
                          color: subtes.color,
                          fontWeight: 900,
                        }}
                      >
                        {subtes.progress}%
                      </span>
                    </div>

                    {hasActivePackage ? (
                      <Link
                        href={subtes.href}
                        className="block min-h-11 rounded-xl px-4 py-2.5 text-center text-sm transition-colors"
                        style={{
                          background: subtes.hasMaterials ? '#691D1B' : '#F7F2E7',
                          border: subtes.hasMaterials ? '1px solid #691D1B' : '1px solid #D8D7BE',
                          color: subtes.hasMaterials ? 'white' : '#691D1B',
                          fontWeight: 900,
                        }}
                      >
                        {subtes.hasMaterials ? 'Mulai Belajar' : 'Lihat Status Materi'}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => changeTab('katalog')}
                        className="block min-h-11 rounded-xl px-4 py-2.5 text-center text-sm text-white"
                        style={{ background: '#691D1B', fontWeight: 900 }}
                      >
                        Pilih Paket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}
      </main>
    </>
  );

  const KatalogPage = () => (
    <>
      <Topbar title="Katalog Paket" subtitle="Pilih paket belajar yang tersedia" />
      <StatusBar />

      <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
        <PackagePurchasePanel />
      </main>
    </>
  );

  const JadwalPage = () => (
    <>
      <Topbar title={hasActivePackage ? 'Jadwal' : 'Pilih Paket'} subtitle={currentPackageName} />
      <StatusBar />

      <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
        {!hasActivePackage ? (
          <PackagePurchasePanel />
        ) : (
        <>
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[#D8D7BE] bg-white px-3 py-2 text-xs font-bold text-[#691D1B] sm:text-sm">
            <Video className="w-4 h-4" />
            Live Class
          </span>
          <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[#D8D7BE] bg-white px-3 py-2 text-xs font-bold text-green-700 sm:text-sm">
            <FileText className="w-4 h-4" />
            Konsultasi
          </span>
          <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[#D8D7BE] bg-white px-3 py-2 text-xs font-bold text-pink-600 sm:text-sm">
            <Clock className="w-4 h-4" />
            Deadline
          </span>
          <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[#D8D7BE] bg-white px-3 py-2 text-xs font-bold text-purple-600 sm:text-sm">
            <ClipboardList className="w-4 h-4" />
            Tryout
          </span>
        </div>

        <div className="-mx-4 mb-6 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {weekDays.map((day) => (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => setSelectedScheduleDateKey(day.dateKey)}
              className={`min-w-[5.6rem] flex-shrink-0 rounded-2xl border px-3 py-2.5 text-xs sm:min-w-0 sm:px-5 sm:text-sm ${
                day.dateKey === selectedWeekDay.dateKey
                  ? 'bg-[#691D1B] text-white border-[#691D1B]'
                  : 'bg-white text-gray-500 border-[#D8D7BE]'
              }`}
              style={{ fontWeight: 800 }}
            >
              {day.shortLabel}
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8EDED] text-[#691D1B]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-bold uppercase text-gray-400">
                Jadwal dipilih
              </p>
              <h2 className="min-w-0 break-words text-base text-[#691D1B] sm:text-lg" style={{ fontWeight: 900 }}>
                {selectedWeekDay.fullLabel}
              </h2>
            </div>
            {selectedWeekDay.isToday && (
              <span
                className="flex-shrink-0 rounded-full px-3 py-1 text-xs"
                style={{
                  background: '#FFE882',
                  color: '#691D1B',
                  fontWeight: 900,
                }}
              >
                Hari ini
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {selectedDaySchedules.length === 0 ? (
            <div className="rounded-2xl border border-[#D8D7BE] bg-white p-7 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8EDED] text-[#691D1B]">
                <CalendarDays className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-gray-800">Belum ada jadwal</p>
              <p className="mt-1 text-sm text-gray-500">Tidak ada sesi untuk tanggal ini.</p>
            </div>
          ) : (
            selectedDaySchedules.map((schedule) => {
              const config = studentScheduleConfig(schedule);
              const targetLink = studentScheduleLink(schedule, scheduleNow);
              const completed = isScheduleCompleted(schedule, scheduleNow);
              const ScheduleIcon = config.icon;

              return (
                <div
                  key={schedule.id}
                  className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center"
                  style={{
                    borderLeft: `5px solid ${config.color}`,
                  }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                    style={{
                      background: config.bg,
                      color: config.color,
                    }}
                  >
                    <ScheduleIcon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="break-words text-base text-gray-900" style={{ fontWeight: 900 }}>
                        {schedule.title}
                      </h3>

                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: config.bg,
                          color: config.color,
                          fontWeight: 900,
                        }}
                      >
                        {config.label}
                      </span>
                    </div>

                    <p className="mb-1 break-words text-sm text-gray-500">
                      {schedule.course?.title || currentPackageName} • {schedule.mentor?.name || (scheduleType(schedule) === 'tryout' ? 'BRICS Education' : 'Tutor Brics')}
                    </p>

                    <p className="break-words text-sm text-gray-400">
                      <Clock className="inline w-4 h-4 mr-1" />
                      {schedule.time || `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}
                      {' '}
                      <span className="mx-1">•</span>
                      {config.location}
                    </p>
                  </div>

                  {targetLink ? (
                    <a
                      href={targetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-2 min-h-11 w-full rounded-xl px-5 py-2.5 text-center text-sm text-white lg:col-span-1 lg:w-auto lg:flex-shrink-0"
                      style={{
                        background: config.color,
                        fontWeight: 900,
                      }}
                    >
                      {config.linkLabel}
                    </a>
                  ) : (
                    <span className="col-span-2 min-h-11 w-full rounded-xl bg-gray-100 px-5 py-2.5 text-center text-sm text-gray-500 lg:col-span-1 lg:w-auto lg:flex-shrink-0">
                      {completed ? 'Jadwal sudah berakhir' : 'Link belum tersedia'}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm p-4 sm:p-5">
          <h2 className="text-base text-[#691D1B] mb-4" style={{ fontWeight: 900 }}>
            Ringkasan Minggu Ini
          </h2>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="rounded-xl p-3 text-center sm:p-4" style={{ background: '#F7F2E7' }}>
              <p className="text-xl text-[#691D1B] sm:text-2xl" style={{ fontWeight: 900 }}>
                {scheduleStats.totalThisWeek ?? schedulesThisWeek.length}
              </p>
              <p className="text-[11px] leading-tight text-gray-500 sm:text-sm">Total</p>
            </div>

            <div className="rounded-xl p-3 text-center sm:p-4" style={{ background: '#F7F2E7' }}>
              <p className="text-xl text-[#691D1B] sm:text-2xl" style={{ fontWeight: 900 }}>
                {scheduleStats.totalLive ?? schedulesThisWeek.filter((schedule) => scheduleType(schedule) === 'live').length}
              </p>
              <p className="text-[11px] leading-tight text-gray-500 sm:text-sm">Live</p>
            </div>

            <div className="rounded-xl p-3 text-center sm:p-4" style={{ background: '#F7F2E7' }}>
              <p className="text-xl text-pink-600 sm:text-2xl" style={{ fontWeight: 900 }}>
                {scheduleStats.totalDeadlines ?? schedulesThisWeek.filter((schedule) => scheduleType(schedule) === 'student_deadline').length}
              </p>
              <p className="text-[11px] leading-tight text-gray-500 sm:text-sm">Deadline</p>
            </div>

            <div className="rounded-xl p-3 text-center sm:p-4" style={{ background: '#F7F2E7' }}>
              <p className="text-xl text-purple-600 sm:text-2xl" style={{ fontWeight: 900 }}>
                {scheduleStats.totalTryouts ?? schedulesThisWeek.filter((schedule) => scheduleType(schedule) === 'tryout').length}
              </p>
              <p className="text-[11px] leading-tight text-gray-500 sm:text-sm">Tryout</p>
            </div>
          </div>
        </section>
        </>
        )}
      </main>
    </>
  );

  const ProfilPage = () => (
    <>
      <Topbar title="Edit Profil" subtitle="Informasi akun siswa" />
      <StatusBar />

      <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
        <section className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
          <div className="border-b border-[#F7F2E7] px-4 py-4 sm:px-5">
            <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
              Profil Saya
            </h2>
            <p className="text-sm text-gray-500">
              Informasi akun siswa yang sedang login.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl"
                style={{
                  background: '#FFE882',
                  color: '#691D1B',
                  fontWeight: 900,
                }}
              >
                {getInitials(user?.name)}
              </div>

              <div className="min-w-0">
                <h3 className="mb-1 break-words text-xl text-gray-900" style={{ fontWeight: 900 }}>
                  {user?.name || 'Siswa Brics'}
                </h3>
                <p className="break-words text-sm text-gray-500">
                  {user?.email || 'Akun siswa BRICS Education'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#D8D7BE] rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Nama Lengkap</p>
                <p className="text-gray-900 text-sm" style={{ fontWeight: 800 }}>
                  {user?.name || '-'}
                </p>
              </div>

              <div className="border border-[#D8D7BE] rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Jenis Kelamin</p>
                <p className="text-gray-900 text-sm" style={{ fontWeight: 800 }}>
                  {formatGender(user?.gender)}
                </p>
              </div>

              <div className="border border-[#D8D7BE] rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">No Telepon/WhatsApp</p>
                <p className="text-gray-900 text-sm" style={{ fontWeight: 800 }}>
                  {user?.phone || '-'}
                </p>
              </div>

              <div className="border border-[#D8D7BE] rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Sekolah Asal</p>
                <p className="text-gray-900 text-sm" style={{ fontWeight: 800 }}>
                  {user?.school_origin || '-'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openProfileEditor}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4A1412] sm:w-auto"
                style={{ background: '#691D1B', fontWeight: 900 }}
              >
                <Pencil className="w-4 h-4" />
                Edit Profil
              </button>

              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#691D1B] px-4 py-2.5 text-sm text-[#691D1B] transition-colors hover:bg-[#691D1B] hover:text-white sm:w-auto"
                style={{ fontWeight: 900 }}
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
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
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
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
              className="min-h-11 rounded-xl border border-[#D8D7BE] px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-[#F7F2E7] disabled:opacity-60"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={profileForm.processing}
              className="min-h-11 rounded-xl px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#4A1412] disabled:opacity-70"
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

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#F7F2E7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>
        {`
          @keyframes studentDrawerSlideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }

          @keyframes studentDrawerFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .student-drawer-panel {
            animation: studentDrawerSlideIn 240ms ease-out both;
          }

          .student-drawer-backdrop {
            animation: studentDrawerFadeIn 180ms ease-out both;
          }

          @media (prefers-reduced-motion: reduce) {
            .student-drawer-panel,
            .student-drawer-backdrop {
              animation: none;
            }
          }
        `}
      </style>

      <div className="flex min-h-screen">
        {showStudentSidebar && (
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-0 h-screen">
              {renderSidebarContent()}
            </div>
          </aside>
        )}

        {showStudentSidebar && sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="student-drawer-backdrop absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup sidebar"
            />

            <div className="student-drawer-panel relative h-full w-[min(20rem,85vw)]">
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

        <div className="min-w-0 flex-1 overflow-x-hidden">
          {activeTab === 'beranda' && <BerandaPage />}
          {activeTab === 'katalog' && <KatalogPage />}
          {activeTab === 'subtes' && <SubtesPage />}
          {activeTab === 'jadwal' && <JadwalPage />}
          {activeTab === 'profil' && <ProfilPage />}
        </div>
      </div>

      {profileEditorOpen && renderProfileEditorModal()}
    </div>
  );
}
