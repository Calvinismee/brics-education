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

export function TutorProfileEdit({ user = null, tutorClasses: serverTutorClasses = [] }) {
  const tutorName = user?.name ?? "Tutor UTBK";
  const tutorEmail = user?.email ?? "tutor@bricsedu.id";
  const tutorProfile = user?.tutor_profile ?? {};
  const tutorClasses = Array.isArray(serverTutorClasses) && serverTutorClasses.length > 0 ? serverTutorClasses : fallbackTutorClasses;
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: tutorName,
    email: tutorEmail,
    phone: tutorProfile.phone ?? "",
    expertise: tutorProfile.expertise ?? "",
    education: tutorProfile.education ?? "",
    bio: tutorProfile.bio ?? "",
  });

  useEffect(() => {
    setProfileForm({
      name: tutorName,
      email: tutorEmail,
      phone: tutorProfile.phone ?? "",
      expertise: tutorProfile.expertise ?? "",
      education: tutorProfile.education ?? "",
      bio: tutorProfile.bio ?? "",
    });
  }, [tutorName, tutorEmail, tutorProfile.phone, tutorProfile.expertise, tutorProfile.education, tutorProfile.bio]);

  const handleSave = () => {
    router.patch(
      "/tutor/profile",
      {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        expertise: profileForm.expertise,
        education: profileForm.education,
        bio: profileForm.bio,
      },
      { preserveScroll: true, preserveState: false }
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F2E7", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TutorSidebar user={user} tutorClasses={tutorClasses} active="profile" onEditProfile={() => setShowProfileModal(true)} />

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-[#D8D7BE] px-6 py-3.5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900" style={{ fontWeight: 700 }}>Edit Profil</h2>
              <p className="text-xs text-gray-400">Kelola informasi akun tutor</p>
            </div>
            <TutorNotificationBell />
          </div>
        </header>

        <div className="p-6 space-y-6">
          <section className="bg-white rounded-2xl border border-[#D8D7BE] overflow-hidden">
            <div className="p-5 border-b border-[#F7F2E7]" style={{ background: "#691D1B" }}>
              <h3 className="text-white" style={{ fontWeight: 700 }}>Informasi Akun</h3>
              <p className="text-xs" style={{ color: "#FFE882" }}>Data utama yang dipakai untuk akun tutor</p>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-start gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 800 }}>
                    {initialsFor(profileForm.name)}
                  </div>
                  <button type="button" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white" style={{ background: "#691D1B" }}>
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>{profileForm.name}</p>
                  <p className="text-xs text-gray-400">{profileForm.email}</p>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", field: "name", icon: <User className="w-4 h-4 text-gray-400" />, type: "text" },
                  { label: "Email", field: "email", icon: <Mail className="w-4 h-4 text-gray-400" />, type: "email" },
                  { label: "No. Handphone", field: "phone", icon: <Phone className="w-4 h-4 text-gray-400" />, type: "tel" },
                  { label: "Bidang Keahlian", field: "expertise", icon: <BookMarked className="w-4 h-4 text-gray-400" />, type: "text" },
                  { label: "Pendidikan Terakhir", field: "education", icon: <GraduationCap className="w-4 h-4 text-gray-400" />, type: "text" },
                ].map((item) => (
                  <label key={item.field} className="block">
                    <span className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 600 }}>{item.label}</span>
                    <span className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D8D7BE] focus-within:border-[#691D1B] transition-colors">
                      {item.icon}
                      <input
                        type={item.type}
                        value={profileForm[item.field]}
                        onChange={(e) => setProfileForm({ ...profileForm, [item.field]: e.target.value })}
                        className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
                      />
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
            <div className="px-6 py-4 border-t border-[#D8D7BE] flex justify-end gap-3" style={{ background: "#F7F2E7" }}>
              <a href="/tutor/dashboard" className="px-4 py-2.5 rounded-xl text-sm border border-[#D8D7BE] text-gray-600 hover:bg-white transition-colors" style={{ fontWeight: 600 }}>
                Batal
              </a>
              <button type="button" onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm transition-all hover:opacity-90" style={{ background: "#691D1B", color: "#FFE882", fontWeight: 700 }}>
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
