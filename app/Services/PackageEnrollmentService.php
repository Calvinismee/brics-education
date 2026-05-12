<?php

namespace App\Services;

use App\Models\Package;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PackageEnrollmentService
{
    public function enroll(User|int $student, Package|int $package): Collection
    {
        $studentId = $student instanceof User ? $student->id : $student;
        $packageId = $package instanceof Package ? $package->id : $package;
        $now = Carbon::now();

        return DB::transaction(function () use ($studentId, $packageId, $now) {
            $courseIds = DB::table('package_course')
                ->where('package_id', $packageId)
                ->orderBy('course_id')
                ->pluck('course_id');

            return $courseIds->map(function (int $courseId) use ($studentId, $packageId, $now) {
                DB::table('enrollments')->updateOrInsert(
                    [
                        'user_id' => $studentId,
                        'course_id' => $courseId,
                    ],
                    [
                        'package_id' => $packageId,
                        'status' => 'active',
                        'enrolled_at' => $now,
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );

                return DB::table('enrollments')
                    ->where('user_id', $studentId)
                    ->where('course_id', $courseId)
                    ->first();
            });
        });
    }
}
