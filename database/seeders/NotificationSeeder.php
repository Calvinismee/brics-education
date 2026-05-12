<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $adminRoleId = DB::table('roles')->where('name', 'admin')->value('id') ?? 3;
        $adminId = DB::table('users')->where('role_id', $adminRoleId)->value('id');

        if (! $adminId) {
            return;
        }

        $now = Carbon::now();

        $notifications = [
            [
                'title' => 'Transaksi Baru',
                'message' => 'Siswa Brics berhasil membeli Paket Persiapan SNBT dan otomatis terenroll ke seluruh course TPS dan Literasi.',
                'created_at' => $now->copy()->subDays(2),
            ],
            [
                'title' => 'Konten Course Diperbarui',
                'message' => 'Tutor Penalaran Matematika menambahkan drill soal kontekstual untuk persiapan SNBT.',
                'created_at' => $now->copy()->subDays(1),
            ],
            [
                'title' => 'Pengguna Baru',
                'message' => 'Ada siswa baru yang siap dipetakan ke paket pembelajaran.',
                'created_at' => $now,
            ],
            [
                'title' => 'Jadwal Kelas Ditambahkan',
                'message' => 'Kelas Literasi Bahasa Indonesia dijadwalkan dengan mentor yang sudah terikat ke course tersebut.',
                'created_at' => $now->copy()->subHours(3),
            ],
            [
                'title' => 'Pembayaran Tertunda',
                'message' => 'Masih ada transaksi paket yang pending dan belum memicu enrollment.',
                'created_at' => $now->copy()->subHours(6),
            ],
            [
                'title' => 'Konten Menunggu Persetujuan',
                'message' => 'Ada materi per course yang masih menunggu review admin.',
                'created_at' => $now->copy()->subDays(1),
            ],
        ];

        foreach ($notifications as $notification) {
            DB::table('notifications')->updateOrInsert(
                [
                    'user_id' => $adminId,
                    'title' => $notification['title'],
                ],
                [
                    'user_id' => $adminId,
                    'title' => $notification['title'],
                    'message' => $notification['message'],
                    'is_read' => false,
                    'created_at' => $notification['created_at'],
                    'updated_at' => $notification['created_at'],
                ]
            );
        }
    }
}
