<?php

namespace App\Support;

use App\Models\Material;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminNotifier
{
    public static function notifyAdmins(string $title, string $message): void
    {
        $adminRoleId = User::roleIdFor('admin')
            ?? DB::table('roles')->where('name', 'admin')->value('id');

        if (! $adminRoleId) {
            return;
        }

        $adminIds = DB::table('users')
            ->where('role_id', $adminRoleId)
            ->pluck('id');

        if ($adminIds->isEmpty()) {
            return;
        }

        $now = now();

        DB::table('notifications')->insert(
            $adminIds->map(fn ($adminId) => [
                'user_id' => $adminId,
                'title' => $title,
                'message' => $message,
                'is_read' => DatabaseBoolean::value(false),
                'created_at' => $now,
                'updated_at' => $now,
            ])->all()
        );

        $adminIds->each(fn ($adminId) => AdminNotificationCache::forgetForUser((int) $adminId));
    }

    public static function studentRegistered(User $student): void
    {
        self::notifyAdmins(
            'Pengguna Baru',
            "{$student->name} mendaftar sebagai siswa dengan email {$student->email}."
        );
    }

    public static function transactionPending(User $student, string $productName, ?string $invoiceNumber = null): void
    {
        self::notifyAdmins(
            'Pembayaran Tertunda',
            self::transactionMessage($student, $productName, $invoiceNumber, 'membuat transaksi pending untuk')
        );
    }

    public static function transactionSucceeded(User $student, string $productName, ?string $invoiceNumber = null): void
    {
        self::notifyAdmins(
            'Pembayaran Berhasil',
            self::transactionMessage($student, $productName, $invoiceNumber, 'berhasil membayar')
        );
    }

    public static function transactionFailed(User $student, string $productName, ?string $invoiceNumber = null): void
    {
        self::notifyAdmins(
            'Pembayaran Gagal',
            self::transactionMessage($student, $productName, $invoiceNumber, 'mengalami kegagalan pembayaran untuk')
        );
    }

    public static function transactionExpired(User $student, string $productName, ?string $invoiceNumber = null): void
    {
        self::notifyAdmins(
            'Pembayaran Kedaluwarsa',
            self::transactionMessage($student, $productName, $invoiceNumber, 'melewati batas waktu pembayaran untuk')
        );
    }

    public static function scheduleCreated(Schedule $schedule): void
    {
        self::notifyAdmins('Jadwal Kelas Ditambahkan', self::scheduleMessage($schedule, 'ditambahkan'));
    }

    public static function scheduleUpdated(Schedule $schedule): void
    {
        self::notifyAdmins('Jadwal Kelas Diperbarui', self::scheduleMessage($schedule, 'diperbarui'));
    }

    public static function contentPending(Material $material): void
    {
        $courseTitle = DB::table('courses')->where('id', $material->course_id)->value('title') ?? 'course terkait';
        $tutorName = DB::table('users')->where('id', $material->uploaded_by)->value('name') ?? 'Tutor';

        self::notifyAdmins(
            'Konten Menunggu Persetujuan',
            "{$tutorName} mengunggah {$material->title} untuk {$courseTitle} dan menunggu review admin."
        );
    }

    public static function contentPendingUpload(User $tutor, array $materials): void
    {
        if ($materials === []) {
            return;
        }

        $firstMaterial = $materials[0];
        $courseTitle = DB::table('courses')->where('id', $firstMaterial->course_id)->value('title') ?? 'course terkait';
        $materialCount = count($materials);
        $materialText = $materialCount === 1 ? $firstMaterial->title : "{$materialCount} materi";

        self::notifyAdmins(
            'Konten Menunggu Persetujuan',
            "{$tutor->name} mengunggah \"{$materialText}\" untuk {$courseTitle} dan menunggu review admin."
        );
    }

    public static function contentReviewed(int $materialId, string $status): void
    {
        $material = DB::table('materials')
            ->leftJoin('courses', 'materials.course_id', '=', 'courses.id')
            ->where('materials.id', $materialId)
            ->select('materials.title', 'courses.title as course_title')
            ->first();

        if (! $material) {
            return;
        }

        $label = $status === 'approved' ? 'disetujui' : 'ditolak';
        $title = $status === 'approved' ? 'Konten Disetujui' : 'Konten Ditolak';

        self::notifyAdmins(
            $title,
            "{$material->title} untuk {$material->course_title} telah {$label} oleh admin."
        );
    }

    private static function transactionMessage(
        User $student,
        string $productName,
        ?string $invoiceNumber,
        string $action
    ): string {
        $invoiceText = $invoiceNumber ? " Invoice: {$invoiceNumber}." : '';

        return "{$student->name} {$action} {$productName}.{$invoiceText}";
    }

    private static function scheduleMessage(Schedule $schedule, string $action): string
    {
        $schedule->loadMissing(['course', 'package', 'mentor']);

        $courseTitle = $schedule->package?->name ?? $schedule->course?->title ?? $schedule->title ?? 'Course';
        $mentorName = $schedule->mentor?->name ?? 'Tutor belum ditentukan';
        $scheduleTime = Schedule::hasDeadlineOnly($schedule->type) ? $schedule->end_time : $schedule->start_time;
        $date = $scheduleTime?->format('d M Y H:i') ?? 'waktu belum ditentukan';

        return "Jadwal {$courseTitle} {$action} untuk {$date} bersama {$mentorName}.";
    }
}
