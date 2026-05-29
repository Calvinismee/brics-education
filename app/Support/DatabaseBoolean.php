<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class DatabaseBoolean
{
    public static function value(bool $value): bool|string
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            return $value ? 'true' : 'false';
        }

        return $value;
    }
}
