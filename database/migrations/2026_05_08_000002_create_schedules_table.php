<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedules')) {
            Schema::create('schedules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
                $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('title');
                $table->dateTime('start_time');
                $table->dateTime('end_time');
                $table->string('meeting_link')->nullable();
                $table->timestamps();
            });

            return;
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
