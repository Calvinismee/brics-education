<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory;

    protected $appends = [
        'slug',
    ];

    protected $fillable = [
        'name',
        'price',
        'description',
        'features',
        'popular',
    ];

    public function getSlugAttribute(): string
    {
        return Str::slug($this->name);
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
            ->first(fn (self $package) => $package->slug === $value);
    }

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'popular' => 'boolean',
        ];
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'package_course')
            ->withTimestamps();
    }
}
