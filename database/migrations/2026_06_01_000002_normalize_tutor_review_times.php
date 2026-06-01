<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedules')) {
            return;
        }

        DB::table('schedules')
            ->where('type', 'review')
            ->whereNotNull('end_time')
            ->update([
                'start_time' => DB::raw('end_time'),
            ]);
    }

    public function down(): void
    {
        //
    }
};
