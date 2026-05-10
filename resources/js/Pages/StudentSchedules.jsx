import { Link, router } from '@inertiajs/react';
import BricsLogo from '@/Components/BricsLogo';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Video,
  User,
  LogOut,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

function formatDateTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCategoryName(course) {
  if (!course?.category) return 'Course';
  if (typeof course.category === 'string') return course.category;
  return course.category.name || 'Course';
}

export default function StudentSchedules({ user, schedules = [] }) {
  const logout = () => {
    router.post(route('logout'));
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#F7F2E7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <header className="bg-white border-b border-[#D8D7BE] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <BricsLogo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4 text-[#691D1B]" />
              <span style={{ fontWeight: 700 }}>{user?.name || 'Siswa'}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md hover:bg-[#4A1412] transition-colors"
              style={{ background: '#691D1B', fontWeight: 700 }}
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#691D1B] hover:underline mb-6"
          style={{ fontWeight: 600 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <section className="bg-[#691D1B] rounded-2xl p-6 mb-8 text-white shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span
                className="inline-block text-xs px-3 py-1 rounded-full mb-3"
                style={{
                  background: '#FFE882',
                  color: '#691D1B',
                  fontWeight: 700,
                }}
              >
                Jadwal Siswa
              </span>

              <h1 className="text-3xl mb-3" style={{ fontWeight: 800 }}>
                Jadwal Pembelajaran
              </h1>

              <p className="text-sm text-[#D8D7BE] max-w-3xl leading-relaxed">
                Jadwal ini ditampilkan berdasarkan course aktif yang sudah kamu beli.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 min-w-[220px]">
              <p className="text-xs text-[#D8D7BE] mb-1">Total Jadwal</p>
              <p className="text-3xl text-[#FFE882]" style={{ fontWeight: 800 }}>
                {schedules.length}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F7F2E7]">
            <h2 className="text-xl text-[#691D1B]" style={{ fontWeight: 800 }}>
              Daftar Jadwal
            </h2>
            <p className="text-sm text-gray-500">
              Jadwal live class atau sesi belajar dari course aktif.
            </p>
          </div>

          {schedules.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 text-[#691D1B]" />
              <h3 className="text-lg text-[#691D1B] mb-2" style={{ fontWeight: 800 }}>
                Belum Ada Jadwal
              </h3>
              <p className="text-sm text-gray-600">
                Jadwal untuk course aktifmu belum tersedia.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F7F2E7]">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: '#F7F2E7',
                          color: '#691D1B',
                        }}
                      >
                        <CalendarDays className="w-6 h-6" />
                      </div>

                      <div>
                        <span
                          className="inline-block text-xs px-3 py-1 rounded-full mb-2"
                          style={{
                            background: '#FFE882',
                            color: '#691D1B',
                            fontWeight: 700,
                          }}
                        >
                          {getCategoryName(schedule.course)}
                        </span>

                        <h3 className="text-lg text-gray-900 mb-1" style={{ fontWeight: 800 }}>
                          {schedule.title}
                        </h3>

                        <p className="text-sm text-gray-500 mb-3">
                          {schedule.course?.title || 'Course'}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#691D1B]" />
                            {formatDateTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <User className="w-4 h-4 text-[#691D1B]" />
                            {schedule.mentor?.name || 'Mentor'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {schedule.meeting_link ? (
                      <a
                        href={schedule.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white hover:bg-[#4A1412] transition-colors text-sm"
                        style={{ background: '#691D1B', fontWeight: 700 }}
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm">
                        <BookOpen className="w-4 h-4" />
                        Link belum tersedia
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}