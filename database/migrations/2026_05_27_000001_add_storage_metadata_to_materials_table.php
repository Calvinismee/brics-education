<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            if (! Schema::hasColumn('materials', 'storage_disk')) {
                $table->string('storage_disk')->nullable()->after('file_url');
            }

            if (! Schema::hasColumn('materials', 'file_path')) {
                $table->text('file_path')->nullable()->after('storage_disk');
            }
        });

        DB::table('materials')
            ->whereNotNull('file_url')
            ->whereNull('file_path')
            ->orderBy('id')
            ->get(['id', 'file_url'])
            ->each(function ($material) {
                $path = parse_url((string) $material->file_url, PHP_URL_PATH) ?: (string) $material->file_url;

                if (! str_starts_with($path, '/storage/')) {
                    return;
                }

                DB::table('materials')
                    ->where('id', $material->id)
                    ->update([
                        'storage_disk' => 'public',
                        'file_path' => ltrim(substr($path, strlen('/storage/')), '/'),
                        'updated_at' => now(),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            if (Schema::hasColumn('materials', 'file_path')) {
                $table->dropColumn('file_path');
            }

            if (Schema::hasColumn('materials', 'storage_disk')) {
                $table->dropColumn('storage_disk');
            }
        });
    }
};
