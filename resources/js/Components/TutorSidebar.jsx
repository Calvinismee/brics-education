import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Calendar,
  Bell,
  ChevronDown,
  History,
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings as SettingsIcon,
  Upload,
  User,
  Users,
} from "lucide-react";

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const normalizedClasses = (classes) => (Array.isArray(classes) ? classes : Object.values(classes ?? {}))
  .map((item) => ({
    id: item.id,
    name: item.name ?? item.title ?? "Kelas UTBK",
    students: item.students ?? 0,
    weeklySchedule: item.weeklySchedule ?? item.schedule ?? "Belum ada jadwal tetap",
  }));

export function TutorSidebar({
  user = null,
  tutorClasses = [],
  active = "dashboard",
  selectedClassId = null,
  drawer = false,
  onNavigate = null,
}) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("tutorSidebarCollapsed") === "1";
  });
  const [classesOpen, setClassesOpen] = useState(active === "classes");
  const classes = normalizedClasses(tutorClasses);
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorProfile = user?.tutor_profile ?? {};
  const tutorPhoto = tutorProfile.photo_url ?? "";
  const tutorInitials = initialsFor(tutorName);
  const classCount = classes.length;
  const isCollapsed = drawer ? false : collapsed;
  const closeAfterNavigate = () => {
    if (drawer && typeof onNavigate === "function") {
      onNavigate();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !drawer) {
      window.localStorage.setItem("tutorSidebarCollapsed", collapsed ? "1" : "0");
    }
  }, [collapsed, drawer]);

  const itemClass = (isActive) => [
    "w-full flex items-center rounded-lg mb-1 text-sm transition-all",
    isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
    isActive ? "text-[#000000]" : "text-white/80 hover:bg-white/10 hover:text-white",
  ].join(" ");

  const itemStyle = (isActive) => isActive ? { background: "#FFE882", fontWeight: 700 } : {};

  const navItems = [
    { key: "dashboard", label: "Dashboard", href: "/tutor/dashboard", icon: Home },
    { key: "upload", label: "Upload Materi", href: "/tutor/upload", icon: Upload },
    { key: "history", label: "Riwayat Mengajar", href: "/tutor/history", icon: History },
    { key: "schedule", label: "Jadwal", href: "/tutor/schedule", icon: Calendar },
  ];

  return (
    <aside
      className={`${drawer ? "flex w-full" : `hidden lg:flex ${isCollapsed ? "w-20" : "w-64"}`} flex-col flex-shrink-0 transition-all duration-200`}
      style={{ background: "#691D1B", minHeight: drawer ? "100dvh" : "100vh", position: drawer ? "relative" : "sticky", top: 0, height: drawer ? "100dvh" : "100vh", overflowY: "auto", overscrollBehavior: "contain", paddingBottom: drawer ? "env(safe-area-inset-bottom)" : undefined }}
    >
      <div className={`${isCollapsed ? "p-3" : "px-5 py-5"} border-b border-white/10`}>
        <div className="flex items-start justify-between gap-2">
          {!isCollapsed && (
            <div className={drawer ? "min-w-0 pr-10" : "min-w-0"}>
              <p className="text-[11px] tracking-[0.35em] text-[#FFE882]">
                BRICS EDUCATION
              </p>
              <h2 className="mt-3 text-2xl leading-tight text-white" style={{ fontWeight: 900 }}>
                Tutor Panel
              </h2>
              <p className="mt-1 text-sm text-white/65">
                Area pengajaran tutor
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm mx-auto" style={{ background: "#FFE882", color: "#691D1B", fontWeight: 900 }}>
              B
            </div>
          )}
          {!drawer && (
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#FFE882] hover:bg-white/10 transition-colors"
              title={isCollapsed ? "Perluas sidebar" : "Minimalkan sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      <div className={`${isCollapsed ? "p-3" : "px-5 py-5"} border-b border-white/10`}>
        {isCollapsed ? (
          <Link
            href="/tutor/profile"
            onClick={closeAfterNavigate}
            className="mx-auto flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition-transform hover:scale-105"
            style={{ background: "#FFE882", color: "#691D1B", fontWeight: 900 }}
            title="Profil"
          >
            {tutorPhoto ? (
              <img src={tutorPhoto} alt={tutorName} className="h-full w-full object-cover" />
            ) : tutorInitials}
          </Link>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {tutorPhoto ? (
                  <img src={tutorPhoto} alt={tutorName} className="h-12 w-12 flex-shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg" style={{ background: "#FFE882", color: "#691D1B", fontWeight: 900 }}>
                    {tutorInitials}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="truncate text-base text-white" style={{ fontWeight: 900 }}>
                    {tutorName}
                  </div>
                  <div className="text-sm leading-tight text-white/75">
                    Tutor UTBK
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-white/85">Kelas Aktif</span>
              <span className="text-[#FFE882]" style={{ fontWeight: 900 }}>{classCount}</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-[#FFE882]"
                style={{ width: `${Math.min(classCount * 25, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-3">
        <Link href="/tutor/dashboard" onClick={closeAfterNavigate} className={itemClass(active === "dashboard")} style={itemStyle(active === "dashboard")} title="Dashboard">
          <Home className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>
        <Link href="/tutor/upload" onClick={closeAfterNavigate} className={itemClass(active === "upload")} style={itemStyle(active === "upload")} title="Upload Materi">
          <Upload className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Upload Materi</span>}
        </Link>

        <div className="mb-1">
          {isCollapsed ? (
            <Link href="/tutor/classes" onClick={closeAfterNavigate} className={itemClass(active === "classes")} style={itemStyle(active === "classes")} title="Monitor Kelas">
              <Users className="w-5 h-5 flex-shrink-0" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setClassesOpen((value) => !value)}
              className={itemClass(active === "classes")}
              style={itemStyle(active === "classes")}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Monitor Kelas</span>
              <ChevronDown
                className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                style={{ transform: classesOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
            </button>
          )}

          {!isCollapsed && classesOpen && (
            <div className="mt-0.5 ml-3 border-l-2 border-white/15 pl-2 space-y-0.5">
              {classes.map((cls) => {
                const isActive = active === "classes" && String(selectedClassId ?? "") === String(cls.id);
                return (
                  <Link
                    key={cls.id}
                    href={`/tutor/classes?course_id=${cls.id}`}
                    onClick={closeAfterNavigate}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all block ${
                      isActive ? "text-[#000000]" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                    style={itemStyle(isActive)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isActive ? "#691D1B" : "#FFE882", opacity: isActive ? 1 : 0.8 }} />
                      <span className="truncate leading-tight">{cls.name}</span>
                    </div>
                    <div className="ml-4 mt-0.5 line-clamp-2 text-[10px]" style={{ color: isActive ? "#691D1B" : "rgba(255,255,255,0.5)" }}>
                      {cls.weeklySchedule}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <Link key={item.key} href={item.href} onClick={closeAfterNavigate} className={itemClass(isActive)} style={itemStyle(isActive)} title={item.label}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`${isCollapsed ? "p-3" : "p-4"} border-t border-white/10`}>
        <Link href="/tutor/profile" onClick={closeAfterNavigate} className={itemClass(active === "profile")} style={itemStyle(active === "profile")} title="Profil">
          <User className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Profil</span>}
        </Link>
        <Link href="/tutor/settings" onClick={closeAfterNavigate} className={itemClass(active === "settings")} style={itemStyle(active === "settings")} title="Settings">
          <SettingsIcon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <Link href="/tutor/notifications" onClick={closeAfterNavigate} className={itemClass(active === "notifications")} style={itemStyle(active === "notifications")} title="Notifikasi">
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Notifikasi</span>}
        </Link>
        <Link href="/logout" method="post" as="button" onClick={closeAfterNavigate} className={itemClass(false)} title="Keluar">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </Link>
      </div>
    </aside>
  );
}

export default TutorSidebar;
