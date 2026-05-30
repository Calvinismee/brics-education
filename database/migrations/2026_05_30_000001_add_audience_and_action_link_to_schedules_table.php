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
            if (! Schema::hasColumn('schedules', 'audience')) {
                $table->string('audience', 20)->default('shared')->after('type');
            }

            if (! Schema::hasColumn('schedules', 'action_link')) {
                $table->string('action_link', 1024)->nullable()->after('meeting_link');
            }
        });

        DB::table('schedules')
            ->select('id', 'type', 'title')
            ->orderBy('id')
            ->chunkById(100, function ($schedules) {
                foreach ($schedules as $schedule) {
                    $title = strtolower((string) $schedule->title);
                    $type = (string) ($schedule->type ?: 'live');

                    if (str_contains($title, 'tryout')) {
                        $type = 'tryout';
                    } elseif (str_contains($title, 'tugas')) {
                        $type = 'student_deadline';
                    }

                    $audience = match ($type) {
                        'deadline', 'review' => 'tutor',
                        'student_deadline', 'tryout' => 'student',
                        default => 'shared',
                    };

                    DB::table('schedules')
                        ->where('id', $schedule->id)
                        ->update([
                            'type' => $type,
                            'audience' => $audience,
                        ]);
                }
            });
    }

    public function down(): void
    {
        if (! Schema::hasTable('schedules')) {
            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'action_link')) {
                $table->dropColumn('action_link');
            }

            if (Schema::hasColumn('schedules', 'audience')) {
                $table->dropColumn('audience');
            }
        });
    }
};
