<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('package_course')) {
            Schema::create('package_course', function (Blueprint $table) {
                $table->id();
                $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
                $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['package_id', 'course_id']);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'mentor_course_id')) {
                $table->foreignId('mentor_course_id')->nullable()->after('role_id')->constrained('courses')->nullOnDelete();
            }
        });

        Schema::table('enrollments', function (Blueprint $table) {
            if (! Schema::hasColumn('enrollments', 'package_id')) {
                $table->foreignId('package_id')->nullable()->after('course_id')->constrained('packages')->nullOnDelete();
            }
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'package_id')) {
                $table->foreignId('package_id')->nullable()->after('course_id')->constrained('packages')->nullOnDelete();
            }
        });

        DB::statement('ALTER TABLE transactions ALTER COLUMN course_id DROP NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE transactions ALTER COLUMN course_id SET NOT NULL');

        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'package_id')) {
                $table->dropConstrainedForeignId('package_id');
            }
        });

        Schema::table('enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('enrollments', 'package_id')) {
                $table->dropConstrainedForeignId('package_id');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'mentor_course_id')) {
                $table->dropConstrainedForeignId('mentor_course_id');
            }
        });

        Schema::dropIfExists('package_course');
    }
};
