<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('schedules')) {
            Schema::create('schedules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
                $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('title');
                $table->string('start_time');
                $table->string('end_time');
                $table->string('meeting_link')->nullable();
                $table->string('course')->nullable();
                $table->foreignId('tutor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('day')->nullable();
                $table->date('schedule_date')->nullable();
                $table->unsignedInteger('students_count')->default(0);
                $table->string('room')->nullable();
                $table->string('modality')->default('online');
                $table->string('status')->default('scheduled');
                $table->timestamps();
            });

            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            if (!Schema::hasColumn('schedules', 'course')) {
                $table->string('course')->nullable()->after('meeting_link');
            }

            if (!Schema::hasColumn('schedules', 'tutor_id')) {
                $table->foreignId('tutor_id')->nullable()->after('course')->constrained('users')->nullOnDelete();
            }

            if (!Schema::hasColumn('schedules', 'day')) {
                $table->string('day')->nullable()->after('tutor_id');
            }

            if (!Schema::hasColumn('schedules', 'schedule_date')) {
                $table->date('schedule_date')->nullable()->after('day');
            }

            if (!Schema::hasColumn('schedules', 'students_count')) {
                $table->unsignedInteger('students_count')->default(0)->after('end_time');
            }

            if (!Schema::hasColumn('schedules', 'room')) {
                $table->string('room')->nullable()->after('students_count');
            }

            if (!Schema::hasColumn('schedules', 'modality')) {
                $table->string('modality')->default('online')->after('room');
            }

            if (!Schema::hasColumn('schedules', 'status')) {
                $table->string('status')->default('scheduled')->after('modality');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
