import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Mail,
  User,
  X,
} from "lucide-react";

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export function TutorProfileModal({ user = null, open, onClose }) {
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorEmail = user?.email ?? "tutor@bricsedu.id";
  const [profileForm, setProfileForm] = useState({
    nama: tutorName,
    email: tutorEmail,
  });

  useEffect(() => {
    if (open) {
      setProfileForm({
        nama: tutorName,
        email: tutorEmail,
      });
    }
  }, [open, tutorName, tutorEmail]);

  if (!open) return null;

  const handleSave = () => {
    router.patch(
      "/tutor/profile",
      { name: profileForm.nama, email: profileForm.email },
      { preserveScroll: true, preserveState: false, onSuccess: onClose }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8D7BE]" style={{ background: "#691D1B" }}>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#FFE882]" />
            <h2 className="text-white text-sm" style={{ fontWeight: 700 }}>Edit Profil Singkat</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 800 }}>
              {initialsFor(profileForm.nama)}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 700 }}>{profileForm.nama}</p>
              <p className="text-xs text-gray-400 truncate">{profileForm.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Nama Lengkap", field: "nama", icon: <User className="w-4 h-4 text-gray-400" />, type: "text" },
              { label: "Email", field: "email", icon: <Mail className="w-4 h-4 text-gray-400" />, type: "email" },
            ].map(({ label, field, icon, type }) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>{label}</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D8D7BE] focus-within:border-[#691D1B] transition-colors">
                  {icon}
                  <input
                    type={type}
                    value={profileForm[field]}
                    onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                    className="flex-1 text-sm text-gray-800 outline-none bg-transparent min-w-0"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D8D7BE]" style={{ background: "#F7F2E7" }}>
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm border border-[#D8D7BE] text-gray-600 hover:bg-white transition-colors" style={{ fontWeight: 600 }}>
            Batal
          </button>
          <button type="button" onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:opacity-90" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorProfileModal;
