import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  History,
  Trash2,
  Users,
} from "lucide-react";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {});

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function TutorHistory({
  user = null,
  tutorClasses = [],
  history = { data: [] },
  stats = {},
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const classes = asArray(tutorClasses);
  const historyItems = Array.isArray(history?.data) ? history.data : asArray(history);

  const deleteHistory = (item) => {
    if (!window.confirm(`Hapus riwayat "${item.title}"? Riwayat ini akan dihapus permanen.`)) {
      return;
    }

    router.delete(`/tutor/schedule/${item.id}`, {
      preserveScroll: true,
    });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={classes} active="history" onEditProfile={() => setShowProfileModal(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#D8D7BE] px-6 py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/tutor/dashboard" className="p-2 rounded-lg hover:bg-[#F7F2E7] text-[#691D1B] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h2 className="text-gray-900" style={{ fontWeight: 800 }}>Riwayat Mengajar</h2>
                <p className="text-xs text-gray-400">Sesi yang sudah selesai berdasarkan jadwal</p>
              </div>
            </div>
            <TutorNotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Sesi Selesai", value: stats.totalSessions ?? historyItems.length, icon: History },
              { label: "Siswa Aktif", value: stats.totalStudents ?? 0, icon: Users },
              { label: "Course", value: stats.courses ?? classes.length, icon: BookOpen },
              { label: "Terakhir Mengajar", value: formatDate(stats.lastTaught), icon: CheckCircle },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-[#D8D7BE] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xl text-gray-900" style={{ fontWeight: 900 }}>{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              );
            })}
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
            <div className="border-b border-[#F7F2E7] p-5">
              <h3 className="text-[#691D1B]" style={{ fontWeight: 900 }}>Daftar Riwayat</h3>
            </div>

            {historyItems.length === 0 ? (
              <div className="p-10 text-center">
                <History className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                <p className="text-sm text-gray-500" style={{ fontWeight: 700 }}>Belum ada riwayat mengajar.</p>
                <p className="mt-1 text-xs text-gray-400">Sesi akan masuk ke halaman ini setelah waktu jadwal selesai.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F7F2E7]">
                {historyItems.map((item) => (
                  <article key={item.id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "#691D1B15", color: "#691D1B" }}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base text-gray-900" style={{ fontWeight: 900 }}>{item.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">{item.course}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F2E7] px-2.5 py-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {item.date}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F2E7] px-2.5 py-1">
                              <Clock className="h-3.5 w-3.5" />
                              {item.time}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F2E7] px-2.5 py-1">
                              <Users className="h-3.5 w-3.5" />
                              {item.students} siswa
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {item.meeting_link && (
                          <a
                            href={item.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D7BE] px-4 py-2 text-sm text-gray-600 hover:bg-[#F7F2E7]"
                          >
                            Link sesi
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          href={`/tutor/classes?course_id=${item.course_id}`}
                          className="inline-flex items-center rounded-xl px-4 py-2 text-sm text-white hover:bg-[#4A1412]"
                          style={{ background: "#691D1B", fontWeight: 800 }}
                        >
                          Detail kelas
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteHistory(item)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          style={{ fontWeight: 800 }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {Array.isArray(history?.links) && history.links.length > 3 && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-[#F7F2E7] bg-[#F7F2E7] p-4">
                {history.links.map((link, index) => (
                  <Link
                    key={`${link.label}-${index}`}
                    href={link.url || "#"}
                    preserveScroll
                    className={`rounded-lg px-3 py-2 text-xs ${link.active ? "text-white" : "text-gray-600"} ${!link.url ? "pointer-events-none opacity-40" : ""}`}
                    style={link.active ? { background: "#691D1B", fontWeight: 800 } : { background: "white", fontWeight: 700 }}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
