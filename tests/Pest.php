<?php

use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function seedRolesForTests(): array
{
    foreach (['student', 'mentor', 'admin'] as $role) {
        DB::table('roles')->updateOrInsert(
            ['name' => $role],
            ['created_at' => now(), 'updated_at' => now()],
        );
    }

    Cache::forget('roles:map');
    Cache::forget('roles:id-map');

    $roles = DB::table('roles')->pluck('id', 'name')->map(fn ($id) => (int) $id)->all();

    return [
        'student' => $roles['student'],
        'mentor' => $roles['mentor'],
        'tutor' => $roles['mentor'],
        'admin' => $roles['admin'],
    ];
}

function roleIdForTest(string $role): int
{
    $roles = seedRolesForTests();

    return $roles[$role] ?? $roles['student'];
}

function userWithRoleForTest(string $role, array $attributes = []): User
{
    $roleId = roleIdForTest($role);
    $legacyRole = $role === 'tutor' ? 'mentor' : $role;

    return User::factory()->create(array_merge([
        'role' => $legacyRole,
        'role_id' => $roleId,
        'email_verified_at' => now(),
    ], $attributes));
}

function adminUser(array $attributes = []): User
{
    return userWithRoleForTest('admin', $attributes);
}

function studentUser(array $attributes = []): User
{
    return userWithRoleForTest('student', $attributes);
}

function tutorUser(array $attributes = []): User
{
    return userWithRoleForTest('tutor', $attributes);
}

function courseRecord(array $overrides = []): array
{
    $payload = array_merge([
        'title' => 'Paket SNBT',
        'description' => 'Paket belajar untuk persiapan SNBT.',
        'price' => 15000,
        'status' => 'published',
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides);

    $payload['id'] = DB::table('courses')->insertGetId($payload);

    return $payload;
}

function packageRecord(array $overrides = []): Package
{
    return Package::create(array_merge([
        'name' => 'Paket SNBT',
        'price' => '15000',
        'description' => 'Paket belajar untuk persiapan SNBT.',
        'features' => ['Tryout', 'Pembahasan'],
        'popular' => false,
    ], $overrides));
}

function materialRecord(array $overrides = []): array
{
    $course = $overrides['course'] ?? courseRecord();
    $tutor = $overrides['tutor'] ?? tutorUser();

    unset($overrides['course'], $overrides['tutor']);

    $payload = array_merge([
        'course_id' => $course['id'],
        'uploaded_by' => $tutor->id,
        'title' => 'Materi TPS',
        'type' => 'module',
        'file_url' => 'https://example.com/materi-tps.pdf',
        'content' => '<p>Materi latihan TPS.</p>',
        'approval_status' => 'pending',
        'approved_by' => null,
        'approved_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides);

    $payload['id'] = DB::table('materials')->insertGetId($payload);

    return $payload;
}

function transactionRecord(array $overrides = []): array
{
    $student = $overrides['student'] ?? studentUser();
    $course = $overrides['course'] ?? courseRecord();

    unset($overrides['student'], $overrides['course']);

    $payload = array_merge([
        'user_id' => $student->id,
        'course_id' => $course['id'],
        'invoice_number' => 'INV-TEST-001',
        'amount' => 15000,
        'payment_method' => 'qris',
        'payment_status' => 'success',
        'payment_gateway_ref' => null,
        'paid_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides);

    $payload['id'] = DB::table('transactions')->insertGetId($payload);

    return $payload;
}

function notificationRecord(User $user, array $overrides = []): array
{
    $payload = array_merge([
        'user_id' => $user->id,
        'title' => 'Transaksi Baru',
        'message' => 'Ada transaksi baru yang perlu dicek.',
        'is_read' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides);

    $payload['id'] = DB::table('notifications')->insertGetId($payload);

    return $payload;
}

function hashedPasswordForTest(string $password = 'password'): string
{
    return Hash::make($password);
}
