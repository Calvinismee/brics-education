<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedules')) {
            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'tutor_id')) {
                $table->dropConstrainedForeignId('tutor_id');
            }

            $columns = array_values(array_filter([
                'course',
                'day',
                'schedule_date',
                'students_count',
                'room',
                'modality',
                'status',
            ], fn (string $column): bool => Schema::hasColumn('schedules', $column)));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('schedules')) {
            return;
        }

        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'course')) {
                $table->string('course')->nullable();
            }

            if (! Schema::hasColumn('schedules', 'tutor_id')) {
                $table->foreignId('tutor_id')->nullable()->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('schedules', 'day')) {
                $table->string('day')->nullable();
            }

            if (! Schema::hasColumn('schedules', 'schedule_date')) {
                $table->date('schedule_date')->nullable();
            }

            if (! Schema::hasColumn('schedules', 'students_count')) {
                $table->unsignedInteger('students_count')->default(0);
            }

            if (! Schema::hasColumn('schedules', 'room')) {
                $table->string('room')->nullable();
            }

            if (! Schema::hasColumn('schedules', 'modality')) {
                $table->string('modality')->default('online');
            }

            if (! Schema::hasColumn('schedules', 'status')) {
                $table->string('status')->default('scheduled');
            }
        });
    }
};
