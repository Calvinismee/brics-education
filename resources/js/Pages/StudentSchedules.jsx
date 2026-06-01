import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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

const scheduleTypes = {
  live: { label: 'Live Class', color: '#691D1B', bg: '#691D1B15', needsMeeting: true, linkLabel: 'Join Meeting' },
  consultation: { label: 'Konsultasi', color: '#7c3aed', bg: '#7c3aed15', needsMeeting: true, linkLabel: 'Join Konsultasi' },
  student_deadline: { label: 'Deadline Tugas', color: '#db2777', bg: '#db277715', needsActionLink: true, linkLabel: 'Kumpulkan Tugas' },
  tryout: { label: 'Tryout', color: '#2563eb', bg: '#2563eb15', needsActionLink: true, linkLabel: 'Buka Tryout' },
};

const scheduleTypeConfig = (type) => scheduleTypes[type] || scheduleTypes.live;
const isScheduleCompleted = (schedule, now = new Date()) => {
  if (schedule?.status === 'completed') return true;

  const endTime = new Date(schedule?.end_time);
  return !Number.isNaN(endTime.getTime()) && endTime.getTime() <= now.getTime();
};

export default function StudentSchedules({ user, schedules = [] }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 sm:px-6">
          <Link href="/">
            <BricsLogo size="sm" />
          </Link>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4 text-[#691D1B]" />
              <span className="max-w-[12rem] truncate" style={{ fontWeight: 700 }}>{user?.name || 'Siswa'}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm text-white transition-colors hover:bg-[#4A1412] sm:px-4"
              style={{ background: '#691D1B', fontWeight: 700 }}
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#691D1B] hover:underline mb-6"
          style={{ fontWeight: 600 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <section className="bg-[#691D1B] rounded-2xl p-5 mb-6 text-white shadow-sm sm:p-6 sm:mb-8">
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

              <h1 className="text-2xl mb-3 sm:text-3xl" style={{ fontWeight: 800 }}>
                Jadwal Pembelajaran
              </h1>

              <p className="text-sm text-[#D8D7BE] max-w-3xl leading-relaxed">
                Jadwal ini ditampilkan berdasarkan course aktif yang sudah kamu beli.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 sm:min-w-[220px]">
              <p className="text-xs text-[#D8D7BE] mb-1">Total Jadwal</p>
              <p className="text-3xl text-[#FFE882]" style={{ fontWeight: 800 }}>
                {schedules.length}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#D8D7BE] shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-[#F7F2E7] sm:px-6 sm:py-5">
            <h2 className="text-lg text-[#691D1B] sm:text-xl" style={{ fontWeight: 800 }}>
              Daftar Jadwal
            </h2>
            <p className="text-sm text-gray-500">
              Jadwal live class, konsultasi, deadline tugas, dan tryout dari course aktif.
            </p>
          </div>

          {schedules.length === 0 ? (
            <div className="p-6 text-center sm:p-8">
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
              {schedules.map((schedule) => {
                const type = scheduleTypeConfig(schedule.type);
                const completed = isScheduleCompleted(schedule, currentTime);
                const targetLink = completed
                  ? null
                  : (type.needsMeeting ? schedule.meeting_link : schedule.action_link);

                return (
                <div key={schedule.id} className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex min-w-0 gap-3 sm:gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 sm:h-12 sm:w-12"
                        style={{
                          background: '#F7F2E7',
                          color: '#691D1B',
                        }}
                      >
                        <CalendarDays className="w-6 h-6" />
                      </div>

                      <div className="min-w-0">
                        <span
                          className="inline-block text-xs px-3 py-1 rounded-full mb-2"
                          style={{
                            background: type.bg,
                            color: type.color,
                            fontWeight: 700,
                          }}
                        >
                          {type.label}
                        </span>

                        <h3 className="break-words text-base text-gray-900 mb-1 sm:text-lg" style={{ fontWeight: 800 }}>
                          {schedule.title}
                        </h3>

                        <p className="break-words text-sm text-gray-500 mb-3">
                          {schedule.package?.name || schedule.course?.title || 'Program UTBK'}
                        </p>

                        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-4">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#691D1B]" />
                            {schedule.type === 'student_deadline'
                              ? `Deadline ${formatDateTime(schedule.end_time)}`
                              : `${formatDateTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <User className="w-4 h-4 text-[#691D1B]" />
                            {schedule.mentor?.name || (schedule.type === 'tryout' ? 'BRICS Education' : 'Tutor')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {targetLink ? (
                      <a
                        href={targetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 rounded-xl text-white hover:bg-[#4A1412] transition-colors text-sm sm:w-auto"
                        style={{ background: '#691D1B', fontWeight: 700 }}
                      >
                        {type.needsMeeting ? <Video className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        {type.linkLabel}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm sm:w-auto">
                        <BookOpen className="w-4 h-4" />
                        {completed
                          ? 'Jadwal sudah berakhir'
                          : (type.needsMeeting || type.needsActionLink ? 'Link belum tersedia' : 'Pengingat')}
                      </span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
