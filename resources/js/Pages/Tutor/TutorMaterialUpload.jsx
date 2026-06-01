import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
  Home, BookOpen, Upload, Users, LogOut, Calendar, Video, FileText,
  X, CheckCircle, Clock, AlertCircle, ArrowLeft, Bell,
  Link2, Paperclip, ChevronDown, Star, Info,
} from "lucide-react";
import { BricsLogo } from "@/Components/BricsLogo";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";
import { Spinner } from "@/Components/ui/LoadingStates";

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {});

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const fileMetaLabel = (file) => {
  const extension = String(file?.name ?? "").split(".").pop()?.toUpperCase();

  return extension ? `File ${extension} terlampir` : "File terlampir";
};

const optimisticTitleForType = (title, type) => {
  if (type === "module") return `${title} - Modul`;
  if (type === "quiz") return `${title} - Bank Soal`;

  return title;
};

const buildOptimisticUploadedItems = ({
  baselineCount,
  course,
  title,
  youtubeUrl,
  moduleFile,
  quizFile,
}) => {
  const now = Date.now();
  const common = {
    status: "pending",
    course: course?.title,
    course_id: course?.id,
    uploaded_by_current_tutor: true,
    can_delete: false,
    created_at: new Date(now).toISOString(),
    optimistic: true,
    baselineCount,
  };
  const items = [];

  if (youtubeUrl.trim()) {
    items.push({
      ...common,
      id: `optimistic-${now}-video`,
      name: optimisticTitleForType(title, "video"),
      title: optimisticTitleForType(title, "video"),
      meta: "Link video YouTube",
      url: youtubeUrl.trim(),
      type: "video",
    });
  }

  if (moduleFile) {
    items.push({
      ...common,
      id: `optimistic-${now}-module`,
      name: optimisticTitleForType(title, "module"),
      title: optimisticTitleForType(title, "module"),
      meta: fileMetaLabel(moduleFile),
      url: "#",
      type: "module",
    });
  }

  if (quizFile) {
    items.push({
      ...common,
      id: `optimistic-${now}-quiz`,
      name: optimisticTitleForType(title, "quiz"),
      title: optimisticTitleForType(title, "quiz"),
      meta: fileMetaLabel(quizFile),
      url: "#",
      type: "quiz",
    });
  }

  return items;
};

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────

