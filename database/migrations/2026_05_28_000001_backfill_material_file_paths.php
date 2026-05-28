<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('materials')
            ->whereNotNull('file_url')
            ->whereNull('file_path')
            ->orderBy('id')
            ->get(['id', 'file_url'])
            ->each(function ($material) {
                $fileUrl = trim((string) $material->file_url);

                if ($fileUrl === '') {
                    return;
                }

                $disk = null;
                $path = null;
                $urlPath = parse_url($fileUrl, PHP_URL_PATH) ?: $fileUrl;

                if (str_starts_with($fileUrl, '/storage/') || str_starts_with($urlPath, '/storage/')) {
                    $disk = 'public';
                    $path = ltrim(substr($urlPath, strlen('/storage/')), '/');
                } elseif ($this->isConfiguredS3Url($fileUrl)) {
                    $disk = 's3';
                    $path = $this->pathFromS3Url($fileUrl);
                }

                if (! $disk || ! $path) {
                    return;
                }

                DB::table('materials')
                    ->where('id', $material->id)
                    ->update([
                        'storage_disk' => $disk,
                        'file_path' => $path,
                        'updated_at' => now(),
                    ]);
            });
    }

    public function down(): void
    {
        DB::table('materials')
            ->whereIn('storage_disk', ['public', 's3'])
            ->update([
                'storage_disk' => null,
                'file_path' => null,
                'updated_at' => now(),
            ]);
    }

    private function isConfiguredS3Url(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);

        if (! $host) {
            return false;
        }

        $configuredHost = parse_url((string) config('filesystems.disks.s3.url'), PHP_URL_HOST);

        return $host === $configuredHost
            || str_ends_with($host, '.r2.dev')
            || str_contains($host, 'r2.cloudflarestorage.com');
    }

    private function pathFromS3Url(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);

        if (! $path) {
            return null;
        }

        $basePath = parse_url((string) config('filesystems.disks.s3.url'), PHP_URL_PATH);

        if ($basePath && str_starts_with($path, rtrim($basePath, '/').'/')) {
            $path = substr($path, strlen(rtrim($basePath, '/')));
        }

        return ltrim($path, '/');
    }
};
