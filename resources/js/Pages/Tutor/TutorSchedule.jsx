import { Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Home, Upload, Users, LogOut, Calendar, Bell, ArrowLeft,
  Clock, MapPin, BookOpen, ChevronDown, ChevronRight,
  Video, FileText, CheckSquare, MessageSquare, Star, Pencil, Settings as SettingsIcon,
  Link2, ExternalLink, X,
} from "lucide-react";
import { BricsLogo } from "@/Components/BricsLogo";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";

// ─── Schedule Data ─────────────────────────────────────────────────────────────

const fallbackTutorClasses = [
  { id: 0, name: "Penalaran Umum", students: 24, progress: 75 },
  { id: 1, name: "Pengetahuan dan Pemahaman Umum", students: 18, progress: 60 },
  { id: 2, name: "Pemahaman Bacaan dan Menulis", students: 22, progress: 68 },
  { id: 3, name: "Pengetahuan Kuantitatif", students: 20, progress: 72 },
  { id: 4, name: "Literasi dalam Bahasa Indonesia", students: 26, progress: 80 },
  { id: 5, name: "Literasi dalam Bahasa Inggris", students: 19, progress: 64 },
  { id: 6, name: "Penalaran Matematika", students: 21, progress: 70 },
];

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {});

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createCurrentWeekDays = () => {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + offset);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dayKey = dateKey(date);

    return {
      date: date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      dateShort: date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }),
      dayKey,
      isToday: dayKey === dateKey(today),
      events: [],
    };
  });
};