export function TutorMaterialUpload({
  user = null,
  courses = [],
  tutorClasses: serverTutorClasses = [],
  uploadedItems: serverUploadedItems = [],
}) {
  const rawCourses = asArray(courses).length > 0 ? asArray(courses) : asArray(serverTutorClasses);
  const courseList = rawCourses.map((course) => ({
    id: course.id,
    title: course.title ?? course.name,
    students: course.students ?? 0,
    progress: course.progress ?? 0,
  }));
  const hasAssignedCourses = courseList.length > 0;
  const serverItems = asArray(serverUploadedItems);
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorInitials = initialsFor(tutorName);
  const [activeNav, setActiveNav] = useState("upload");
  const [optimisticUploadedItems, setOptimisticUploadedItems] = useState([]);

  // ── Form state ──
  const [judul, setJudul] = useState("");
  const [kursus, setKursus] = useState(courseList[0]?.title ?? "");
  const [deskripsi, setDeskripsi] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [modulFile, setModulFile] = useState(null);
  const [modulUploadFile, setModulUploadFile] = useState(null);
  const [quizFile, setQuizFile] = useState(null);
  const [quizUploadFile, setQuizUploadFile] = useState(null);
  const [modulDragging, setModulDragging] = useState(false);
  const [quizDragging, setQuizDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tutorClasses = courseList.map((course) => ({
    id: course.id,
    name: course.title,
    students: course.students ?? 0,
    progress: course.progress ?? 0,
  }));

  // ── Uploaded history ──
  const uploadedItems = [
    ...optimisticUploadedItems.filter((item) => serverItems.length <= item.baselineCount),
    ...serverItems,
  ];

  const navItems = [
    { key: "dashboard", label: "Dashboard",    icon: <Home className="w-5 h-5" />,    to: "/tutor/dashboard" },
    { key: "upload",   label: "Upload Materi", icon: <Upload className="w-5 h-5" />,  to: "/tutor/upload" },
    { key: "classes",  label: "Monitor Kelas", icon: <Users className="w-5 h-5" />,   to: "/tutor/classes" },
    { key: "schedule", label: "Jadwal",        icon: <Calendar className="w-5 h-5" />, to: "#" },
    { key: "videos",   label: "Video Saya",    icon: <Video className="w-5 h-5" />,   to: "#" },
    { key: "materials",label: "Materi",        icon: <FileText className="w-5 h-5" />, to: "#" },
  ];

  const statusConfig = {
    approved: { label: "Disetujui",       bg: "#22c55e15", color: "#16a34a", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    pending:  { label: "Menunggu Review", bg: "#FFE88230", color: "#d97706", icon: <Clock className="w-3.5 h-3.5" /> },
    rejected: { label: "Ditolak",         bg: "#ef444415", color: "#ef4444", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  };

  const isValidYoutube = (url) =>
    url === "" || /youtube\.com|youtu\.be/.test(url);

  const hasVideo  = youtubeUrl.trim().length > 0;
  const hasModul  = modulFile !== null;
  const hasQuiz   = quizFile !== null;
  const hasAny    = hasVideo || hasModul || hasQuiz;

  function handleSubmit() {
    if (!hasAssignedCourses) return;
    if (!judul.trim()) return;
    if (!hasAny) { setContentError(true); return; }
    setContentError(false);

    const selectedCourse = courseList.find((course) => course.title === kursus) ?? courseList[0];

    if (selectedCourse) {
      const optimisticBatch = buildOptimisticUploadedItems({
        baselineCount: serverItems.length,
        course: selectedCourse,
        title: judul.trim(),
        youtubeUrl,
        moduleFile: modulUploadFile,
        quizFile: quizUploadFile,
      });

      setIsUploading(true);
      router.post(
        "/tutor/upload",
        {
          course_id: selectedCourse.id,
          title: judul,
          description: deskripsi,
          youtube_url: youtubeUrl,
          module_file: modulUploadFile,
          quiz_file: quizUploadFile,
        },
        {
          forceFormData: true,
          preserveScroll: true,
          onStart: () => setIsUploading(true),
          onSuccess: () => {
            setOptimisticUploadedItems((items) => [...optimisticBatch, ...items]);
            setJudul("");
            setDeskripsi("");
            setYoutubeUrl("");
            setModulFile(null);
            setModulUploadFile(null);
            setQuizFile(null);
            setQuizUploadFile(null);
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            router.reload({
              only: ["uploadedItems", "stats"],
              preserveState: true,
              preserveScroll: true,
            });
          },
          onFinish: () => setIsUploading(false),
        }
      );

      return;
    }

    setContentError(true);
  }

  const typeIcon = (type) => {
    if (type === "video")  return <Video className="w-4 h-4" />;
    if (type === "module") return <FileText className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  const materialHref = (meta) => {
    if (!meta) return "#";
    if (meta === "#" || meta.startsWith("#")) return "#";
    if (meta.startsWith("http") || meta.startsWith("/")) return meta;
    return `https://${meta}`;
  };

  const materialUrl = (item) => materialHref(item.url || item.meta);

  const deleteMaterial = (item) => {
    const confirmed = window.confirm(
      `Hapus materi "${item.name}"?\n\nMateri yang sudah dihapus tidak bisa dikembalikan. Jika ingin mengupload ulang, tutor perlu request ke admin untuk proses review ulang.`
    );

    if (!confirmed) return;

    router.delete(`/tutor/materials/${item.id}`, {
      preserveScroll: true,
    });
  };

  // checklist items for the submit area
  const contentChecklist = [
    { label: "Video YouTube", filled: hasVideo, icon: <Video className="w-3.5 h-3.5" /> },
    { label: "Modul",         filled: hasModul, icon: <FileText className="w-3.5 h-3.5" /> },
    { label: "Bank Soal",     filled: hasQuiz,  icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="upload" />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="upload"
      />

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Link href="/tutor/dashboard" className="p-2 rounded-lg hover:bg-[#F7F2E7] transition-colors" style={{ color: "#691D1B" }}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 700 }}>Upload Materi</h2>
                <p className="truncate text-xs text-gray-400">Kelola konten pembelajaran Anda</p>
              </div>
            </div>
            <div className="flex-shrink-0"><TutorNotificationBell /></div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

            {/* ── Upload Form (unified) ───────────────────────── */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-[#D8D7BE] overflow-hidden">
              <div className="p-5 border-b border-[#F7F2E7]" style={{ background: "#691D1B" }}>
                <h3 className="text-white" style={{ fontWeight: 700 }}>Upload Materi Baru</h3>
                <p className="text-xs" style={{ color: "#FFE882" }}>Isi semua bagian yang relevan, lalu kirim untuk review</p>
              </div>

              <div className="p-4 space-y-5 sm:p-6 sm:space-y-6">

                {/* Success banner */}
                {submitted && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "#22c55e15", border: "1px solid #22c55e40" }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#16a34a" }} />
                    <span className="text-sm" style={{ color: "#16a34a", fontWeight: 600 }}>Materi berhasil dikirim untuk review!</span>
                  </div>
                )}

                {/* Content error banner */}
                {contentError && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "#ef444412", border: "1px solid #ef444440" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#ef4444" }} />
                    <span className="text-sm" style={{ color: "#ef4444", fontWeight: 600 }}>
                      Wajib mengisi minimal satu konten: Video YouTube, Modul, atau Bank Soal.
                    </span>
                  </div>
                )}

                {/* ① Info Umum */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: "#691D1B", fontWeight: 800 }}>1</div>
                    <h4 className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Informasi Umum</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>
                        Judul Materi <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="material-title"
                        type="text"
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        placeholder="Contoh: Penalaran Umum - Strategi Simpulan"
                        className="w-full px-4 py-3 border-2 border-[#D8D7BE] rounded-xl bg-[#F7F2E7] focus:outline-none focus:border-[#691D1B] text-sm transition-colors"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Kursus Terkait</label>
                      <div className="relative">
                        <select
                          value={kursus}
                          onChange={(e) => setKursus(e.target.value)}
                          disabled={!hasAssignedCourses}
                          className="w-full px-4 py-3 border-2 border-[#D8D7BE] rounded-xl bg-[#F7F2E7] focus:outline-none focus:border-[#691D1B] text-sm transition-colors appearance-none pr-10"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {hasAssignedCourses ? (
                            courseList.map((course) => (
                              <option key={course.id}>{course.title}</option>
                            ))
                          ) : (
                            <option>Belum ada course yang ditugaskan</option>
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {!hasAssignedCourses && (
                        <p className="mt-2 text-xs font-semibold text-[#691D1B]">
                          Admin perlu menugaskan course ke akun tutor ini sebelum bisa upload materi.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Deskripsi Materi</label>
                      <textarea
                        rows={3}
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Jelaskan topik, tujuan belajar, dan konten yang akan dibahas..."
                        className="w-full px-4 py-3 border-2 border-[#D8D7BE] rounded-xl bg-[#F7F2E7] focus:outline-none focus:border-[#691D1B] text-sm transition-colors resize-none"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                </section>

                <div className="border-t border-[#F7F2E7]" />

                {/* ── Konten wajib notice ── */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#FFE88220", border: "1px solid #FFE88260" }}>
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#691D1B" }} />
                  <p className="text-xs" style={{ color: "#691D1B", fontWeight: 600 }}>
                    Wajib mengisi <span style={{ textDecoration: "underline" }}>minimal satu</span> dari konten berikut: Video YouTube, Modul, atau Bank Soal.
                  </p>
                </div>

                {/* ② Video Pembelajaran — YouTube Link */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: "#691D1B", fontWeight: 800 }}>2</div>
                    <h4 className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Video Pembelajaran</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFE88230", color: "#691D1B", fontWeight: 600 }}>YouTube</span>
                    {hasVideo && <CheckCircle className="w-4 h-4 ml-auto" style={{ color: "#16a34a" }} />}
                  </div>

                  <div
                    className={`rounded-xl border-2 overflow-hidden focus-within:border-[#691D1B] transition-colors ${
                      contentError && !hasAny ? "border-red-300" : hasVideo ? "border-[#691D1B]" : "border-[#D8D7BE]"
                    }`}
                    style={{ background: "#F7F2E7" }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Video className="w-5 h-5 flex-shrink-0" style={{ color: "#FF0000" }} />
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => { setYoutubeUrl(e.target.value); if (contentError) setContentError(false); }}
                        placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                        className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                      {youtubeUrl && (
                        <button onClick={() => setYoutubeUrl("")} className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {youtubeUrl && !isValidYoutube(youtubeUrl) && (
                      <div className="px-4 py-2 border-t border-[#D8D7BE] flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ef4444" }} />
                        <span className="text-xs" style={{ color: "#ef4444" }}>URL tidak terdeteksi sebagai link YouTube yang valid.</span>
                      </div>
                    )}
                    {youtubeUrl && isValidYoutube(youtubeUrl) && (
                      <div className="px-4 py-2 border-t border-[#D8D7BE] flex items-center gap-2" style={{ background: "#22c55e08" }}>
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#16a34a" }} />
                        <span className="text-xs" style={{ color: "#16a34a", fontWeight: 600 }}>Link YouTube valid</span>
                        <a href={youtubeUrl} target="_blank" rel="noreferrer"
                          className="ml-auto flex items-center gap-1 text-xs hover:underline"
                          style={{ color: "#691D1B", fontWeight: 600 }}>
                          <Link2 className="w-3 h-3" /> Pratinjau
                        </a>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Pastikan video bersifat <strong>unlisted</strong> atau <strong>public</strong> agar dapat diakses siswa.</p>
                </section>

                <div className="border-t border-[#F7F2E7]" />

                {/* ③ Modul + Bank Soal */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ background: "#691D1B", fontWeight: 800 }}>3</div>
                    <h4 className="text-sm text-gray-800" style={{ fontWeight: 700 }}>Modul & Bank Soal</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Modul */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" style={{ color: "#691D1B" }} />
                        <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>Modul / PDF</span>
                        {hasModul && <CheckCircle className="w-3.5 h-3.5 ml-auto" style={{ color: "#16a34a" }} />}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">PDF, DOCX, PPTX • max 50 MB</p>
                      <label
                        className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                          modulDragging
                            ? "border-[#691D1B] bg-[#691D1B0A]"
                            : hasModul
                            ? "border-[#691D1B] bg-[#691D1B08]"
                            : contentError && !hasAny
                            ? "border-red-300 bg-[#F7F2E7]"
                            : "border-[#D8D7BE] bg-[#F7F2E7] hover:border-[#691D1B]"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setModulDragging(true); }}
                        onDragLeave={() => setModulDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault(); setModulDragging(false);
                          const f = e.dataTransfer.files[0];
                          if (f) { setModulFile(`${f.name} • ${(f.size / 1048576).toFixed(1)} MB`); setModulUploadFile(f); setContentError(false); }
                        }}
                      >
                        <input type="file" className="hidden" accept=".pdf,.docx,.pptx"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setModulFile(`${f.name} • ${(f.size / 1048576).toFixed(1)} MB`); setModulUploadFile(f); setContentError(false); }
                          }}
                        />
                        {hasModul ? (
                          <>
                            <CheckCircle className="w-7 h-7" style={{ color: "#16a34a" }} />
                            <span className="text-xs text-center text-gray-600 break-all" style={{ fontWeight: 600 }}>{modulFile}</span>
                            <button type="button" onClick={(e) => { e.preventDefault(); setModulFile(null); setModulUploadFile(null); }}
                              className="text-xs px-3 py-1 rounded-lg border border-[#D8D7BE] text-gray-500 hover:bg-white transition-colors">
                              Ganti File
                            </button>
                          </>
                        ) : (
                          <>
                            <Paperclip className="w-7 h-7" style={{ color: contentError && !hasAny ? "#ef4444" : "#691D1B" }} />
                            <span className="text-xs text-gray-500 text-center">
                              Drag & drop atau<br />
                              <span style={{ color: "#691D1B", fontWeight: 700 }}>klik untuk pilih file</span>
                            </span>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Bank Soal */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4" style={{ color: "#691D1B" }} />
                        <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>Bank Soal</span>
                        {hasQuiz && <CheckCircle className="w-3.5 h-3.5 ml-auto" style={{ color: "#16a34a" }} />}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">PDF, DOCX, PPTX • max 50 MB</p>
                      <label
                        className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                          quizDragging
                            ? "border-[#691D1B] bg-[#691D1B0A]"
                            : hasQuiz
                            ? "border-[#691D1B] bg-[#691D1B08]"
                            : contentError && !hasAny
                            ? "border-red-300 bg-[#F7F2E7]"
                            : "border-[#D8D7BE] bg-[#F7F2E7] hover:border-[#691D1B]"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setQuizDragging(true); }}
                        onDragLeave={() => setQuizDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault(); setQuizDragging(false);
                          const f = e.dataTransfer.files[0];
                          if (f) { setQuizFile(`${f.name} • ${(f.size / 1048576).toFixed(1)} MB`); setQuizUploadFile(f); setContentError(false); }
                        }}
                      >
                        <input type="file" className="hidden" accept=".pdf,.docx,.pptx"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setQuizFile(`${f.name} • ${(f.size / 1048576).toFixed(1)} MB`); setQuizUploadFile(f); setContentError(false); }
                          }}
                        />
                        {hasQuiz ? (
                          <>
                            <CheckCircle className="w-7 h-7" style={{ color: "#16a34a" }} />
                            <span className="text-xs text-center text-gray-600 break-all" style={{ fontWeight: 600 }}>{quizFile}</span>
                            <button type="button" onClick={(e) => { e.preventDefault(); setQuizFile(null); setQuizUploadFile(null); }}
                              className="text-xs px-3 py-1 rounded-lg border border-[#D8D7BE] text-gray-500 hover:bg-white transition-colors">
                              Ganti File
                            </button>
                          </>
                        ) : (
                          <>
                            <Paperclip className="w-7 h-7" style={{ color: contentError && !hasAny ? "#ef4444" : "#691D1B" }} />
                            <span className="text-xs text-gray-500 text-center">
                              Drag & drop atau<br />
                              <span style={{ color: "#691D1B", fontWeight: 700 }}>klik untuk pilih file</span>
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </section>

                {/* ── Checklist + Submit ── */}
                <div className="rounded-xl border border-[#D8D7BE] overflow-hidden">
                  {/* Checklist row */}
                  <div className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ background: "#F7F2E7", borderBottom: "1px solid #D8D7BE" }}>
                    <span className="text-xs text-gray-500 mr-1" style={{ fontWeight: 600 }}>Konten terisi:</span>
                    {contentChecklist.map((item) => (
                      <span
                        key={item.label}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all"
                        style={{
                          background: item.filled ? "#22c55e15" : "#00000008",
                          color: item.filled ? "#16a34a" : "#9ca3af",
                          fontWeight: 600,
                          border: `1px solid ${item.filled ? "#22c55e40" : "#D8D7BE"}`,
                        }}
                      >
                        {item.filled
                          ? <CheckCircle className="w-3 h-3" />
                          : <div className="w-3 h-3 rounded-full border border-current opacity-50" />
                        }
                        {item.label}
                      </span>
                    ))}
                    {hasAny && (
                      <span className="ml-auto text-xs" style={{ color: "#16a34a", fontWeight: 700 }}>
                        ✓ Siap dikirim
                      </span>
                    )}
                    {!hasAny && (
                      <span className="ml-auto text-xs" style={{ color: "#9ca3af" }}>
                        Minimal 1 wajib diisi
                      </span>
                    )}
                  </div>
                  {/* Submit button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading || !hasAssignedCourses || !judul.trim()}
                    className="w-full py-3.5 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="xs" color="#FFE882" />
                        Mengupload materi...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Kirim untuk Review
                      </span>
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* ── Uploaded History ───────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="self-start overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-sm">
                <div className="p-5 border-b border-[#F7F2E7] flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Materi Terupload</h3>
                    <p className="text-xs text-gray-400">{uploadedItems.length} item tersimpan</p>
                  </div>
                </div>

                <div className="max-h-[360px] divide-y divide-[#F7F2E7] overflow-y-auto overscroll-contain sm:max-h-[420px]">
                  {uploadedItems.map((item) => {
                    const sc = statusConfig[item.status] ?? statusConfig.pending;
                    return (
                      <div key={item.id} className="flex min-h-[104px] items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#691D1B15", color: "#691D1B" }}>
                          {typeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                          {item.type === "video" ? (
                            <a href={materialUrl(item)}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-xs mt-0.5 hover:underline truncate"
                              style={{ color: "#691D1B" }}>
                              <Link2 className="w-3 h-3 flex-shrink-0" />{item.meta}
                            </a>
                          ) : (
                            <a
                              href={materialUrl(item)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs mt-0.5 text-gray-500 hover:underline truncate"
                            >
                              <Link2 className="w-3 h-3 flex-shrink-0" />{item.meta}
                            </a>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1.5" style={{ background: sc.bg, color: sc.color, fontWeight: 600 }}>
                            {sc.icon}{sc.label}
                          </span>
                        </div>
                        {!item.optimistic && (
                          <button
                            type="button"
                            onClick={() => deleteMaterial(item)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                            title="Hapus materi"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="shrink-0 border-t border-[#D8D7BE] p-4" style={{ background: "#F7F2E7" }}>
                  <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 600 }}>Keterangan Status</p>
                  <div className="space-y-1.5">
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-xs text-gray-500">
                        <span style={{ color: val.color }}>{val.icon}</span>
                        <span style={{ color: val.color, fontWeight: 600 }}>{val.label}</span>—
                        <span>{key === "approved" ? "Aktif & dapat diakses siswa" : key === "pending" ? "Sedang diverifikasi admin" : "Perlu revisi, hubungi admin"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#D8D7BE] p-5">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>Panduan Upload</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Link YouTube",
                      icon: <Video className="w-4 h-4" style={{ color: "#FF0000" }} />,
                      items: ["Set video ke Unlisted atau Public", "Hindari video yang membutuhkan login", "Durasi ideal 15–60 menit/sesi"],
                    },
                    {
                      title: "Modul & Bank Soal",
                      icon: <FileText className="w-4 h-4" style={{ color: "#691D1B" }} />,
                      items: ["PDF/DOCX/PPTX maks 50 MB untuk keduanya", "Sertakan kunci jawaban di file bank soal", "Gunakan format yang mudah dibaca siswa"],
                    },
                    {
                      title: "Proses Review",
                      icon: <CheckCircle className="w-4 h-4" style={{ color: "#16a34a" }} />,
                      items: ["Diproses 1–2 hari kerja", "Notifikasi via dashboard", "Langsung aktif setelah disetujui"],
                    },
                  ].map((g) => (
                    <div key={g.title} className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F7F2E7" }}>{g.icon}</div>
                      <div>
                        <p className="text-xs text-gray-800 mb-1" style={{ fontWeight: 700 }}>{g.title}</p>
                        <ul className="space-y-1">
                          {g.items.map((item) => (
                            <li key={item} className="flex items-start gap-1.5 text-xs text-gray-500">
                              <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#691D1B" }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorMaterialUpload;
