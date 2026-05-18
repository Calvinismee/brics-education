<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

#[Fillable(['name', 'email', 'password', 'role_id', 'mentor_course_id', 'tutor_settings', 'tutor_profile', 'google_id', 'google_avatar', 'email_verified_at', 'gender', 'phone', 'school_origin'])]
#[Hidden(['password', 'remember_token', 'google_id'])]
class User extends Authenticatable
{
    private const ROLE_MAP_CACHE_KEY = 'roles:map';

    private const ROLE_ID_MAP_CACHE_KEY = 'roles:id-map';

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'tutor_settings' => 'array',
            'tutor_profile' => 'array',
        ];
    }

    public function getRoleAttribute(): string
    {
        return static::roleNameFor($this->getAttribute('role_id'));
    }

    public static function roleNameFor(int|string|null $roleId): string
    {
        if ($roleId === null) {
            return 'user';
        }

        $roles = static::cachedRoleMap();

        return $roles[$roleId] ?? 'user';
    }

    public static function roleIdFor(string $roleName): ?int
    {
        $normalizedRoleName = strtolower(trim($roleName));

        if ($normalizedRoleName === '') {
            return null;
        }

        $roleIds = static::cachedRoleIdMap();

        return $roleIds[$normalizedRoleName] ?? null;
    }

    public static function adminRoleIds(): array
    {
        return [
            'student' => static::roleIdFor('student') ?? 1,
            'tutor' => static::roleIdFor('tutor') ?? static::roleIdFor('mentor') ?? 2,
            'admin' => static::roleIdFor('admin') ?? 3,
        ];
    }

    private static function cachedRoleMap(): array
    {
        return Cache::rememberForever(self::ROLE_MAP_CACHE_KEY, function () {
            return DB::table('roles')->pluck('name', 'id')->all();
        });
    }

    private static function cachedRoleIdMap(): array
    {
        return Cache::rememberForever(self::ROLE_ID_MAP_CACHE_KEY, function () {
            $roleIdMap = [];

            foreach (static::cachedRoleMap() as $roleId => $roleName) {
                $roleIdMap[strtolower(trim((string) $roleName))] = (int) $roleId;
            }

            return $roleIdMap;
        });
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function mentorCourse(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'mentor_course_id');
    }

    public function assignedCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_tutor', 'tutor_id', 'course_id')
            ->withTimestamps();
    }

    public function isAdmin(): bool
    {
        $role = strtolower(trim(static::roleNameFor($this->getAttribute('role_id'))));

        if ($role === 'admin') {
            return true;
        }

        $adminRoleId = static::roleIdFor('admin');

        if ($adminRoleId === null) {
            return false;
        }

        return (int) $this->getAttribute('role_id') === $adminRoleId;
    }
}
