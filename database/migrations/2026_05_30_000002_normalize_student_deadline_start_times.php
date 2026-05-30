<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedules') || ! Schema::hasColumn('schedules', 'type')) {
            return;
        }

        DB::table('schedules')
            ->where('type', 'student_deadline')
            ->whereNotNull('end_time')
            ->select('id', 'end_time')
            ->orderBy('id')
            ->chunkById(100, function ($schedules) {
                foreach ($schedules as $schedule) {
                    DB::table('schedules')
                        ->where('id', $schedule->id)
                        ->update([
                            'start_time' => Carbon::parse($schedule->end_time)->startOfDay(),
                        ]);
                }
            });
    }

    public function down(): void
    {
        // The previous start time represented an obsolete value and cannot be reconstructed.
    }
};
