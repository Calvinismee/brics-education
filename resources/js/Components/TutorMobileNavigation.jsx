import { useEffect } from "react";
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
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Tutup menu tutor"
      />

      <div className="relative h-dvh w-[min(21rem,92vw)] max-w-[calc(100vw-0.75rem)] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#691D1B] shadow-sm transition-colors hover:bg-[#FFE882]"
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
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}

export default TutorMobileDrawer;
