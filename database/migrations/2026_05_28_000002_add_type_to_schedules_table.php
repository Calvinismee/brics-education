<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedules')) {
            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'type')) {
                $table->string('type', 30)->default('live');
            }
        });

        DB::table('schedules')
            ->select('id', 'title')
            ->orderBy('id')
            ->chunkById(100, function ($schedules) {
                foreach ($schedules as $schedule) {
                    $title = strtolower((string) $schedule->title);
                    $type = match (true) {
                        str_contains($title, 'deadline') => 'deadline',
                        str_contains($title, 'review') => 'review',
                        str_contains($title, 'konsultasi') || str_contains($title, 'consult') => 'consultation',
                        default => 'live',
                    };

                    DB::table('schedules')
                        ->where('id', $schedule->id)
                        ->update(['type' => $type]);
                }
            });
    }

    public function down(): void
    {
        if (! Schema::hasTable('schedules') || ! Schema::hasColumn('schedules', 'type')) {
            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