const eventTypeCfg = {
  live:         { label: "Live Class",   bg: "#691D1B15", color: "#691D1B", icon: <Video         className="w-4 h-4" />, cta: "Mulai Sesi"     },
  deadline:     { label: "Deadline",     bg: "#d4183d15", color: "#d4183d", icon: <FileText      className="w-4 h-4" />, cta: "Upload Sekarang"},
  review:       { label: "Review",       bg: "#1a6b3c15", color: "#1a6b3c", icon: <CheckSquare   className="w-4 h-4" />, cta: "Buka Review"    },
  consultation: { label: "Konsultasi",   bg: "#7c3aed15", color: "#7c3aed", icon: <MessageSquare className="w-4 h-4" />, cta: "Bergabung"      },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TutorSchedule({
  user = null,
  tutorClasses: serverTutorClasses = [],
  schedules: serverSchedules = [],
  week = null,
  stats: serverStats = {},
}) {
  const tutorClasses = asArray(serverTutorClasses).length > 0 ? asArray(serverTutorClasses) : fallbackTutorClasses;
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorInitials = initialsFor(tutorName);
  const serverDays = asArray(serverSchedules);
  const displayScheduleData = serverDays.length > 0 && serverDays.every((day) => Array.isArray(day.events))
    ? serverDays
    : createCurrentWeekDays();
  const defaultSelectedDay = displayScheduleData.find((day) => day.isToday)?.dayKey ?? displayScheduleData[0]?.dayKey ?? "";
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [selectedClass] = useState(tutorClasses[0]?.id ?? 0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [meetingLinkEvent, setMeetingLinkEvent] = useState(null);
  const [meetingLinkValue, setMeetingLinkValue] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const selectedDayData = displayScheduleData.find((d) => d.dayKey === selectedDay) ?? displayScheduleData[0] ?? { date: "Jadwal Tutor", dayKey: "", events: [] };

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const totalThisWeek   = serverStats.totalThisWeek ?? displayScheduleData.reduce((a, d) => a + d.events.length, 0);
  const totalLive       = serverStats.totalLive ?? displayScheduleData.reduce((a, d) => a + d.events.filter(e => e.type === "live").length, 0);
  const totalDeadlines  = serverStats.totalDeadlines ?? displayScheduleData.reduce((a, d) => a + d.events.filter(e => e.type === "deadline").length, 0);
  const totalReviews    = serverStats.totalReviews ?? displayScheduleData.reduce((a, d) => a + d.events.filter(e => e.type === "review").length, 0);
  const classDetailHref = (courseName, courseId = null) => {
    const id = courseId ?? tutorClasses.find((cls) => cls.name === courseName)?.id;
    return id ? `/tutor/classes?course_id=${id}` : "/tutor/classes";
  };
  const weeklyScheduleFor = (cls) => {
    const labels = displayScheduleData
      .flatMap((day) => day.events
        .filter((event) => Number(event.course_id) === Number(cls.id) || event.course === cls.name)
        .map((event) => `${day.dateShort} - ${event.time}`))
      .filter(Boolean);

    return [...new Set(labels)].join(" / ") || cls.weeklySchedule || "Belum ada jadwal minggu ini";
  };
  const openMeetingLinkEditor = (event) => {
    setMeetingLinkEvent(event);
    setMeetingLinkValue(event.meeting_link || "");
  };
  const closeMeetingLinkEditor = () => {
    setMeetingLinkEvent(null);
    setMeetingLinkValue("");
  };
  const saveMeetingLink = (event) => {
    event.preventDefault();

    if (!meetingLinkEvent?.id) {
      return;
    }

    router.patch(`/tutor/schedule/${meetingLinkEvent.id}/meeting-link`, {
      meeting_link: meetingLinkValue,
    }, {
      preserveScroll: true,
      onSuccess: closeMeetingLinkEditor,
    });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="schedule" selectedClassId={selectedClass} onEditProfile={() => setShowProfileModal(true)} />

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#D8D7BE] px-6 py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/tutor/dashboard" className="p-2 rounded-lg hover:bg-[#F7F2E7] text-[#691D1B] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h2 className="text-gray-900" style={{ fontWeight: 700 }}>Jadwal Mengajar</h2>
                <p className="text-xs text-gray-400">
                  Minggu ini - {week?.label ?? "jadwal aktif"} - Jam sekarang {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <TutorNotificationBell />
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto space-y-5">

          {/* ── Legend ──────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(eventTypeCfg).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: cfg.color, fontWeight: 600 }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>{cfg.icon}</div>
                {cfg.label}
              </div>
            ))}
          </div>

          {/* ── Day tabs ─────────────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {displayScheduleData.map((day) => {
              const hasDeadline = day.events.some(e => e.type === "deadline");
              const hasReview   = day.events.some(e => e.type === "review");
              return (
                <button
                  key={day.dayKey}
                  onClick={() => setSelectedDay(day.dayKey)}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm transition-all relative"
                  style={
                    selectedDay === day.dayKey
                      ? { background: "#691D1B", color: "white", fontWeight: 700 }
                      : { background: "white", color: "#555", border: "1px solid #D8D7BE", fontWeight: 500 }
                  }
                >
                  {day.dateShort}
                  {hasDeadline && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#d4183d]" />}
                  {hasReview && !hasDeadline && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#1a6b3c]" />}
                </button>
              );
            })}
          </div>

          {/* ── Events ──────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" style={{ color: "#691D1B" }} />
              <h3 className="text-sm" style={{ fontWeight: 700, color: "#691D1B" }}>{selectedDayData.date}</h3>
              {selectedDayData.isToday && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFE882", color: "#691D1B", fontWeight: 700 }}>Hari ini</span>
              )}
            </div>

            {selectedDayData.events.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D8D7BE] p-12 text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">Tidak ada jadwal untuk hari ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayData.events.map((ev) => {
                  const cfg = eventTypeCfg[ev.type];
                  const canStartSession = ev.meeting_link && ev.status !== "completed";
                  const canEditMeetingLink = ev.status !== "completed";
                  return (
                    <div key={ev.id} className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="flex">
                        <div className="w-1.5 flex-shrink-0" style={{ background: cfg.color }} />
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                                {cfg.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{ev.title}</h3>
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                  {ev.course}
                                  {ev.students > 0 && <> • <span style={{ fontWeight: 600 }}>{ev.students} siswa</span></>}
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />{ev.time}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => canEditMeetingLink && openMeetingLinkEditor(ev)}
                                    disabled={!canEditMeetingLink}
                                    className={`flex items-center gap-1 text-xs text-gray-400 transition-colors ${canEditMeetingLink ? "hover:text-[#691D1B]" : "cursor-not-allowed opacity-60"}`}
                                    title={canEditMeetingLink ? (ev.meeting_link ? "Edit link meeting" : "Tambah link meeting") : "Sesi sudah berakhir"}
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    {ev.meeting_link ? "Online Meeting" : "Tambah link meeting"}
                                    <Link2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {ev.type === "live" || ev.type === "consultation" ? (
                              canStartSession ? (
                                <a
                                  href={ev.start_session_url || `/tutor/schedule/${ev.id}/start`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all hover:opacity-80"
                                  style={{ background: cfg.color, color: "white", fontWeight: 700 }}
                                >
                                  {cfg.cta}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(event) => event.preventDefault()}
                                  className="flex-shrink-0 px-4 py-2 rounded-xl text-xs cursor-not-allowed opacity-55"
                                  style={{ background: cfg.color, color: "white", fontWeight: 700 }}
                                  title={ev.status === "completed" ? "Sesi ini sudah berakhir" : "Tambahkan link meeting terlebih dahulu"}
                                >
                                  {cfg.cta}
                                </button>
                              )
                            ) : (
                              <Link
                                href={ev.type === "deadline" ? "/tutor/upload" : classDetailHref(ev.course, ev.course_id)}
                                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all hover:opacity-80"
                                style={{ background: cfg.color, color: "white", fontWeight: 700 }}
                              >
                                {cfg.cta}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Week Summary ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5">
            <h3 className="text-sm mb-4" style={{ fontWeight: 700, color: "#691D1B" }}>Ringkasan Minggu Ini</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Sesi",   value: totalThisWeek,  color: "#691D1B" },
                { label: "Live Class",   value: totalLive,       color: "#691D1B" },
                { label: "Deadline",     value: totalDeadlines,  color: "#d4183d" },
                { label: "Review",       value: totalReviews,    color: "#1a6b3c" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: "#F7F2E7" }}>
                  <div className="text-2xl" style={{ fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Kelas Aktif Week Overview ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4" style={{ color: "#691D1B" }} />
              <h3 className="text-sm" style={{ fontWeight: 700, color: "#691D1B" }}>Kelas Aktif</h3>
            </div>
            <div className="space-y-3">
              {tutorClasses.map((cls) => {
                const sessionsThisWeek = displayScheduleData.reduce(
                  (a, d) => a + d.events.filter(e => e.course === cls.name && e.type === "live").length, 0
                );
                return (
                  <div key={cls.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F7F2E7" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#691D1B15", color: "#691D1B" }}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{cls.name}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{weeklyScheduleFor(cls)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={{ color: "#691D1B", fontWeight: 700 }}>{sessionsThisWeek} sesi</div>
                      <div className="text-xs text-gray-400">{cls.students} siswa</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
      {meetingLinkEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#F7F2E7] p-5" style={{ background: "#691D1B" }}>
              <div>
                <h3 className="text-white" style={{ fontWeight: 800 }}>Link Online Meeting</h3>
                <p className="mt-1 text-xs text-white/70">{meetingLinkEvent.title}</p>
              </div>
              <button
                type="button"
                onClick={closeMeetingLinkEditor}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={saveMeetingLink} className="space-y-4 p-5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Zoom atau Google Meet URL</span>
                <input
                  type="url"
                  value={meetingLinkValue}
                  onChange={(event) => setMeetingLinkValue(event.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                />
              </label>

              <p className="text-xs leading-relaxed text-gray-500">
                Link ini tersimpan di jadwal yang sama, jadi siswa yang terdaftar di kelas ini juga akan melihat tombol join meeting.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeMeetingLinkEditor}
                  className="rounded-xl border border-[#D8D7BE] px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-[#F7F2E7]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#4A1412]"
                  style={{ background: "#691D1B" }}
                >
                  Simpan Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}

export default TutorSchedule;

