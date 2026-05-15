import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
  Home, BookOpen, Upload, Users, LogOut, Calendar, Video, FileText,
  Bell, ArrowLeft, Search, Filter, TrendingUp, Star, Clock,
  CheckCircle, AlertCircle, MoreVertical, ChevronDown, ChevronRight,
  Paperclip, Eye, Download, Pencil, Settings as SettingsIcon,
  Trash2,
} from "lucide-react";
import { BricsLogo } from "@/Components/BricsLogo";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";

// ─── Data ─────────────────────────────────────────────────────────────────────

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

// ─── Component ────────────────────────────────────────────────────────────────

export function TutorClassMonitoring({
  user = null,
  classes: serverClasses = [],
  selectedClassId = null,
  students: serverStudents = [],
  materials: serverMaterials = [],
  settings = {},
}) {
  const classList = Array.isArray(serverClasses) ? serverClasses : Object.values(serverClasses ?? {});
  const studentList = Array.isArray(serverStudents) ? serverStudents : Object.values(serverStudents ?? {});
  const materialList = Array.isArray(serverMaterials) ? serverMaterials : Object.values(serverMaterials ?? {});
  const displayClasses = classList;
  const selectedClass = selectedClassId ?? displayClasses[0]?.id ?? null;
  const [classDropdownOpen, setClassDropdownOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [studentSort, setStudentSort] = useState("name-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [studentMenuOpen, setStudentMenuOpen] = useState(null);
  const [materialFilter, setMaterialFilter] = useState("all");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorInitials = initialsFor(tutorName);
  const showProgressWarnings = settings.teaching?.showProgressWarnings ?? true;

  const cls      = displayClasses.find((item) => String(item.id) === String(selectedClass)) ?? displayClasses[0] ?? { id: null, name: "Belum ada kelas", students: 0, progress: 0 };
  const students = studentList;
  const materi   = materialList;
  const searchedStudents = students.filter(
    (s) => String(s.name ?? "").toLowerCase().includes(search.toLowerCase()) || String(s.email ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const filtered = [...searchedStudents].sort((a, b) => {
    if (studentSort === "progress-desc") return (b.progress ?? 0) - (a.progress ?? 0);
    if (studentSort === "score-desc") return (b.score ?? 0) - (a.score ?? 0);
    if (studentSort === "attendance-desc") return (b.attendance ?? 0) - (a.attendance ?? 0);
    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
  });
  const materialTabs = [
    { key: "all", label: "Semua", count: materi.length },
    { key: "video", label: "Video", count: materi.filter((m) => m.type === "video").length },
    { key: "module", label: "Modul", count: materi.filter((m) => m.type === "module").length },
    { key: "quiz", label: "Bank Soal", count: materi.filter((m) => m.type === "quiz").length },
  ];
  const filteredMateri = materialFilter === "all" ? materi : materi.filter((m) => m.type === materialFilter);

  const getProgressColor = (p) => p >= 80 ? "#22c55e" : p >= 60 ? "#f59e0b" : "#ef4444";

  const statusCfg = {
    approved: { label: "Aktif",   bg: "#22c55e15", color: "#16a34a" },
    pending:  { label: "Review",  bg: "#FFE88230", color: "#d97706" },
    rejected: { label: "Ditolak", bg: "#ef444415", color: "#ef4444" },
  };

  const typeIcon = (t) => {
    if (t === "video")  return <Video      className="w-4 h-4" />;
    if (t === "module") return <FileText   className="w-4 h-4" />;
    return                     <BookOpen   className="w-4 h-4" />;
  };

  const materialHref = (meta) => {
    if (!meta) return "#";
    if (meta.startsWith("http") || meta.startsWith("/")) return meta;
    return `https://${meta}`;
  };

  const deleteMaterial = (material) => {
    const confirmed = window.confirm(
      `Hapus materi "${material.title}"?\n\nMateri yang sudah dihapus tidak bisa dikembalikan. Jika ingin mengupload ulang, tutor perlu request ke admin untuk proses review ulang.`
    );

    if (!confirmed) return;

    router.delete(`/tutor/materials/${material.id}`, {
      preserveScroll: true,
    });
  };

  const avgScore      = students.length ? Math.round(students.reduce((a, s) => a + s.score,      0) / students.length) : 0;
  const avgAttendance = students.length ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length) : 0;

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <TutorSidebar user={user} tutorClasses={displayClasses} active="classes" selectedClassId={selectedClass} onEditProfile={() => setShowProfileModal(true)} />

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
                <h2 className="text-gray-900" style={{ fontWeight: 700 }}>Monitor Kelas</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs text-gray-400">{cls.name}</p>
                </div>
              </div>
            </div>
            <TutorNotificationBell />
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto space-y-6">

          {/* ── Stats ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Siswa",    value: String(cls.students ?? 0), icon: <Users       className="w-5 h-5" /> },
              { label: "Progres Kelas",  value: `${cls.progress ?? 0}%`,   icon: <TrendingUp  className="w-5 h-5" /> },
              { label: "Nilai Rata-rata",value: `${avgScore}/100`,        icon: <Star        className="w-5 h-5" /> },
              { label: "Kehadiran",      value: `${avgAttendance}%`,      icon: <CheckCircle className="w-5 h-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-[#D8D7BE]">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#691D1B15", color: "#691D1B" }}>
                  {stat.icon}
                </div>
                <div className="text-xl text-gray-900" style={{ fontWeight: 800 }}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Two-column: Students + Materials ───────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* Students Table */}
            <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-[#D8D7BE] overflow-hidden">
              <div className="p-5 border-b border-[#F7F2E7] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Daftar Siswa</h3>
                  <p className="text-xs text-gray-400">{cls.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 border border-[#D8D7BE] rounded-lg bg-[#F7F2E7]">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent outline-none text-sm w-28"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSortOpen((value) => !value)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-[#D8D7BE] rounded-lg text-sm text-gray-600 hover:border-[#691D1B] transition-colors"
                      title="Urutkan siswa"
                    >
                      <Filter className="w-4 h-4" />
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {sortOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-[#D8D7BE] rounded-xl shadow-lg z-20 overflow-hidden">
                        {[
                          { key: "name-asc", label: "Nama A-Z" },
                          { key: "progress-desc", label: "Progress tertinggi" },
                          { key: "score-desc", label: "Nilai tertinggi" },
                          { key: "attendance-desc", label: "Kehadiran tertinggi" },
                        ].map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              setStudentSort(option.key);
                              setSortOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F7F2E7] transition-colors"
                            style={{ color: studentSort === option.key ? "#691D1B" : "#4b5563", fontWeight: studentSort === option.key ? 700 : 500 }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F7F2E7]">
                      {["Siswa", "Progres", "Nilai", "Hadir", "Aktif", ""].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide"
                          style={{ fontWeight: 700, background: "#F7F2E7" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F2E7]">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F7F2E7] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 800 }}>
                              {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm text-gray-800 whitespace-nowrap" style={{ fontWeight: 600 }}>{s.name}</p>
                              <p className="text-xs text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-[#F7F2E7]">
                              <div className="h-1.5 rounded-full" style={{ width: `${s.progress}%`, background: getProgressColor(s.progress) }} />
                            </div>
                            <span className="text-xs" style={{ color: getProgressColor(s.progress), fontWeight: 600 }}>{s.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm" style={{ fontWeight: 700, color: s.score >= 80 ? "#16a34a" : s.score >= 60 ? "#d97706" : "#ef4444" }}>
                            {s.score}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{
                            background: s.attendance >= 90 ? "#22c55e15" : s.attendance >= 75 ? "#f59e0b15" : "#ef444415",
                            color: s.attendance >= 90 ? "#16a34a" : s.attendance >= 75 ? "#d97706" : "#ef4444",
                            fontWeight: 600,
                          }}>
                            {s.attendance}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />{s.lastActive}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {showProgressWarnings && s.progress < 60 && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "#ef444415", color: "#ef4444", fontWeight: 600 }}>
                                <AlertCircle className="w-3 h-3" />Perhatian
                              </span>
                            )}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setStudentMenuOpen((current) => current === s.id ? null : s.id)}
                                className="p-1 rounded-lg hover:bg-[#691D1B15] text-gray-400 hover:text-[#691D1B] transition-colors"
                                aria-label={`Menu ${s.name}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {studentMenuOpen === s.id && (
                                <div className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-[#D8D7BE] bg-white shadow-lg">
                                  <Link
                                    href={`/tutor/students/${s.id}`}
                                    className="block px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-[#F7F2E7] hover:text-[#691D1B]"
                                  >
                                    Lihat profil siswa
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-[#F7F2E7] border-t border-[#D8D7BE] flex justify-between items-center">
                <span className="text-xs text-gray-500">Menampilkan {filtered.length} dari {students.length} siswa</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2].map((p) => (
                    <button
                      key={p}
                      className="w-7 h-7 rounded-lg text-xs transition-colors"
                      style={p === 1 ? { background: "#691D1B", color: "white", fontWeight: 700 } : { color: "#6b7280" }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Uploaded Materials ──────────────────────────── */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-[#D8D7BE] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#F7F2E7] flex items-center justify-between" style={{ background: "#691D1B" }}>
                <div>
                  <h3 className="text-white" style={{ fontWeight: 700 }}>Materi Kelas</h3>
                  <p className="text-xs" style={{ color: "#FFE882" }}>{filteredMateri.length} dari {materi.length} materi tampil</p>
                </div>
                <Link
                  href="/tutor/upload"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
                  style={{ background: "rgba(255,232,130,0.2)", color: "#FFE882", fontWeight: 600, border: "1px solid rgba(255,232,130,0.3)" }}
                >
                  <Upload className="w-3.5 h-3.5" /> Tambah
                </Link>
              </div>

              {/* Filter tabs */}
              <div className="flex border-b border-[#F7F2E7]" style={{ background: "#F7F2E7" }}>
                {materialTabs.map((tab) => {
                  const active = materialFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setMaterialFilter(tab.key)}
                      className="flex-1 py-2 text-xs transition-colors"
                      style={{ color: active ? "#691D1B" : "#9ca3af", fontWeight: active ? 700 : 500, borderBottom: active ? "2px solid #691D1B" : "2px solid transparent" }}
                    >
                      {tab.label}
                      <span className="ml-1 text-xs" style={{ color: "inherit", opacity: 0.7 }}>({tab.count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 divide-y divide-[#F7F2E7] overflow-y-auto" style={{ maxHeight: 420 }}>
                {filteredMateri.map((m) => {
                  const sc = statusCfg[m.status] ?? statusCfg.pending;
                  return (
                    <div key={m.id} className="p-4 flex items-start gap-3 hover:bg-[#F7F2E7] transition-colors group">
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "#691D1B15", color: "#691D1B" }}
                      >
                        {typeIcon(m.type)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{m.title}</p>

                        {m.type === "video" ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Video className="w-3 h-3 flex-shrink-0" style={{ color: "#FF0000" }} />
                            <span className="text-xs text-gray-400 truncate">{m.meta}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Paperclip className="w-3 h-3 flex-shrink-0 text-gray-400" />
                            <span className="text-xs text-gray-400 truncate">{m.meta}</span>
                          </div>
                        )}

                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1.5"
                          style={{ background: sc.bg, color: sc.color, fontWeight: 600 }}
                        >
                          {m.status === "approved" && <CheckCircle className="w-3 h-3" />}
                          {m.status === "pending"  && <Clock        className="w-3 h-3" />}
                          {m.status === "rejected" && <AlertCircle  className="w-3 h-3" />}
                          {sc.label}
                        </span>
                      </div>

                      {/* Actions — show on hover */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <a
                          href={materialHref(m.meta)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-[#691D1B15] text-gray-400 hover:text-[#691D1B] transition-colors"
                          title="Lihat"
                        >
                          <Eye      className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={materialHref(m.meta)}
                          className="p-1.5 rounded-lg hover:bg-[#691D1B15] text-gray-400 hover:text-[#691D1B] transition-colors"
                          title="Unduh"
                          download={m.type !== "video"}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {(m.can_delete ?? m.uploaded_by_current_tutor) && (
                          <button
                            type="button"
                            onClick={() => deleteMaterial(m)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredMateri.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-400">
                    Belum ada materi untuk filter ini.
                  </div>
                )}
              </div>

              {/* Summary footer */}
              <div className="p-4 border-t border-[#D8D7BE]" style={{ background: "#F7F2E7" }}>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span style={{ fontWeight: 600 }}>Ringkasan</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { label: "Video",      count: materi.filter(m => m.type === "video").length,  icon: <Video    className="w-3.5 h-3.5" /> },
                    { label: "Modul",      count: materi.filter(m => m.type === "module").length, icon: <FileText className="w-3.5 h-3.5" /> },
                    { label: "Bank Soal",  count: materi.filter(m => m.type === "quiz").length,   icon: <BookOpen className="w-3.5 h-3.5" /> },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "white", border: "1px solid #D8D7BE" }}>
                      <span style={{ color: "#691D1B" }}>{item.icon}</span>
                      <span className="text-xs text-gray-600" style={{ fontWeight: 600 }}>{item.count} {item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {[
                    { label: "Aktif",   count: materi.filter(m => m.status === "approved").length, color: "#16a34a" },
                    { label: "Review",  count: materi.filter(m => m.status === "pending").length,  color: "#d97706" },
                    { label: "Ditolak", count: materi.filter(m => m.status === "rejected").length, color: "#ef4444" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span>{item.count} {item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}

export default TutorClassMonitoring;
