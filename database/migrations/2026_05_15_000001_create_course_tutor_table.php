<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('course_tutor')) {
            Schema::create('course_tutor', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
                $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['course_id', 'tutor_id']);
            });
        }

        $now = now();

        DB::table('users')
            ->whereNotNull('mentor_course_id')
            ->select('id', 'mentor_course_id')
            ->orderBy('id')
            ->chunkById(100, function ($users) use ($now) {
                foreach ($users as $user) {
                    DB::table('course_tutor')->updateOrInsert(
                        [
                            'course_id' => $user->mentor_course_id,
                            'tutor_id' => $user->id,
                        ],
                        [
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            });

        DB::table('schedules')
            ->whereNotNull('course_id')
            ->whereNotNull('mentor_id')
            ->select('id', 'course_id', 'mentor_id')
            ->orderBy('id')
            ->chunkById(100, function ($schedules) use ($now) {
                foreach ($schedules as $schedule) {
                    DB::table('course_tutor')->updateOrInsert(
                        [
                            'course_id' => $schedule->course_id,
                            'tutor_id' => $schedule->mentor_id,
                        ],
                        [
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_tutor');
    }
};
