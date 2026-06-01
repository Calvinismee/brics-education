<?php

namespace App\Models;

use App\Support\AdminNotifier;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class Material extends Model
{
    protected $fillable = [
        'course_id',
        'uploaded_by',
        'title',
        'type',
        'file_url',
        'storage_disk',
        'file_path',
        'content',
        'approval_status',
        'rejection_comment',
        'approved_by',
        'approved_at',
    ];

    protected static function booted(): void
    {
        static::created(function (Material $material) {
            if (($material->approval_status ?? 'pending') === 'pending') {
                AdminNotifier::contentPending($material);
            }
        });
    }

    protected function fileUrl(): Attribute
    {
        return Attribute::get(fn ($value, array $attributes) => self::publicUrlFor(
            $attributes['storage_disk'] ?? null,
            $attributes['file_path'] ?? null,
            $value,
            $this->getKey()
        ));
    }

    public static function publicUrlFor(?string $disk, ?string $path, ?string $fallback = null, ?int $materialId = null): ?string
    {
        if ($disk && $path) {
            if ($materialId && Route::has('materials.file')) {
                return URL::temporarySignedRoute('materials.file', now()->addHours(6), [
                    'material' => $materialId,
                    'filename' => basename($path),
                ]);
            }

            if ($disk === 'public') {
                return '/storage/'.ltrim($path, '/');
            }

            return self::normalizePublicUrl(Storage::disk($disk)->url($path));
        }

        return self::normalizePublicUrl($fallback);
    }

    public static function normalizePublicUrl(?string $url): ?string
    {
        $url = trim((string) $url);

        if ($url === '') {
            return null;
        }

        if (str_starts_with($url, 'storage/')) {
            return '/'.$url;
        }

        $path = parse_url($url, PHP_URL_PATH);

        if ($path && str_starts_with($path, '/storage/')) {
            $query = parse_url($url, PHP_URL_QUERY);

            return $path.($query ? '?'.$query : '');
        }

        return $url;
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
