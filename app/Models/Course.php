<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory;

    protected $appends = [
        'slug',
    ];

    protected $fillable = [
        'category_id',
        'title',
        'description',
        'price',
        'status',
    ];

    public function getSlugAttribute(): string
    {
        return Str::slug($this->title);
    }

    public static function resolveRouteSlug(string|int|null $value): ?self
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return self::query()->find((int) $value);
        }

        return self::query()
            ->get()
            ->first(fn (self $course) => $course->slug === $value);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(Package::class, 'package_course')
            ->withTimestamps();
    }

    public function mentors(): HasMany
    {
        return $this->hasMany(User::class, 'mentor_course_id');
    }

    public function assignedTutors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_tutor', 'course_id', 'tutor_id')
            ->withTimestamps();
    }
}
