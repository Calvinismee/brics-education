<?php

namespace App\Models;

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

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}