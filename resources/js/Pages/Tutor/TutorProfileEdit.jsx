import { Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Bell,
  BookMarked,
  Calendar,
  Camera,
  ChevronDown,
  GraduationCap,
  Home,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Settings as SettingsIcon,
  Star,
  Upload,
  User,
  Users,
} from "lucide-react";
import { BricsLogo } from "@/Components/BricsLogo";
import { TutorProfileModal } from "@/Components/TutorProfileModal";
import { TutorSidebar } from "@/Components/TutorSidebar";
import { TutorNotificationBell } from "@/Components/TutorNotificationBell";
import { TutorMobileDrawer, TutorMobileMenuButton } from "@/Components/TutorMobileNavigation";

const fallbackTutorClasses = [
  { id: 0, name: "Penalaran Umum", students: 24, progress: 75 },
  { id: 1, name: "Pengetahuan dan Pemahaman Umum", students: 18, progress: 60 },
  { id: 2, name: "Pemahaman Bacaan dan Menulis", students: 22, progress: 68 },
  { id: 3, name: "Pengetahuan Kuantitatif", students: 20, progress: 72 },
];

const initialsFor = (name) => String(name || "Tutor UTBK")
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const EDUCATION_OPTIONS = ["SMA", "S1", "S2", "S3"];
const normalizedEducation = (value) => EDUCATION_OPTIONS.includes(value) ? value : "";

export function TutorProfileEdit({ user = null, tutorClasses: serverTutorClasses = [] }) {
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorEmail = user?.email ?? "tutor@bricsedu.id";
  const tutorProfile = user?.tutor_profile ?? {};
  const initialPhoto = tutorProfile.photo_url ?? user?.google_avatar ?? "";
  const tutorClasses = Array.isArray(serverTutorClasses) && serverTutorClasses.length > 0 ? serverTutorClasses : fallbackTutorClasses;
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: tutorName,
    email: tutorEmail,
    phone: tutorProfile.phone ?? "",
    expertise: tutorProfile.expertise ?? "",
    education: normalizedEducation(tutorProfile.education ?? ""),
    bio: tutorProfile.bio ?? "",
    profile_photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);

  useEffect(() => {
    setProfileForm({
      name: tutorName,
      email: tutorEmail,
      phone: tutorProfile.phone ?? "",
      expertise: tutorProfile.expertise ?? "",
      education: normalizedEducation(tutorProfile.education ?? ""),
      bio: tutorProfile.bio ?? "",
      profile_photo: null,
    });
    setPhotoPreview(initialPhoto);
  }, [tutorName, tutorEmail, tutorProfile.phone, tutorProfile.expertise, tutorProfile.education, tutorProfile.bio, initialPhoto]);

  useEffect(() => () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
  }, [photoPreview]);

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
        expertise: profileForm.expertise,
        education: profileForm.education,
        bio: profileForm.bio,
        profile_photo: profileForm.profile_photo,
      },
      { forceFormData: true, preserveScroll: true, preserveState: false }
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="profile" onEditProfile={() => setShowProfileModal(true)} />
      <TutorMobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        tutorClasses={tutorClasses}
        active="profile"
        onEditProfile={() => setShowProfileModal(true)}
      />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="bg-white border-b border-[#D8D7BE] px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TutorMobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div className="min-w-0">
                <h2 className="truncate text-gray-900" style={{ fontWeight: 700 }}>Edit Profil</h2>
                <p className="truncate text-xs text-gray-400">Kelola informasi akun tutor</p>
              </div>
            </div>
            <div className="flex-shrink-0"><TutorNotificationBell /></div>
          </div>
        </header>

        <div className="px-4 py-5 sm:p-6 space-y-5 sm:space-y-6">
          <section className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden">
            <div className="p-5 border-b border-[#F7F2E7]" style={{ background: "#691D1B" }}>
              <h3 className="text-white" style={{ fontWeight: 700 }}>Informasi Akun</h3>
              <p className="text-xs" style={{ color: "#FFE882" }}>Data utama yang dipakai untuk akun tutor</p>
            </div>
            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-3">
              <div className="flex flex-col items-center justify-start gap-3">
                <div className="relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt={profileForm.name} className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full text-2xl" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 800 }}>
                      {initialsFor(profileForm.name)}
                    </div>
                  )}
                  <label htmlFor="tutor-profile-photo" className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white" style={{ background: "#691D1B" }}>
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                  <input
                    id="tutor-profile-photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{profileForm.name}</p>
                  <p className="text-xs text-gray-400">{profileForm.email}</p>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", field: "name", icon: <User className="w-4 h-4 text-gray-400" />, type: "text" },
                  { label: "Email", field: "email", icon: <Mail className="w-4 h-4 text-gray-400" />, type: "email", disabled: true },
                  { label: "No. Handphone", field: "phone", icon: <Phone className="w-4 h-4 text-gray-400" />, type: "tel" },
                  { label: "Bidang Keahlian", field: "expertise", icon: <BookMarked className="w-4 h-4 text-gray-400" />, type: "text" },
                  { label: "Pendidikan Terakhir", field: "education", icon: <GraduationCap className="w-4 h-4 text-gray-400" />, type: "select" },
                ].map((item) => (
                  <label key={item.field} className="block">
                    <span className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>{item.label}</span>
                    <span className={`flex items-center gap-2 rounded-xl border border-[#D8D7BE] px-3 py-2.5 transition-colors focus-within:border-[#691D1B] ${item.disabled ? "bg-[#F7F2E7]" : ""}`}>
                      {item.icon}
                      {item.type === "select" ? (
                        <select
                          value={profileForm[item.field]}
                          onChange={(e) => setProfileForm({ ...profileForm, [item.field]: e.target.value })}
                          className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
                        >
                          <option value="">Pilih pendidikan</option>
                          {EDUCATION_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={item.type}
                          value={profileForm[item.field]}
                          onChange={(e) => setProfileForm({ ...profileForm, [item.field]: e.target.value })}
                          disabled={item.disabled}
                          className={`flex-1 bg-transparent text-sm outline-none ${item.disabled ? "text-gray-500" : "text-gray-800"}`}
                        />
                      )}
                    </span>
                  </label>
                ))}
                <label className="block md:col-span-2">
                  <span className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>Bio Singkat</span>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8D7BE] focus:border-[#691D1B] outline-none resize-none text-sm"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#D8D7BE] px-4 py-4 sm:flex-row sm:justify-end sm:px-6" style={{ background: "#F7F2E7" }}>
              <a href="/tutor/dashboard" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#D8D7BE] px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-white" style={{ fontWeight: 600 }}>
                Batal
              </a>
              <button type="button" onClick={handleSave} className="inline-flex min-h-10 items-center justify-center rounded-xl px-5 py-2.5 text-sm transition-all hover:opacity-90" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}>
                Simpan Perubahan
              </button>
            </div>
          </section>
        </div>
      </main>

      <TutorProfileModal user={user} open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}

export default TutorProfileEdit;
