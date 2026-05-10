<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
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
                'materials.course_id',
                'materials.uploaded_by',
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
                'course_id' => $material->course_id,
                'tutor_id' => $material->uploaded_by,
                'file_url' => $material->file_url,
                'content' => $material->content,
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
                ->orderBy('title')
                ->get(['id', 'title']),
            'tutors' => User::query()
                ->whereIn('role_id', [
                    User::roleIdFor('mentor') ?? 2,
                    User::roleIdFor('tutor') ?? 2,
                ])
                ->orderBy('name')
                ->get(['id', 'name']),
            'stats' => [
                'totalContent' => $totalContent,
                'pendingReview' => $pendingReview,
                'published' => $published,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        DB::table('materials')->insert([
            ...$this->payload($request),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.content')->with('success', 'Konten berhasil ditambahkan.');
    }

    public function update(Request $request, int $content): RedirectResponse
    {
        DB::table('materials')
            ->where('id', $content)
            ->update([
                ...$this->payload($request),
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.content')->with('success', 'Konten berhasil diperbarui.');
    }

    public function destroy(int $content): RedirectResponse
    {
        DB::table('materials')->where('id', $content)->delete();

        return redirect()->route('admin.content')->with('success', 'Konten berhasil dihapus.');
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
                'approved_by' => $status === 'approved' ? auth()->id() : null,
                'approved_at' => $status === 'approved' ? now() : null,
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.content')->with('success', $message);
    }

    private function payload(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['video', 'module', 'bank_soal'])],
            'course' => ['nullable', 'string', 'max:255'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'file_url' => ['nullable', 'string', 'max:1024'],
            'content' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $courseId = $validated['course_id'] ?? null;
        $courseTitle = trim((string) ($validated['course'] ?? ''));

        if (! $courseId && $courseTitle !== '') {
            $courseId = DB::table('courses')->where('title', $courseTitle)->value('id');

            if (! $courseId) {
                $courseId = DB::table('courses')->insertGetId([
                    'title' => $courseTitle,
                    'description' => 'Kelas dibuat dari admin konten.',
                    'price' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $status = $validated['status'];

        return [
            'course_id' => $courseId,
            'uploaded_by' => $validated['tutor_id'] ?? auth()->id(),
            'title' => $validated['title'],
            'type' => $validated['type'],
            'file_url' => $validated['file_url'] ?? null,
            'content' => $validated['content'] ?? null,
            'approval_status' => $status,
            'approved_by' => $status === 'approved' ? auth()->id() : null,
            'approved_at' => $status === 'approved' ? now() : null,
        ];
    }
}
