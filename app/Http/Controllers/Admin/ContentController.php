<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ContentController extends Controller
{
    public function index()
    {
        $contents = DB::table('materials')
            ->leftJoin('users', 'materials.uploaded_by', '=', 'users.id')
            ->leftJoin('courses', 'materials.course_id', '=', 'courses.id')
            ->orderByDesc('materials.created_at')
            ->select([
                'materials.id',
                'materials.title',
                'materials.type',
                'materials.file_url',
                'materials.content',
                'materials.approval_status',
                'materials.created_at',
                'users.name as tutor_name',
                'courses.title as course_title',
            ])
            ->paginate(20)
            ->withQueryString();

        $contents->getCollection()->transform(function ($material) {
            $contentLength = strlen(trim(strip_tags((string) ($material->content ?? ''))));
            $size = $contentLength > 0
                ? number_format(max(1, round($contentLength / 1024, 1)), 1) . ' KB'
                : ($material->file_url ? 'Terlampir' : '—');

            return [
                'id' => $material->id,
                'title' => $material->title,
                'type' => $material->type,
                'tutor' => $material->tutor_name ?: 'Tutor',
                'course' => $material->course_title ?: '-',
                'size' => $size,
                'submitted' => optional($material->created_at)->format('d M Y H:i'),
                'status' => match ($material->approval_status) {
                    'approved' => 'approved',
                    'rejected' => 'rejected',
                    default => 'pending',
                },
            ];
        });

        $totalContent = DB::table('materials')->count();
        $pendingReview = DB::table('materials')->where('approval_status', 'pending')->count();
        $published = DB::table('materials')->where('approval_status', 'approved')->count();

        return Inertia::render('Admin/Content', [
            'contents' => $contents,
            'stats' => [
            'totalContent' => $totalContent,
            'pendingReview' => $pendingReview,
            'published' => $published,
            ],
        ]);
    }

    public function approve(Request $request, int $content): RedirectResponse
    {
        return $this->updateApprovalStatus($content, 'approved', 'Konten berhasil disetujui.');
    }

    public function reject(Request $request, int $content): RedirectResponse
    {
        return $this->updateApprovalStatus($content, 'rejected', 'Konten berhasil ditolak.');
    }

    private function updateApprovalStatus(int $contentId, string $status, string $message): RedirectResponse
    {
        DB::table('materials')
            ->where('id', $contentId)
            ->update([
                'approval_status' => $status,
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.content')->with('success', $message);
    }
}
