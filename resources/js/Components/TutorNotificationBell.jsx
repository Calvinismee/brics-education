import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Bell, CheckCircle, ExternalLink } from "lucide-react";

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {});

const formatTime = (value) => {
  if (!value) return "Terbaru";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Terbaru";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TutorNotificationBell() {
  const { props } = usePage();
  const shared = props.tutorNotifications ?? {};
  const [open, setOpen] = useState(false);
  const [localUnread, setLocalUnread] = useState(shared.unreadCount ?? 0);
  const notifications = asArray(shared.latest);

  const openNotifications = () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && localUnread > 0) {
      setLocalUnread(0);
      router.post("/tutor/notifications/mark-all-as-read", {}, {
        preserveScroll: true,
        preserveState: true,
        only: ["tutorNotifications"],
      });
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openNotifications}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D8D7BE] bg-[#F7F2E7] text-gray-700 transition-colors hover:bg-[#EFE8D8]"
        title="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {localUnread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {localUnread > 9 ? "9+" : localUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-[#D8D7BE] bg-white shadow-xl">
          <div className="px-4 py-3 border-b border-[#F7F2E7] flex items-center justify-between">
            <div>
              <h3 className="text-[#691D1B] text-sm" style={{ fontWeight: 900 }}>Notifikasi</h3>
              <p className="text-xs text-gray-400">Riwayat terbaru tutor</p>
            </div>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#F7F2E7]">
            {notifications.length > 0 ? notifications.map((notification) => (
              <div key={notification.id} className="px-4 py-3 hover:bg-[#F7F2E7] transition-colors">
                <div className="flex items-start gap-2">
                  {!notification.is_read && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900" style={{ fontWeight: 800 }}>{notification.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-[11px] text-[#691D1B] mt-2" style={{ fontWeight: 800 }}>
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Belum ada notifikasi.
              </div>
            )}
          </div>

          <Link
            href="/tutor/notifications"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm border-t border-[#F7F2E7] hover:bg-[#F7F2E7] transition-colors"
            style={{ color: "#691D1B", fontWeight: 800 }}
          >
            Lihat semua notifikasi
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default TutorNotificationBell;
