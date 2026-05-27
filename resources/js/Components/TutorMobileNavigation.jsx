import { Menu, X } from "lucide-react";
import { TutorSidebar } from "@/Components/TutorSidebar";

export function TutorMobileMenuButton({ onClick, label = "Buka menu tutor" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#D8D7BE] bg-white text-[#691D1B] transition-colors hover:bg-[#F7F2E7] lg:hidden"
      aria-label={label}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function TutorMobileDrawer({
  open,
  onClose,
  user,
  tutorClasses = [],
  active = "dashboard",
  selectedClassId = null,
  onEditProfile,
}) {
  if (!open) return null;

  const openProfile = () => {
    onClose?.();
    onEditProfile?.();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Tutup menu tutor"
      />

      <div className="relative h-full w-[min(20rem,88vw)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#691D1B] shadow-sm"
          aria-label="Tutup menu"
        >
          <X className="h-5 w-5" />
        </button>

        <TutorSidebar
          user={user}
          tutorClasses={tutorClasses}
          active={active}
          selectedClassId={selectedClassId}
          drawer
          onEditProfile={openProfile}
        />
      </div>
    </div>
  );
}

export default TutorMobileDrawer;
