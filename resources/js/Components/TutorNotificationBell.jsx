import { DashboardNotificationBell } from "@/Components/DashboardNotificationBell";

export function TutorNotificationBell() {
  return (
    <DashboardNotificationBell
      markAllHref="/tutor/notifications/mark-all-as-read"
      allHref="/tutor/notifications"
      historyLabel="Riwayat terbaru tutor"
      reloadProps={["dashboardNotifications", "tutorNotifications"]}
    />
  );
}

export default TutorNotificationBell;
