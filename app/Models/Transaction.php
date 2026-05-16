<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'package_id',
        'enrollment_id',
        'invoice_number',
        'amount',
        'payment_method',
        'payment_status',
        'payment_gateway_ref',
        'paid_at',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
