import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
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
  User,
  Video,
  ClipboardList,
  ExternalLink,
  X,
} from 'lucide-react';

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

function formatTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
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

function getCategoryName(course) {
  if (!course?.category) return 'Tryout SNBT';
  if (typeof course.category === 'string') return course.category;
  return course.category.name || 'Tryout SNBT';
}

export default function StudentDashboard({
  user,
  enrollments = [],
  transactions = [],
  schedules = [],
  materials = [],
  notifications: serverNotifications = [],
}) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subtesOpen, setSubtesOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const activeEnrollments = enrollments.filter((item) => item.status === 'active');
  const latestEnrollment = activeEnrollments[0];
  const activeCourse = latestEnrollment?.course;

  const currentPackageName = activeCourse?.title || 'Bundling Tryout UTBK-SNBT';
  const currentCategoryName = getCategoryName(activeCourse);

  const pendingTransactions = transactions.filter(
    (item) => item.payment_status === 'pending'
  );
  const notificationItems = Array.isArray(serverNotifications)
    ? serverNotifications
    : Object.values(serverNotifications ?? {});
  const materialItems = Array.isArray(materials) ? materials : Object.values(materials ?? {});

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
  const learningItems = activeEnrollments.length > 0
    ? activeEnrollments.map((enrollment, index) => {
      const course = enrollment.course ?? {};
      const color = courseColors[index % courseColors.length];

      return {
        id: enrollment.course_id,
        title: course.title || `Course ${index + 1}`,
        category: getCategoryName(course),
        progress: 0,
        color,
        iconBg: '#F8EDED',
        iconColor: color,
        description: course.description || 'Course aktif yang sudah terdaftar di akun siswa.',
        href: `/course/${enrollment.course_id}/learn`,
      };
    })
    : fallbackSubtesItems.map((item) => ({
      ...item,
      category: currentCategoryName,
      href: '/#katalog',
    }));

  const averageProgress = Math.round(
    learningItems.reduce((total, item) => total + item.progress, 0) /
      Math.max(learningItems.length, 1)
  );

  const fallbackNotifications = [
    {
      id: 1,
      title: 'Course aktif',
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

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const SidebarMenuButton = ({ active, icon: Icon, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left ${
        active ? 'text-[#691D1B]' : 'text-white/90 hover:bg-white/10'
      }`}
      style={{
        background: active ? '#FFE882' : 'transparent',
        fontWeight: 800,
      }}
    >
      <Icon className="w-4.5 h-4.5" />
      <span className="flex-1 text-sm">{label}</span>
    </button>
  );

  const SidebarLinkButton = ({ icon: Icon, label, href }) => (
    <Link
      href={href}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left text-white/90 hover:bg-white/10"
      style={{ fontWeight: 800 }}
    >
      <Icon className="w-4.5 h-4.5" />
      <span className="flex-1 text-sm">{label}</span>
    </Link>
  );

  const SidebarContent = () => (
    <div
      className="h-full flex flex-col text-white overflow-y-auto"
      style={{ background: '#741A18' }}
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
        <div className="rounded-2xl p-3.5 bg-white/10 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-base"
                style={{
                  background: '#FFE882',
                  color: '#691D1B',
                  fontWeight: 900,
                }}
              >
                {getInitials(user?.name)}
              </div>

              <div>
                <p className="text-sm font-bold leading-tight">
                  {user?.name || 'Siswa Brics'}
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  {currentCategoryName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => changeTab('profil')}
              className="text-[#FFE882] hover:scale-110 transition-transform"
              title="Edit Profil"
            >
              <Pencil className="w-4 h-4" />
            </button>
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

      <nav className="flex-1 px-3.5 py-4 space-y-2">
        <SidebarMenuButton
          active={activeTab === 'beranda'}
          icon={Home}
          label="Beranda"
          onClick={() => changeTab('beranda')}
        />

        <SidebarLinkButton
          icon={Star}
          label="Lihat Katalog"
          href="/#katalog"
        />

        <button
          type="button"
          onClick={() => {
            setSubtesOpen(!subtesOpen);
            changeTab('subtes');
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors text-left ${
            activeTab === 'subtes'
              ? 'text-[#691D1B]'
              : 'text-white/90 hover:bg-white/10'
          }`}
          style={{
            background: activeTab === 'subtes' ? '#FFE882' : 'transparent',
            fontWeight: 800,
          }}
        >
          <span className="flex items-center gap-3 text-sm">
            <BookOpen className="w-4.5 h-4.5" />
            Subtes UTBK
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {subtesOpen && (
          <div className="ml-5 pl-3.5 border-l border-white/20 space-y-3 py-2">
            {learningItems.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => changeTab('subtes')}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-xs font-bold text-white/90 group-hover:text-white leading-snug">
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
                  <p className="text-[11px] text-white/60 mt-1">
                    {item.progress}% selesai
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <SidebarMenuButton
          active={activeTab === 'jadwal'}
          icon={CalendarDays}
          label="Jadwal"
          onClick={() => changeTab('jadwal')}
        />
      </nav>

      <div className="px-3.5 py-4 border-t border-white/10 space-y-2 mt-auto">
        <SidebarMenuButton
          active={activeTab === 'profil'}
          icon={User}
          label="Edit Profil"
          onClick={() => changeTab('profil')}
        />

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/90 hover:bg-white/10 transition-colors text-left"
          style={{ fontWeight: 800 }}
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="text-sm">Keluar</span>
        </button>
      </div>
    </div>
  );

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl border border-[#D8D7BE] shadow-xl overflow-hidden z-50">
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
      <div className="px-5 lg:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl border border-[#D8D7BE] flex items-center justify-center text-[#691D1B]"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <p className="text-[10px] tracking-[0.32em] text-[#A56D6B] mb-1">
              SISWA WORKSPACE
            </p>
            <h1 className="text-xl text-gray-900" style={{ fontWeight: 900 }}>
              {title}
            </h1>
            <p className="text-sm text-gray-400">
              {subtitle || currentPackageName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((value) => !value)}
              className="relative w-11 h-11 rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] flex items-center justify-center hover:bg-[#EFE8D8] transition-colors"
              aria-label="Buka notifikasi"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-black">
                {notifications.length}
              </span>
            </button>

            {notificationOpen && <NotificationDropdown />}
          </div>

          <button
            type="button"
            onClick={() => changeTab('profil')}
            className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] hover:bg-[#EFE8D8] transition-colors"
            title="Buka Profil"
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

            <div className="text-left">
              <p className="text-[10px] tracking-[0.22em] text-gray-400">
                SISWA
              </p>
              <p className="text-sm text-gray-900" style={{ fontWeight: 800 }}>
                {user?.name || 'Siswa'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );

  const StatusBar = () => (
    <div className="bg-white border-b border-[#D8D7BE] px-5 lg:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-gray-900 text-sm font-bold">
          {currentPackageName} — Aktif
        </span>
        <span className="text-gray-400 hidden sm:inline">|</span>
        <span className="text-sm text-gray-500">
          Valid hingga 30 Juni 2025
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
        63 hari
      </span>
    </div>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5 shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-[#F8EDED] flex items-center justify-center mb-4">
          <BookOpen className="w-5 h-5 text-[#691D1B]" />
        </div>
        <p className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>
          {learningItems.length}
        </p>
        <p className="text-sm text-gray-500">Subtes UTBK</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5 shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-[#F8EDED] flex items-center justify-center mb-4">
          <Star className="w-5 h-5 text-[#691D1B]" />
        </div>
        <p className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>
          {averageProgress}%
        </p>
        <p className="text-sm text-gray-500">Rata-rata Progres</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5 shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-[#F8EDED] flex items-center justify-center mb-4">
          <Clock className="w-5 h-5 text-[#691D1B]" />
        </div>
        <p className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>
          24 jam
        </p>
        <p className="text-sm text-gray-500">Jam Belajar</p>
      </div>
    </div>
  );

  const SubtesCard = () => (
    <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F7F2E7] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#691D1B]" />
          <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
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
          <div key={item.title} className="px-5 py-4 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: item.iconBg, color: item.iconColor }}
            >
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm mb-2">{item.title}</p>
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

            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        ))}
      </div>

      <div className="px-5 pb-4">
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
    const previewSchedules = schedules.slice(0, 2);

    return (
      <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F7F2E7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-[#691D1B]" />
            <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
              Jadwal Minggu Ini
            </h2>
          </div>

          <button
            type="button"
            onClick={() => changeTab('jadwal')}
            className="inline-flex items-center gap-1 text-sm text-[#691D1B]"
            style={{ fontWeight: 800 }}
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {previewSchedules.length === 0 ? (
          <div className="p-5 text-sm text-gray-600">
            Belum ada jadwal minggu ini.
          </div>
        ) : (
          <div>
            <div className="px-5 py-3 bg-[#F8EDED] text-sm text-[#691D1B] font-bold">
              Jadwal Terdekat
            </div>

            {previewSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="px-5 py-4 flex items-center gap-4 border-b border-[#F7F2E7]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F8EDED] flex items-center justify-center text-[#691D1B]">
                  <Video className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm">
                      {schedule.title}
                    </p>
                    <span className="px-2.5 py-1 rounded-full bg-[#F8EDED] text-[#691D1B] text-xs font-bold">
                      Live Class
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    {' '}• {schedule.course?.title || currentPackageName}
                  </p>
                </div>

                {schedule.meeting_link ? (
                  <a
                    href={schedule.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white hover:bg-[#4A1412]"
                    style={{ background: '#691D1B', fontWeight: 900 }}
                  >
                    Join
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="hidden sm:inline-flex rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-400">
                    Belum ada link
                  </span>
                )}
              </div>
            ))}

            <div className="px-5 pb-4 pt-3">
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
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm text-[#691D1B]"
        style={{ background: '#FFE882', fontWeight: 900 }}
      >
        <BookOpen className="w-4 h-4" />
        Lanjutkan
      </button>
    </section>
  );

  const MaterialPreviewCard = () => (
    <section className="mt-5 bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F7F2E7] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#691D1B]" />
          <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
            Materi Terbaru
          </h2>
        </div>
        {latestEnrollment && (
          <Link
            href={`/course/${latestEnrollment.course_id}/learn`}
            className="inline-flex items-center gap-1 text-sm text-[#691D1B]"
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
              href={`/course/${material.course_id}/learn`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F2E7] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F8EDED] flex items-center justify-center text-[#691D1B]">
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
      <Topbar title="Beranda" subtitle={currentPackageName} />
      <StatusBar />

      <main className="px-5 lg:px-6 py-6">
        <StatsCards />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <SubtesCard />
          <SchedulePreviewCard />
        </div>

        <MaterialPreviewCard />
        <ContinueCard />
      </main>
    </>
  );

  const SubtesPage = () => (
    <>
      <Topbar title="Subtes UTBK" subtitle={currentPackageName} />
      <StatusBar />

      <main className="px-5 lg:px-6 py-6">
        <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F7F2E7] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
                Daftar Subtes UTBK
              </h2>
              <p className="text-sm text-gray-500">
                Subtes dari paket aktif yang sudah kamu beli.
              </p>
            </div>

            <Link
              href="/#katalog"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-[#691D1B] border-2 border-[#691D1B] hover:bg-[#691D1B] hover:text-white transition-colors"
              style={{ fontWeight: 900 }}
            >
              Lihat Katalog
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {learningItems.map((subtes) => (
              <div
                key={subtes.title}
                className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: subtes.iconBg,
                      color: subtes.iconColor,
                    }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-xs mb-2.5"
                      style={{
                        background: '#FFE882',
                        color: '#691D1B',
                        fontWeight: 900,
                      }}
                    >
                      {subtes.category || currentCategoryName}
                    </span>

                    <h3 className="text-base text-gray-900 mb-2" style={{ fontWeight: 900 }}>
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

                    {activeEnrollments.length > 0 ? (
                      <Link
                        href={subtes.href}
                        className="block text-center px-4 py-2.5 rounded-xl text-sm text-white"
                        style={{ background: '#691D1B', fontWeight: 900 }}
                      >
                        Mulai Belajar
                      </Link>
                    ) : (
                      <Link
                        href="/#katalog"
                        className="block text-center px-4 py-2.5 rounded-xl text-sm text-white"
                        style={{ background: '#691D1B', fontWeight: 900 }}
                      >
                        Pilih Course
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );

  const JadwalPage = () => (
    <>
      <Topbar title="Jadwal" subtitle={currentPackageName} />
      <StatusBar />

      <main className="px-5 lg:px-6 py-6">
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#691D1B]">
            <Video className="w-4 h-4" />
            Live Class
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-green-700">
            <FileText className="w-4 h-4" />
            Konsultasi
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-pink-600">
            <Clock className="w-4 h-4" />
            Deadline
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-purple-600">
            <ClipboardList className="w-4 h-4" />
            Tryout
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {['Sen, 5 Mei', 'Sel, 6 Mei', 'Rab, 7 Mei', 'Kam, 8 Mei', 'Jum, 9 Mei', 'Sab, 10 Mei'].map((day, index) => (
            <button
              key={day}
              type="button"
              className={`px-5 py-2.5 rounded-xl border text-sm ${
                index === 0
                  ? 'bg-[#691D1B] text-white border-[#691D1B]'
                  : 'bg-white text-gray-500 border-[#D8D7BE]'
              }`}
              style={{ fontWeight: 800 }}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[#691D1B]" />
          <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
            Senin, 5 Mei 2026
          </h2>
          <span
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: '#FFE882',
              color: '#691D1B',
              fontWeight: 900,
            }}
          >
            Hari ini
          </span>
        </div>

        <div className="space-y-4 mb-6">
          {schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#D8D7BE] p-7 text-center text-gray-500">
              Belum ada jadwal untuk course aktifmu.
            </div>
          ) : (
            schedules.map((schedule, index) => {
              const isConsultation = index % 2 === 1;

              return (
                <div
                  key={schedule.id}
                  className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm p-5 flex flex-col lg:flex-row lg:items-center gap-4"
                  style={{
                    borderLeft: `7px solid ${isConsultation ? '#0F7A45' : '#691D1B'}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: isConsultation ? '#EAF7F0' : '#F8EDED',
                      color: isConsultation ? '#0F7A45' : '#691D1B',
                    }}
                  >
                    {isConsultation ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Video className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base text-gray-900" style={{ fontWeight: 900 }}>
                        {schedule.title}
                      </h3>

                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: isConsultation ? '#EAF7F0' : '#F8EDED',
                          color: isConsultation ? '#0F7A45' : '#691D1B',
                          fontWeight: 900,
                        }}
                      >
                        {isConsultation ? 'Konsultasi' : 'Live Class'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-1">
                      {schedule.course?.title || currentPackageName} • {schedule.mentor?.name || 'Tutor Brics'}
                    </p>

                    <p className="text-sm text-gray-400">
                      <Clock className="inline w-4 h-4 mr-1" />
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      {' '}
                      <span className="mx-1">•</span>
                      Zoom Meeting
                    </p>
                  </div>

                  {schedule.meeting_link ? (
                    <a
                      href={schedule.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl text-white text-center text-sm"
                      style={{
                        background: isConsultation ? '#0F7A45' : '#691D1B',
                        fontWeight: 900,
                      }}
                    >
                      Bergabung
                    </a>
                  ) : (
                    <span className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-center text-sm">
                      Link belum tersedia
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm p-5">
          <h2 className="text-base text-[#691D1B] mb-4" style={{ fontWeight: 900 }}>
            Ringkasan Minggu Ini
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl p-4 text-center" style={{ background: '#F7F2E7' }}>
              <p className="text-2xl text-[#691D1B]" style={{ fontWeight: 900 }}>
                {schedules.length}
              </p>
              <p className="text-sm text-gray-500">Total Sesi</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: '#F7F2E7' }}>
              <p className="text-2xl text-[#691D1B]" style={{ fontWeight: 900 }}>
                {schedules.filter((_, index) => index % 2 === 0).length}
              </p>
              <p className="text-sm text-gray-500">Live Class</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: '#F7F2E7' }}>
              <p className="text-2xl text-pink-600" style={{ fontWeight: 900 }}>
                2
              </p>
              <p className="text-sm text-gray-500">Deadline</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: '#F7F2E7' }}>
              <p className="text-2xl text-purple-600" style={{ fontWeight: 900 }}>
                2
              </p>
              <p className="text-sm text-gray-500">Tryout</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );

  const ProfilPage = () => (
    <>
      <Topbar title="Edit Profil" subtitle="Informasi akun siswa" />
      <StatusBar />

      <main className="px-5 lg:px-6 py-6">
        <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F7F2E7]">
            <h2 className="text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>
              Profil Saya
            </h2>
            <p className="text-sm text-gray-500">
              Informasi akun siswa yang sedang login.
            </p>
          </div>

          <div className="p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-5 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl"
                style={{
                  background: '#FFE882',
                  color: '#691D1B',
                  fontWeight: 900,
                }}
              >
                {getInitials(user?.name)}
              </div>

              <div>
                <h3 className="text-xl text-gray-900 mb-1" style={{ fontWeight: 900 }}>
                  {user?.name || 'Siswa Brics'}
                </h3>
                <p className="text-sm text-gray-500">
                  Akun siswa BRICS Education
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
                <p className="text-sm text-gray-500 mb-2">Email</p>
                <p className="text-gray-900 text-sm" style={{ fontWeight: 800 }}>
                  {user?.email || '-'}
                </p>
              </div>

              <div className="border border-[#D8D7BE] rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Role</p>
                <p className="text-gray-900 text-sm" style={{ fontWeight: 800 }}>
                  {user?.role_id === 3 ? 'Siswa' : `Role ID ${user?.role_id || '-'}`}
                </p>
              </div>

              <div className="border border-[#D8D7BE] rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">User ID</p>
                <p className="text-gray-900 text-sm" style={{ fontWeight: 800 }}>
                  {user?.id || '-'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white hover:bg-[#4A1412] transition-colors"
                style={{ background: '#691D1B', fontWeight: 900 }}
              >
                <Pencil className="w-4 h-4" />
                Edit Profil Lengkap
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm border-2 border-[#691D1B] text-[#691D1B] hover:bg-[#691D1B] hover:text-white transition-colors"
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

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#F7F2E7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-0 h-screen">
            <SidebarContent />
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

            <div className="relative w-64 h-full">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#691D1B]"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>

              <SidebarContent />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {activeTab === 'beranda' && <BerandaPage />}
          {activeTab === 'subtes' && <SubtesPage />}
          {activeTab === 'jadwal' && <JadwalPage />}
          {activeTab === 'profil' && <ProfilPage />}
        </div>
      </div>
    </div>
  );
}
