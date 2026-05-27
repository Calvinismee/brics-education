import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Bell, CheckCircle, Circle, Clock } from "lucide-react";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {});

const formatTime = (value) => {
  if (!value) return "Terbaru";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Terbaru";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TutorNotifications({
  user = null,
  tutorClasses = [],
  notifications = {},
  stats = {},
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rows = asArray(notifications.data ?? notifications);
  const links = asArray(notifications.links);

  const markAsRead = (notification) => {
    if (notification.is_read) return;

    router.post(`/tutor/notifications/${notification.id}/mark-as-read`, {}, {
      preserveScroll: true,
    });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="notifications" onEditProfile={() => setShowProfileModal(true)} />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="notifications"
        onEditProfile={() => setShowProfileModal(true)}
      />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Link href="/tutor/dashboard" className="p-2 rounded-lg hover:bg-[#F7F2E7] text-[#691D1B] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 700 }}>Notifikasi</h2>
                <p className="truncate text-xs text-gray-400">Riwayat informasi tutor terbaru</p>
              </div>
            </div>
            <div className="flex-shrink-0"><TutorNotificationBell /></div>
          </div>
        </header>

        <div className="px-4 py-5 sm:p-6 space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "#691D1B15", color: "#691D1B" }}>
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>{stats.total ?? rows.length}</p>
              <p className="text-sm text-gray-500">Total notifikasi</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#D8D7BE] p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "#FFE88230", color: "#691D1B" }}>
                <Circle className="w-5 h-5" />
              </div>
              <p className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>{stats.unread ?? 0}</p>
              <p className="text-sm text-gray-500">Belum dibaca</p>
            </div>
          </div>

          <section className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden">
            <div className="p-5 border-b border-[#F7F2E7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Semua Notifikasi</h3>
                <p className="text-xs text-gray-400">Klik item untuk menandainya sebagai sudah dibaca</p>
              </div>
              <button
                type="button"
                onClick={() => router.post("/tutor/notifications/mark-all-as-read", {}, { preserveScroll: true })}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm transition-all hover:opacity-90 sm:w-auto"
                style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}
              >
                <CheckCircle className="w-4 h-4" />
                Tandai semua dibaca
              </button>
            </div>

            <div className="divide-y divide-[#F7F2E7]">
              {rows.length > 0 ? rows.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification)}
                  className="w-full p-5 text-left hover:bg-[#F7F2E7] transition-colors"
                >
                  <div className="flex min-w-0 gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: notification.is_read ? "#F7F2E7" : "#691D1B15", color: notification.is_read ? "#9ca3af" : "#691D1B" }}>
                      {notification.is_read ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-gray-900" style={{ fontWeight: 800 }}>{notification.title}</p>
                        {!notification.is_read && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600" style={{ fontWeight: 800 }}>
                            Baru
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-[#691D1B] mt-2 flex items-center gap-1" style={{ fontWeight: 700 }}>
                        <Clock className="w-3 h-3" />
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center text-sm text-gray-400">
                  Belum ada notifikasi.
                </div>
              )}
            </div>

            {links.length > 0 && (
              <div className="p-4 border-t border-[#D8D7BE] flex flex-wrap gap-2" style={{ background: "#F7F2E7" }}>
                {links.map((link, index) => (
                  <Link
                    key={`${link.label}-${index}`}
                    href={link.url ?? "#"}
                    preserveScroll
                    className={`px-3 py-1.5 rounded-lg text-sm ${link.url ? "hover:bg-white" : "opacity-40 pointer-events-none"}`}
                    style={link.active ? { background: "#691D1B", color: "#FFE882", fontWeight: 800 } : { color: "#4b5563", border: "1px solid #D8D7BE" }}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}

export default TutorNotifications;
