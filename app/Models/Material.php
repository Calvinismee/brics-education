<?php

namespace App\Models;

use App\Support\AdminNotifier;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'course_id',
        'uploaded_by',
        'title',
        'type',
        'file_url',
        'content',
        'approval_status',
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

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
