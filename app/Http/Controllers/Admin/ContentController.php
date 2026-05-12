<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
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
            ->orderByRaw("case when materials.approval_status = 'pending' then 0 else 1 end")
            ->orderByDesc('materials.created_at')
            ->select([
                'materials.id',
                'materials.title',
                'materials.type',
                'materials.file_url',
                'materials.content',
                'materials.course_id',
                'materials.uploaded_by',
                'materials.approval_status',
                'materials.rejection_comment',
                'materials.created_at',
                'users.name as tutor_name',
                'courses.title as course_title',
            ])
            ->paginate(20)
            ->withQueryString();

        $contents->getCollection()->transform(function ($material) {
            $contentLength = strlen(trim(strip_tags((string) ($material->content ?? ''))));
            $size = $contentLength > 0
                ? number_format(max(1, round($contentLength / 1024, 1)), 1).' KB'
                : ($material->file_url ? 'Terlampir' : '—');

            return [
                'id' => $material->id,
                'title' => $material->title,
                'type' => $material->type,
                'course_id' => $material->course_id,
                'tutor_id' => $material->uploaded_by,
                'file_url' => $material->file_url,
                'content' => $material->content,
                'rejection_comment' => $material->rejection_comment,
                'tutor' => $material->tutor_name ?: 'Tutor',
                'course' => $material->course_title ?: '-',
                'size' => $size,
                'submitted' => $material->created_at
                    ? CarbonImmutable::parse($material->created_at)->format('d M Y H:i')
                    : '-',
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
            'courses' => DB::table('courses')
                ->select('id', 'title')
                ->orderBy('title')
                ->get()
                ->map(fn ($course) => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'contentCount' => DB::table('materials')->where('course_id', $course->id)->count(),
                ]),
            'stats' => [
                'totalContent' => $totalContent,
                'pendingReview' => $pendingReview,
                'published' => $published,
            ],
        ]);
    }

    public function store(): RedirectResponse
    {
        abort(403, 'Admin hanya dapat melakukan review konten.');
    }

    public function update(int $content): RedirectResponse
    {
        abort(403, 'Admin hanya dapat melakukan review konten.');
    }

    public function destroy(int $content): RedirectResponse
    {
        abort(403, 'Admin hanya dapat melakukan review konten.');
    }

    public function approve(int $content): RedirectResponse
    {
        return $this->updateApprovalStatus($content, 'approved', 'Konten berhasil disetujui.');
    }

    public function reject(Request $request, int $content): RedirectResponse
    {
        $validated = $request->validate([
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        return $this->updateApprovalStatus(
            $content,
            'rejected',
            'Konten berhasil ditolak.',
            $validated['comment'] ?? null
        );
    }

    private function updateApprovalStatus(int $contentId, string $status, string $message, ?string $comment = null): RedirectResponse
    {
        $comment = trim((string) $comment);

        DB::table('materials')
            ->where('id', $contentId)
            ->update([
                'approval_status' => $status,
                'approved_by' => $status === 'approved' ? auth()->id() : null,
                'approved_at' => $status === 'approved' ? now() : null,
                'rejection_comment' => $status === 'rejected' && $comment !== '' ? $comment : null,
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.content')->with('success', $message);
    }
}
