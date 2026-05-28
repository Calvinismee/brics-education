import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Camera,
  GraduationCap,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";

const EDUCATION_OPTIONS = ["SMA", "S1", "S2", "S3"];

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const normalizedEducation = (value) => EDUCATION_OPTIONS.includes(value) ? value : "";

export function TutorProfileModal({ user = null, open, onClose }) {
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorEmail = user?.email ?? "tutor@bricsedu.id";
  const tutorProfile = user?.tutor_profile ?? {};
  const initialPhoto = tutorProfile.photo_url ?? user?.google_avatar ?? "";
  const [profileForm, setProfileForm] = useState({
    name: tutorName,
    phone: tutorProfile.phone ?? "",
    education: normalizedEducation(tutorProfile.education ?? ""),
    profile_photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);

  useEffect(() => {
    if (open) {
      setProfileForm({
        name: tutorName,
        phone: tutorProfile.phone ?? "",
        education: normalizedEducation(tutorProfile.education ?? ""),
        profile_photo: null,
      });
      setPhotoPreview(initialPhoto);
    }
  }, [open, tutorName, tutorProfile.phone, tutorProfile.education, initialPhoto]);

  useEffect(() => () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
  }, [photoPreview]);

  if (!open) return null;

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setProfileForm((current) => ({ ...current, profile_photo: file }));
    setPhotoPreview(file ? URL.createObjectURL(file) : initialPhoto);
  };

  const handleSave = () => {
    router.post(
      "/tutor/profile",
      {
        _method: "patch",
        name: profileForm.name,
        phone: profileForm.phone,
        education: profileForm.education,
        profile_photo: profileForm.profile_photo,
      },
      {
        forceFormData: true,
        preserveScroll: true,
        preserveState: false,
        onSuccess: onClose,
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)" }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex items-center justify-between border-b border-[#D8D7BE] px-5 py-4" style={{ background: "#691D1B" }}>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#FFE882]" />
            <h2 className="text-sm text-white" style={{ fontWeight: 700 }}>Edit Profil Singkat</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt={profileForm.name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 800 }}>
                  {initialsFor(profileForm.name)}
                </div>
              )}
              <label htmlFor="tutor-modal-profile-photo" className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white" style={{ background: "#691D1B" }}>
                <Camera className="h-3.5 w-3.5 text-white" />
              </label>
              <input
                id="tutor-modal-profile-photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-900" style={{ fontWeight: 700 }}>{profileForm.name}</p>
              <p className="truncate text-xs text-gray-400">{tutorEmail}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-gray-500" style={{ fontWeight: 600 }}>Nama Lengkap</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#D8D7BE] px-3 py-2.5 transition-colors focus-within:border-[#691D1B]">
                <User className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500" style={{ fontWeight: 600 }}>Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#D8D7BE] bg-[#F7F2E7] px-3 py-2.5">
                <Mail className="h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={tutorEmail}
                  disabled
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-500 outline-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500" style={{ fontWeight: 600 }}>No. Handphone</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#D8D7BE] px-3 py-2.5 transition-colors focus-within:border-[#691D1B]">
                <Phone className="h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500" style={{ fontWeight: 600 }}>Pendidikan Terakhir</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#D8D7BE] px-3 py-2.5 transition-colors focus-within:border-[#691D1B]">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <select
                  value={profileForm.education}
                  onChange={(event) => setProfileForm({ ...profileForm, education: event.target.value })}
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <option value="">Pilih pendidikan</option>
                  {EDUCATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[#D8D7BE] px-5 py-4" style={{ background: "#F7F2E7" }}>
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#D8D7BE] py-2.5 text-sm text-gray-600 transition-colors hover:bg-white" style={{ fontWeight: 600 }}>
            Batal
          </button>
          <button type="button" onClick={handleSave} className="flex-1 rounded-xl py-2.5 text-sm transition-all hover:opacity-90" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}>
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorProfileModal;
