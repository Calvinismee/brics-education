<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MaterialFileController extends Controller
{
    public function __invoke(Material $material): StreamedResponse
    {
        $diskName = trim((string) $material->storage_disk);
        $path = trim((string) $material->file_path);

        abort_if($diskName === '' || $path === '', 404, 'File materi tidak ditemukan.');

        try {
            $disk = Storage::disk($diskName);
            $exists = $disk->exists($path);
        } catch (\Throwable $exception) {
            report($exception);

            abort(404, 'File materi tidak dapat diakses.');
        }

        abort_unless($exists, 404, 'File materi tidak ditemukan.');

        try {
            $stream = $disk->readStream($path);
            $mimeType = $disk->mimeType($path) ?: 'application/octet-stream';
            $size = $disk->size($path);
        } catch (\Throwable $exception) {
            report($exception);

            abort(404, 'File materi tidak dapat dibuka.');
        }

        abort_if($stream === false, 404, 'File materi tidak dapat dibuka.');

        $filename = str_replace(['"', "\r", "\n"], '', basename($path));

        return response()->stream(function () use ($stream) {
            fpassthru($stream);

            if (is_resource($stream)) {
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $mimeType,
            'Content-Length' => (string) $size,
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=300',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
