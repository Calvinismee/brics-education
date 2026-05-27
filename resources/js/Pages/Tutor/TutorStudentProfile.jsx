import { Link } from "@inertiajs/react";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  TrendingUp,
  User,
  Video,
} from "lucide-react";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {});

const initialsFor = (name) => String(name || "Siswa")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function TutorStudentProfile({
  user = null,
  tutorClasses = [],
  student = null,
  enrollments = [],
  recentSchedules = [],
  stats = {},
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const classes = asArray(tutorClasses);
  const enrollmentItems = asArray(enrollments);
  const scheduleItems = asArray(recentSchedules);
  const studentName = student?.name ?? "Siswa";

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={classes} active="classes" onEditProfile={() => setShowProfileModal(true)} />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={classes}
        active="classes"
        onEditProfile={() => setShowProfileModal(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Link href="/tutor/classes" className="p-2 rounded-lg hover:bg-[#F7F2E7] text-[#691D1B] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 800 }}>Profil Siswa</h2>
                <p className="truncate text-xs text-gray-400">Ringkasan kelas dan aktivitas siswa</p>
              </div>
            </div>
            <div className="flex-shrink-0"><TutorNotificationBell /></div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-5 sm:p-6 space-y-5 sm:space-y-6">
          <section className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 900 }}>
                  {initialsFor(studentName)}
                </div>
                <div className="min-w-0">
                  <h1 className="break-words text-xl text-gray-900 sm:text-2xl" style={{ fontWeight: 900 }}>{studentName}</h1>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-[#691D1B]" />
                      {student?.email ?? "-"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4 text-[#691D1B]" />
                      Bergabung {student?.joined_at ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/tutor/classes"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white hover:bg-[#4A1412] md:w-auto"
                style={{ background: "#691D1B", fontWeight: 800 }}
              >
                <BookOpen className="h-4 w-4" />
                Kembali ke Monitor
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Course Tutor", value: stats.courses ?? enrollmentItems.length, icon: BookOpen },
              { label: "Progress", value: `${stats.avgProgress ?? 0}%`, icon: TrendingUp },
              { label: "Nilai", value: stats.avgScore ?? 0, icon: CheckCircle },
              { label: "Kehadiran", value: `${stats.avgAttendance ?? 0}%`, icon: Calendar },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              );
            })}
          </section>

          <div className="grid gap-6 xl:grid-cols-5">
            <section className="xl:col-span-3 rounded-2xl border border-[#D8D7BE] bg-white shadow-sm overflow-hidden">
              <div className="border-b border-[#F7F2E7] p-5">
                <h2 className="text-[#691D1B]" style={{ fontWeight: 900 }}>Course yang Diikuti</h2>
                <p className="text-sm text-gray-500">Hanya course yang juga ditugaskan ke tutor ini.</p>
              </div>

              <div className="divide-y divide-[#F7F2E7]">
                {enrollmentItems.map((enrollment) => (
                  <div key={enrollment.id} className="p-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base text-gray-900" style={{ fontWeight: 900 }}>{enrollment.course?.title}</h3>
                        <p className="text-sm text-gray-500">{enrollment.course?.category ?? "UTBK"} - enroll {enrollment.enrolled_at ?? "-"}</p>
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        {enrollment.status}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-[#F7F2E7] p-3">
                        <p className="text-xs text-gray-500">Materi aktif</p>
                        <p className="mt-1 text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>{enrollment.approvedMaterials}/{enrollment.materials}</p>
                      </div>
                      <div className="rounded-xl bg-[#F7F2E7] p-3">
                        <p className="text-xs text-gray-500">Sesi tutor</p>
                        <p className="mt-1 text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>{enrollment.sessions}</p>
                      </div>
                      <div className="rounded-xl bg-[#F7F2E7] p-3">
                        <p className="text-xs text-gray-500">Progress materi</p>
                        <p className="mt-1 text-lg text-[#691D1B]" style={{ fontWeight: 900 }}>{enrollment.progress}%</p>
                      </div>
                    </div>
                  </div>
                ))}

                {enrollmentItems.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">
                    Siswa ini belum terdaftar di course yang ditugaskan ke tutor.
                  </div>
                )}
              </div>
            </section>

            <section className="xl:col-span-2 rounded-2xl border border-[#D8D7BE] bg-white shadow-sm overflow-hidden">
              <div className="border-b border-[#F7F2E7] p-5">
                <h2 className="text-[#691D1B]" style={{ fontWeight: 900 }}>Riwayat Jadwal</h2>
                <p className="text-sm text-gray-500">Sesi terbaru dari course siswa ini.</p>
              </div>

              <div className="divide-y divide-[#F7F2E7]">
                {scheduleItems.map((schedule) => (
                  <div key={schedule.id} className="p-4">
                    <div className="mb-2 flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                        <Video className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-gray-900" style={{ fontWeight: 800 }}>{schedule.title}</p>
                        <p className="text-xs text-gray-500">{schedule.course}</p>
                      </div>
                    </div>
                    <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      {schedule.date} - {schedule.time}
                    </p>
                    {schedule.meeting_link && (
                      <a
                        href={schedule.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white"
                        style={{ background: "#691D1B", fontWeight: 800 }}
                      >
                        Link meeting
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}

                {scheduleItems.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">
                    Belum ada jadwal dari tutor ini.
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
