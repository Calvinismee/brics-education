import { Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Home, Upload, Users, LogOut, Calendar, Bell, ArrowLeft,
  Clock, MapPin, BookOpen, ChevronDown, ChevronRight,
  Video, FileText, CheckSquare, MessageSquare, Star,
  Link2, ExternalLink, X, Plus, Pencil, Trash2,
} from "lucide-react";
import { BricsLogo } from "@/Components/BricsLogo";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";
import { StagedLoadingContent } from "@/Components/ui/LoadingStates";
import DeleteConfirmModal from "@/Components/DeleteConfirmModal";
import { courseClassHref } from "@/utils/slug";

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

const tutorCreateTypes = [
  { value: "live", label: "Live Class" },
  { value: "consultation", label: "Konsultasi" },
  { value: "student_deadline", label: "Deadline Tugas Siswa" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TutorSchedule({
  user = null,
  tutorClasses: serverTutorClasses = [],
  schedules: serverSchedules = [],
  studentDeadlines: serverStudentDeadlines = [],
  week = null,
  stats: serverStats = {},
}) {
  const assignedTutorClasses = asArray(serverTutorClasses);
  const tutorClasses = assignedTutorClasses.length > 0 ? assignedTutorClasses : fallbackTutorClasses;
  const canCreateSchedule = assignedTutorClasses.length > 0;
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorInitials = initialsFor(tutorName);
  const serverDays = asArray(serverSchedules);
  const studentDeadlines = asArray(serverStudentDeadlines);
  const displayScheduleData = serverDays.length > 0 && serverDays.every((day) => Array.isArray(day.events))
    ? serverDays
    : createCurrentWeekDays();
  const defaultSelectedDay = displayScheduleData.find((day) => day.isToday)?.dayKey ?? displayScheduleData[0]?.dayKey ?? "";
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [selectedClass] = useState(tutorClasses[0]?.id ?? 0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [meetingLinkEvent, setMeetingLinkEvent] = useState(null);
  const [meetingLinkValue, setMeetingLinkValue] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [deleteDeadlineTarget, setDeleteDeadlineTarget] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    course_id: tutorClasses[0]?.id ? String(tutorClasses[0].id) : "",
    title: "",
    type: "live",
    schedule_date: defaultSelectedDay || dateKey(new Date()),
    start_time: "09:00",
    end_time: "10:00",
    deadline_time: "23:59",
    meeting_link: "",
    action_link: "",
  });
  const [scheduleErrors, setScheduleErrors] = useState({});
  const [scheduleProcessing, setScheduleProcessing] = useState(false);

  const selectedDayData = displayScheduleData.find((d) => d.dayKey === selectedDay) ?? displayScheduleData[0] ?? { date: "Jadwal Tutor", dayKey: "", events: [] };

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const totalThisWeek   = serverStats.totalThisWeek ?? displayScheduleData.reduce((a, d) => a + d.events.length, 0);
  const totalLive       = serverStats.totalLive ?? displayScheduleData.reduce((a, d) => a + d.events.filter(e => e.type === "live").length, 0);
  const totalDeadlines  = serverStats.totalDeadlines ?? displayScheduleData.reduce((a, d) => a + d.events.filter(e => e.type === "deadline").length, 0);
  const totalReviews    = serverStats.totalReviews ?? displayScheduleData.reduce((a, d) => a + d.events.filter(e => e.type === "review").length, 0);
  const totalConsultations = serverStats.totalConsultations ?? displayScheduleData.reduce((a, d) => a + d.events.filter(e => e.type === "consultation").length, 0);
  const classDetailHref = (courseName, courseId = null) => {
    const found = tutorClasses.find((cls) => cls.name === courseName || Number(cls.id) === Number(courseId));
    return courseClassHref(found, courseName || courseId);
  };
  const weeklyScheduleFor = (cls) => {
    const labels = displayScheduleData
      .flatMap((day) => day.events
        .filter((event) => Number(event.course_id) === Number(cls.id) || event.course === cls.name)
        .map((event) => `${day.dateShort} - ${event.time}`))
      .filter(Boolean);

    return [...new Set(labels)].join(" / ") || cls.weeklySchedule || "Belum ada jadwal minggu ini";
  };
  const openScheduleForm = (type = "live") => {
    setEditingScheduleId(null);
    setScheduleForm({
      course_id: tutorClasses[0]?.id ? String(tutorClasses[0].id) : "",
      title: "",
      type,
      schedule_date: selectedDay || dateKey(new Date()),
      start_time: "09:00",
      end_time: "10:00",
      deadline_time: "23:59",
      meeting_link: "",
      action_link: "",
    });
    setScheduleErrors({});
    setScheduleModalOpen(true);
  };
  const openDeadlineForm = () => openScheduleForm("student_deadline");
  const closeScheduleForm = () => {
    if (!scheduleProcessing) {
      setScheduleModalOpen(false);
      setEditingScheduleId(null);
      setScheduleErrors({});
    }
  };
  const openDeadlineEditor = (deadline) => {
    setEditingScheduleId(deadline.id);
    setScheduleForm({
      course_id: String(deadline.course_id),
      title: deadline.title,
      type: "student_deadline",
      schedule_date: deadline.schedule_date,
      start_time: "00:00",
      end_time: deadline.deadline_time,
      deadline_time: deadline.deadline_time,
      meeting_link: "",
      action_link: deadline.action_link || "",
    });
    setScheduleErrors({});
    setScheduleModalOpen(true);
  };
  const updateScheduleField = (field, value) => {
    setScheduleForm((current) => ({ ...current, [field]: value }));
  };
  const saveSchedule = (event) => {
    event.preventDefault();

    setScheduleProcessing(true);
    setScheduleErrors({});

    const options = {
      preserveScroll: true,
      onError: (errors) => setScheduleErrors(errors),
      onSuccess: () => {
        setScheduleModalOpen(false);
        setEditingScheduleId(null);
      },
      onFinish: () => setScheduleProcessing(false),
    };

    if (editingScheduleId) {
      router.put(`/tutor/schedule/${editingScheduleId}`, scheduleForm, options);
      return;
    }

    router.post("/tutor/schedule", scheduleForm, options);
  };
  const deleteDeadline = () => {
    if (!deleteDeadlineTarget?.id) {
      return;
    }

    router.delete(`/tutor/schedule/${deleteDeadlineTarget.id}`, {
      preserveScroll: true,
      onFinish: () => setDeleteDeadlineTarget(null),
    });
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
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="schedule" selectedClassId={selectedClass} />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="schedule"
        selectedClassId={selectedClass}
      />

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Link href="/tutor/dashboard" className="p-2 rounded-lg hover:bg-[#F7F2E7] text-[#691D1B] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 700 }}>Jadwal Mengajar</h2>
                <p className="truncate text-xs text-gray-400">
                  Minggu ini - {week?.label ?? "jadwal aktif"} - Jam sekarang {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => openScheduleForm()}
                disabled={!canCreateSchedule}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white transition hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                style={{ background: "#691D1B" }}
                title={canCreateSchedule ? "Tambah jadwal mengajar" : "Belum ada course yang ditugaskan"}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Jadwal</span>
              </button>
              <TutorNotificationBell />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-4 py-5 sm:p-6 space-y-5">

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
                <button
                  type="button"
                  onClick={() => openScheduleForm()}
                  disabled={!canCreateSchedule}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: "#691D1B" }}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Jadwal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayData.events.map((ev) => {
                  const cfg = eventTypeCfg[ev.type] ?? eventTypeCfg.live;
                  const supportsMeeting = ev.type === "live" || ev.type === "consultation";
                  const completed = ev.status === "completed" || new Date(ev.end_time).getTime() <= currentTime.getTime();
                  const canStartSession = supportsMeeting && ev.meeting_link && !completed;
                  const canEditMeetingLink = supportsMeeting && !completed;
                  return (
                    <div key={ev.id} className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="flex">
                        <div className="w-1.5 flex-shrink-0" style={{ background: cfg.color }} />
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                                {cfg.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="break-words text-sm text-gray-900" style={{ fontWeight: 700 }}>{ev.title}</h3>
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
                                  {supportsMeeting ? (
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
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                      <MapPin className="w-3.5 h-3.5" />
                                      Pengingat tutor
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {supportsMeeting ? (
                              canStartSession ? (
                                <a
                                  href={ev.start_session_url || `/tutor/schedule/${ev.id}/start`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex w-full flex-shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs transition-all hover:opacity-80 sm:w-auto"
                                  style={{ background: cfg.color, color: "white", fontWeight: 700 }}
                                >
                                  {cfg.cta}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!completed) {
                                      openMeetingLinkEditor(ev);
                                    }
                                  }}
                                  className={`w-full flex-shrink-0 rounded-xl px-4 py-2 text-xs sm:w-auto ${completed ? "cursor-not-allowed opacity-55" : "hover:opacity-80"}`}
                                  style={{ background: cfg.color, color: "white", fontWeight: 700 }}
                                  title={completed ? "Sesi ini sudah berakhir" : "Tambahkan link meeting terlebih dahulu"}
                                  disabled={completed}
                                >
                                  {completed ? "Sudah Berakhir" : "Tambah Link"}
                                </button>
                              )
                            ) : completed ? (
                              <span
                                className="inline-flex w-full flex-shrink-0 cursor-not-allowed items-center justify-center rounded-xl px-4 py-2 text-xs opacity-55 sm:w-auto"
                                style={{ background: cfg.color, color: "white", fontWeight: 700 }}
                              >
                                Sudah Berakhir
                              </span>
                            ) : (
                              <Link
                                href={ev.type === "deadline" ? "/tutor/upload" : classDetailHref(ev.course, ev.course_id)}
                                className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-xl px-4 py-2 text-xs transition-all hover:opacity-80 sm:w-auto"
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Total Sesi",   value: totalThisWeek,  color: "#691D1B" },
                { label: "Live Class",   value: totalLive,       color: "#691D1B" },
                { label: "Deadline",     value: totalDeadlines,  color: "#d4183d" },
                { label: "Review",       value: totalReviews,    color: "#1a6b3c" },
                { label: "Konsultasi",   value: totalConsultations, color: "#7c3aed" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: "#F7F2E7" }}>
                  <div className="text-2xl" style={{ fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Kelas Aktif Week Overview ─────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#F7F2E7] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm" style={{ fontWeight: 700, color: "#691D1B" }}>Deadline Tugas Siswa</h3>
                <p className="mt-1 text-xs text-gray-500">Kelola batas pengumpulan dan link Form yang sudah dikirim ke siswa.</p>
              </div>
              <button
                type="button"
                onClick={openDeadlineForm}
                disabled={!canCreateSchedule}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white transition hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "#691D1B" }}
              >
                <Plus className="h-4 w-4" />
                Tambah Deadline
              </button>
            </div>

            {studentDeadlines.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="mx-auto mb-3 h-9 w-9 text-gray-200" />
                <p className="text-sm text-gray-400">Belum ada deadline tugas siswa.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F7F2E7]">
                {studentDeadlines.map((deadline) => {
                  const completed = deadline.status === "completed" || new Date(deadline.deadline_at).getTime() <= currentTime.getTime();

                  return (
                    <div key={deadline.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="break-words text-sm font-bold text-gray-900">{deadline.title}</p>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${completed ? "bg-gray-100 text-gray-500" : "bg-pink-50 text-pink-700"}`}>
                            {completed ? "Berakhir" : "Aktif"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{deadline.course}</p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          Deadline {deadline.deadline_label}
                        </p>
                      </div>

                      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        {!completed && deadline.action_link && (
                          <a
                            href={deadline.action_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D8D7BE] px-3 text-xs font-semibold text-[#691D1B] hover:bg-[#F7F2E7] sm:flex-none"
                          >
                            Link Form
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openDeadlineEditor(deadline)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D7BE] text-gray-500 hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                          title="Edit deadline"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteDeadlineTarget(deadline)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                          title="Hapus deadline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[100dvh] w-full max-w-2xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#F7F2E7] p-4 sm:p-5" style={{ background: "#691D1B" }}>
              <div>
                <h3 className="text-white" style={{ fontWeight: 800 }}>{editingScheduleId ? "Edit Deadline Tugas" : "Tambah Jadwal"}</h3>
                <p className="mt-1 text-xs text-white/70">
                  {editingScheduleId ? "Perbarui informasi dan link pengumpulan tugas siswa." : "Buat live class, konsultasi, atau deadline tugas untuk siswa."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeScheduleForm}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={saveSchedule} className="max-h-[calc(100dvh-84px)] space-y-4 overflow-y-auto p-4 sm:max-h-[calc(92vh-84px)] sm:p-5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Course</span>
                <select
                  value={scheduleForm.course_id}
                  onChange={(event) => updateScheduleField("course_id", event.target.value)}
                  className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                >
                  {assignedTutorClasses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name || course.title}</option>
                  ))}
                </select>
                {scheduleErrors.course_id && <p className="text-xs font-semibold text-red-600">{scheduleErrors.course_id}</p>}
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Judul Jadwal</span>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(event) => updateScheduleField("title", event.target.value)}
                  placeholder="Contoh: Live Class Penalaran Umum"
                  className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                />
                {scheduleErrors.title && <p className="text-xs font-semibold text-red-600">{scheduleErrors.title}</p>}
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Tipe Jadwal</span>
                <select
                  value={scheduleForm.type}
                  onChange={(event) => updateScheduleField("type", event.target.value)}
                  disabled={!!editingScheduleId}
                  className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                >
                  {tutorCreateTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {scheduleErrors.type && <p className="text-xs font-semibold text-red-600">{scheduleErrors.type}</p>}
              </label>

              <div className={`grid gap-4 ${scheduleForm.type === "student_deadline" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Tanggal</span>
                  <input
                    type="date"
                    value={scheduleForm.schedule_date}
                    onChange={(event) => updateScheduleField("schedule_date", event.target.value)}
                    className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                  />
                  {scheduleErrors.schedule_date && <p className="text-xs font-semibold text-red-600">{scheduleErrors.schedule_date}</p>}
                </label>

                {scheduleForm.type === "student_deadline" ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Jam Deadline</span>
                    <input
                      type="time"
                      value={scheduleForm.deadline_time}
                      onChange={(event) => updateScheduleField("deadline_time", event.target.value)}
                      required
                      className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                    />
                    {scheduleErrors.deadline_time && <p className="text-xs font-semibold text-red-600">{scheduleErrors.deadline_time}</p>}
                  </label>
                ) : (
                  <>
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Mulai</span>
                      <input
                        type="time"
                        value={scheduleForm.start_time}
                        onChange={(event) => updateScheduleField("start_time", event.target.value)}
                        className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                      />
                      {scheduleErrors.start_time && <p className="text-xs font-semibold text-red-600">{scheduleErrors.start_time}</p>}
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-gray-700">Selesai</span>
                      <input
                        type="time"
                        value={scheduleForm.end_time}
                        onChange={(event) => updateScheduleField("end_time", event.target.value)}
                        className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                      />
                      {scheduleErrors.end_time && <p className="text-xs font-semibold text-red-600">{scheduleErrors.end_time}</p>}
                    </label>
                  </>
                )}
              </div>

              {(scheduleForm.type === "live" || scheduleForm.type === "consultation") && (
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Link Meeting</span>
                  <input
                    type="url"
                    value={scheduleForm.meeting_link}
                    onChange={(event) => updateScheduleField("meeting_link", event.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                  />
                  {scheduleErrors.meeting_link && <p className="text-xs font-semibold text-red-600">{scheduleErrors.meeting_link}</p>}
                </label>
              )}

              {scheduleForm.type === "student_deadline" && (
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Link Pengumpulan Tugas</span>
                  <input
                    type="url"
                    value={scheduleForm.action_link}
                    onChange={(event) => updateScheduleField("action_link", event.target.value)}
                    placeholder="https://forms.gle/..."
                    required
                    className="w-full rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-4 py-3 text-sm outline-none focus:border-[#691D1B]"
                  />
                  <p className="text-xs leading-relaxed text-gray-500">Wajib diisi. Deadline ini akan muncul di jadwal siswa dan tetap dapat dimonitor admin.</p>
                  {scheduleErrors.action_link && <p className="text-xs font-semibold text-red-600">{scheduleErrors.action_link}</p>}
                </label>
              )}

              <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-col-reverse gap-2 border-t border-[#F7F2E7] bg-white px-4 py-4 sm:static sm:mx-0 sm:mb-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-2">
                <button
                  type="button"
                  onClick={closeScheduleForm}
                  disabled={scheduleProcessing}
                  className="w-full rounded-xl border border-[#D8D7BE] px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-[#F7F2E7] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={scheduleProcessing || !canCreateSchedule}
                  className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#4A1412] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  style={{ background: "#691D1B" }}
                >
                  <StagedLoadingContent loading={scheduleProcessing} loadingLabel="Menyimpan..." longLoadingLabel="Masih menyimpan jadwal...">
                    {editingScheduleId ? "Simpan Perubahan" : "Simpan Jadwal"}
                  </StagedLoadingContent>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {meetingLinkEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#F7F2E7] p-4 sm:p-5" style={{ background: "#691D1B" }}>
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

            <form onSubmit={saveMeetingLink} className="space-y-4 p-4 sm:p-5">
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

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeMeetingLinkEditor}
                  className="w-full rounded-xl border border-[#D8D7BE] px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-[#F7F2E7] sm:w-auto"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-[#4A1412] sm:w-auto"
                  style={{ background: "#691D1B" }}
                >
                  Simpan Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeleteConfirmModal
        open={!!deleteDeadlineTarget}
        title="Hapus deadline tugas?"
        description="Deadline akan dihapus dari jadwal seluruh siswa yang mengikuti course ini."
        details={deleteDeadlineTarget ? (
          <p className="text-sm text-gray-700">
            {deleteDeadlineTarget.title} - Deadline {deleteDeadlineTarget.deadline_label}
          </p>
        ) : null}
        confirmLabel="Ya, hapus deadline"
        onCancel={() => setDeleteDeadlineTarget(null)}
        onConfirm={deleteDeadline}
      />
    </div>
  );
}

export default TutorSchedule;
