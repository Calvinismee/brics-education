import { Link } from "@inertiajs/react";
import {
  Home, BookOpen, Upload, Users, Bell, LogOut, Calendar, Clock,
  AlertCircle, TrendingUp, Star, CheckCircle, ChevronRight, ChevronDown,
  Pencil, User, Settings as SettingsIcon, Video, ExternalLink,
} from "lucide-react";
import { BricsLogo } from "@/Components/BricsLogo";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";
import { useState } from "react";

const fallbackTutorClasses = [
  { id: 0, name: "Penalaran Umum", students: 24, progress: 75, sessions: 8 },
  { id: 1, name: "Pengetahuan dan Pemahaman Umum", students: 18, progress: 60, sessions: 6 },
  { id: 2, name: "Pemahaman Bacaan dan Menulis", students: 22, progress: 68, sessions: 7 },
  { id: 3, name: "Pengetahuan Kuantitatif", students: 20, progress: 72, sessions: 7 },
  { id: 4, name: "Literasi dalam Bahasa Indonesia", students: 26, progress: 80, sessions: 9 },
  { id: 5, name: "Literasi dalam Bahasa Inggris", students: 19, progress: 64, sessions: 6 },
  { id: 6, name: "Penalaran Matematika", students: 21, progress: 70, sessions: 7 },
];

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {});

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const formatNotificationTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Terbaru";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function TutorDashboard({
  user = null,
  tutorClasses: serverTutorClasses = [],
  todaySchedule: serverTodaySchedule = [],
  teachingHistory: serverTeachingHistory = [],
  notifications: serverNotifications = [],
  stats: serverStats = {},
}) {
  const tutorClasses = asArray(serverTutorClasses).length > 0 ? asArray(serverTutorClasses) : fallbackTutorClasses;
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorInitials = initialsFor(tutorName);
  const shouldOpenProfile = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit_profile") === "1";
  const [showProfileModal, setShowProfileModal] = useState(shouldOpenProfile);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const todaySchedule = asArray(serverTodaySchedule);
  const notifications = asArray(serverNotifications).map((notification) => ({
    id: notification.id,
    type: notification.is_read ? "info" : "warning",
    title: notification.title ?? "Notifikasi tutor",
    message: notification.message ?? notification.title ?? "Notifikasi tutor",
    time: formatNotificationTime(notification.created_at),
  }));
  const teachingHistory = asArray(serverTeachingHistory);

  const navItems = [
    { key: "dashboard", label: "Dashboard",    icon: <Home     className="w-5 h-5" />, to: "/tutor/dashboard" },
    { key: "upload",   label: "Upload Materi", icon: <Upload   className="w-5 h-5" />, to: "/tutor/upload"    },
    { key: "classes",  label: "Monitor Kelas", icon: <Users    className="w-5 h-5" />, to: "/tutor/classes"   },
    { key: "schedule", label: "Jadwal",        icon: <Calendar className="w-5 h-5" />, to: "/tutor/schedule"  },
  ];

  const classDetailHref = (courseName, fallbackId = null) => {
    const found = tutorClasses.find((cls) => cls.name === courseName);
    const id = found?.id ?? fallbackId;
    return id === null ? "/tutor/classes" : `/tutor/classes?course_id=${id}`;
  };

  const completedSessions = Number(serverStats.completedSessions ?? teachingHistory.length);
  const statsCards = [
    { label: "Total Siswa", value: String(serverStats.totalStudents ?? tutorClasses.reduce((sum, course) => sum + (course.students ?? 0), 0)), icon: <Users className="w-5 h-5" />, change: "Siswa aktif" },
    { label: "Kelas Aktif", value: String(serverStats.activeClasses ?? tutorClasses.length), icon: <BookOpen className="w-5 h-5" />, change: "Subtes UTBK" },
    { label: "Rating Rata-rata", value: "4.9★", icon: <Star className="w-5 h-5" />, change: "Tutor UTBK" },
    { label: "Sesi Selesai", value: String(completedSessions), icon: <CheckCircle className="w-5 h-5" />, change: "Riwayat mengajar" },
  ];

  const statusStyle = (status) => {
    if (status === "in-progress")
      return { bg: "#22c55e15", text: "#16a34a", label: "Berlangsung" };
    if (status === "completed")
      return { bg: "#E5E7EB", text: "#6B7280", label: "Selesai" };
    return { bg: "#FFE88230", text: "#691D1B", label: "Akan Datang" };
  };

  const notifStyle = (type) => {
    if (type === "warning") return { bg: "#FFE88230", border: "#FFE882", dot: "#d97706" };
    if (type === "success") return { bg: "#22c55e15", border: "#22c55e40", dot: "#16a34a" };
    return { bg: "#691D1B10", border: "#691D1B30", dot: "#691D1B" };
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <div className="hidden flex-shrink-0 lg:block">
        <TutorSidebar user={user} tutorClasses={tutorClasses} active="dashboard" onEditProfile={() => setShowProfileModal(true)} />
      </div>

      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="dashboard"
        onEditProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 flex-shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />

              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 700 }}>Dashboard Tutor</h2>
                <p className="truncate text-xs text-gray-400">Selamat datang kembali, {tutorName}!</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <TutorNotificationBell />
 
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsCards.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-[#D8D7BE]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: "#691D1B15", color: "#691D1B" }}
                >
                  {stat.icon}
                </div>
                <div className="break-words text-xl text-gray-900" style={{ fontWeight: 800 }}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="text-xs mt-1" style={{ color: "#691D1B", fontWeight: 600 }}>{stat.change}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6 mb-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D8D7BE] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#F7F2E7] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Jadwal Hari Ini</h3>
                  <p className="text-xs text-gray-400">Agenda mengajar UTBK</p>
                </div>
                <Calendar className="w-5 h-5" style={{ color: "#691D1B" }} />
              </div>
              <div className="divide-y divide-[#F7F2E7]">
                {todaySchedule.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-500" style={{ fontWeight: 700 }}>Tidak ada kelas hari ini.</p>
                    <p className="mt-1 text-xs text-gray-400">Jadwal akan muncul otomatis saat ada sesi pada tanggal hari ini.</p>
                  </div>
                ) : todaySchedule.map((s) => {
                  const style = statusStyle(s.status);
                  return (
                    <div key={s.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div
                        className="text-center p-2 rounded-lg sm:min-w-[80px]"
                        style={{ background: "#F7F2E7" }}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" style={{ color: "#691D1B" }} />
                        <p className="text-xs text-gray-600" style={{ fontWeight: 600 }}>{s.time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="break-words text-sm text-gray-800" style={{ fontWeight: 600 }}>{s.course}</p>
                        <p className="text-xs text-gray-400">{s.students} siswa</p>
                      </div>
                      <span
                        className="self-start text-xs px-3 py-1 rounded-full flex-shrink-0 sm:self-auto"
                        style={{ background: style.bg, color: style.text, fontWeight: 600 }}
                      >
                        {style.label}
                      </span>
                      {s.meeting_link && s.status !== "completed" ? (
                        <a
                          href={s.start_session_url || `/tutor/schedule/${s.id}/start`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white hover:bg-[#4A1412] sm:w-auto"
                          style={{ background: "#691D1B", fontWeight: 700 }}
                        >
                          <Video className="w-3.5 h-3.5" />
                          Mulai
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-400 sm:w-auto"
                          title="Tambahkan link meeting dari halaman jadwal"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Mulai
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-[#F7F2E7]">
                <Link
                  href="/tutor/schedule"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm rounded-lg transition-colors hover:bg-[#4A1412]"
                  style={{ background: "#691D1B", color: "white", fontWeight: 600 }}
                >
                  <Calendar className="w-4 h-4" />
                  Buka Jadwal Lengkap
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D8D7BE] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#F7F2E7] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Notifikasi</h3>
                  <p className="text-xs text-gray-400">3 notifikasi terbaru</p>
                </div>
                <Bell className="w-5 h-5" style={{ color: "#691D1B" }} />
              </div>
              <div className="divide-y divide-[#F7F2E7]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-500" style={{ fontWeight: 700 }}>Belum ada notifikasi.</p>
                    <p className="mt-1 text-xs text-gray-400">Notifikasi tutor akan muncul di sini saat ada aktivitas baru.</p>
                  </div>
                ) : notifications.map((n) => {
                  const s = notifStyle(n.type);
                  return (
                    <div key={n.id} className="p-4 flex gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: s.dot }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{n.title}</p>
                        <p className="break-words text-sm text-gray-700">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Teaching History */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D8D7BE] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#F7F2E7] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Riwayat Mengajar</h3>
                <p className="text-xs text-gray-400">5 sesi terakhir dari jadwal yang sudah selesai</p>
              </div>
              <Link
                href="/tutor/history"
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white hover:bg-[#4A1412] sm:w-auto"
                style={{ background: "#691D1B", fontWeight: 700 }}
              >
                Lihat Semua
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[#F7F2E7]">
              {teachingHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-500" style={{ fontWeight: 700 }}>Belum ada riwayat mengajar.</p>
                  <p className="mt-1 text-xs text-gray-400">Sesi akan masuk riwayat setelah jadwal selesai.</p>
                </div>
              ) : teachingHistory.map((h) => (
                <div key={h.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-sm text-gray-800" style={{ fontWeight: 700 }}>{h.title}</p>
                      <p className="break-words text-xs text-gray-400">{h.course}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-[#F7F2E7] px-2.5 py-1">{h.date}</span>
                        <span className="rounded-full bg-[#F7F2E7] px-2.5 py-1">{h.time}</span>
                        <span className="rounded-full bg-[#F7F2E7] px-2.5 py-1">{h.students} siswa</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      {h.meeting_link && (
                        <a
                          href={h.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#D8D7BE] px-3 py-2 text-xs text-gray-600 hover:bg-[#F7F2E7]"
                        >
                          Link sesi
                        </a>
                      )}
                      <Link
                        href={classDetailHref(h.course, h.course_id)}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-xs text-white hover:bg-[#4A1412]"
                        style={{ background: "#691D1B", fontWeight: 700 }}
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile Modal ─────────────────────────────────────────── */}
      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}

export default TutorDashboard;
