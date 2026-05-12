<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'description',
        'price',
        'status',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function schedules()
    {
    return $this->hasMany(Schedule::class);
    }
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
}
