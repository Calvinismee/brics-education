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
            if (! Schema::hasColumn('schedules', 'package_id')) {
                $table->foreignId('package_id')
                    ->nullable()
                    ->after('course_id')
                    ->constrained('packages')
                    ->nullOnDelete();
            }
        });

        DB::table('schedules')
            ->where('type', 'deadline')
            ->whereNotNull('end_time')
            ->update([
                'start_time' => DB::raw('end_time'),
            ]);

        DB::table('schedules')
            ->where('type', 'tryout')
            ->whereNull('package_id')
            ->whereNotNull('course_id')
            ->select('id', 'course_id')
            ->get()
            ->each(function ($schedule) {
                $packageIds = DB::table('package_course')
                    ->where('course_id', $schedule->course_id)
                    ->pluck('package_id');

                if ($packageIds->count() !== 1) {
                    return;
                }

                $packageId = $packageIds->first();
                $packageName = DB::table('packages')->where('id', $packageId)->value('name');

                DB::table('schedules')
                    ->where('id', $schedule->id)
                    ->update([
                        'course_id' => null,
                        'package_id' => $packageId,
                        'title' => $packageName ? 'Tryout '.$packageName : 'Tryout',
                    ]);
            });
    }

    public function down(): void
    {
        if (! Schema::hasTable('schedules') || ! Schema::hasColumn('schedules', 'package_id')) {
            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('package_id');
        });
    }
};
