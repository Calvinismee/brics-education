<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressRecord extends Model
{
    protected $table = 'progress_records';

    protected $fillable = [
        'user_id',
        'course_id',
        'material_id',
        'status',
        'percent',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'percent' => 'integer',
    ];
}
