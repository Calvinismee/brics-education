<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Notification;
use App\Support\AdminNotifier;
use App\Support\TutorCourseResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $courseIds = $this->tutorCourseIds($user);

        $materials = Material::query()
            ->with('course:id,title')
            ->whereIn('course_id', $courseIds)
            ->latest()
            ->get()
            ->map(fn (Material $material) => [
                'id' => $material->id,
                'name' => $material->title,
                'title' => $material->title,
                'meta' => $material->file_url ?: $material->content,
                'type' => $this->materialType($material->type),
                'status' => $material->approval_status,
                'course' => $material->course?->title,
                'course_id' => $material->course_id,
                'uploaded_by_current_tutor' => (int) $material->uploaded_by === (int) $user->id,
                'can_delete' => $courseIds->contains((int) $material->course_id),
                'rejection_comment' => $material->rejection_comment,
                'created_at' => $material->created_at,
            ]);

        $courses = Course::query()
            ->withCount([
                'materials',
                'materials as approved_materials_count' => fn ($query) => $query->where('approval_status', 'approved'),
            ])
            ->whereIn('id', $courseIds)
            ->orderBy('title')
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'name' => $course->title,
                'students' => Enrollment::query()
                    ->where('course_id', $course->id)
                    ->where('status', 'active')
                    ->count(),
                'weeklySchedule' => TutorCourseResolver::currentWeekScheduleLabel($user, $course->id),
            ]);

        return Inertia::render('Tutor/TutorMaterialUpload', [
            'user' => $user,
            'courses' => $courses,
            'tutorClasses' => $courses,
            'uploadedItems' => $materials,
            'stats' => [
                'total' => $materials->count(),
                'approved' => $materials->where('status', 'approved')->count(),
                'pending' => $materials->where('status', 'pending')->count(),
                'rejected' => $materials->where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $courseIds = $this->tutorCourseIds($request->user())->all();

        if ($courseIds === []) {
            throw ValidationException::withMessages([
                'course_id' => 'Tutor belum memiliki course yang ditugaskan.',
            ]);
        }

        $validated = $request->validate([
            'course_id' => ['required', 'integer', Rule::in($courseIds)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'youtube_url' => ['nullable', 'url', 'max:1024'],
            'module_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:51200'],
            'quiz_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:51200'],
        ]);

        if (
            blank($validated['youtube_url'] ?? null)
            && ! $request->hasFile('module_file')
            && ! $request->hasFile('quiz_file')
        ) {
            throw ValidationException::withMessages([
                'content' => 'Isi minimal satu konten: video YouTube, modul, atau bank soal.',
            ]);
        }

        $createdMaterials = [];

        if (filled($validated['youtube_url'] ?? null)) {
            $createdMaterials[] = $this->createMaterial($request, $validated, 'video', null, $validated['youtube_url']);
        }

        if ($request->hasFile('module_file')) {
            $storedFile = $this->storeMaterialFile($request->file('module_file'), 'materials/modules');
            $createdMaterials[] = $this->createMaterial(
                $request,
                $validated,
                'module',
                $storedFile['url'],
                $validated['description'] ?? null,
                $storedFile['disk'],
                $storedFile['path']
            );
        }

        if ($request->hasFile('quiz_file')) {
            $storedFile = $this->storeMaterialFile($request->file('quiz_file'), 'materials/quizzes');
            $createdMaterials[] = $this->createMaterial(
                $request,
                $validated,
                'quiz',
                $storedFile['url'],
                $validated['description'] ?? null,
                $storedFile['disk'],
                $storedFile['path']
            );
        }

        $this->notifyAdmins($request->user(), $createdMaterials);

        return redirect()->route('tutor.upload')->with('success', 'Materi berhasil dikirim untuk review admin.');
    }

    public function destroy(Request $request, Material $material): RedirectResponse
    {
        abort_unless($this->tutorCourseIds($request->user())->contains((int) $material->course_id), 403);

        if ($material->storage_disk && $material->file_path) {
            Storage::disk($material->storage_disk)->delete($material->file_path);
        } elseif ($material->file_url && str_starts_with($material->file_url, '/storage/')) {
            Storage::disk('public')->delete(substr($material->file_url, strlen('/storage/')));
        }

        $material->delete();

        return back()->with('success', 'Materi berhasil dihapus.');
    }

    public function announce(Request $request): RedirectResponse
    {
        $courseIds = $this->tutorCourseIds($request->user())->all();

        if ($courseIds === []) {
            throw ValidationException::withMessages([
                'course_id' => 'Tutor belum memiliki course yang ditugaskan.',
            ]);
        }

        $validated = $request->validate([
            'course_id' => ['required', 'integer', Rule::in($courseIds)],
            'title' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $course = Course::query()->find($validated['course_id']);
        $studentIds = Enrollment::query()
            ->where('course_id', $validated['course_id'])
            ->where('status', 'active')
            ->pluck('user_id')
            ->unique();

        foreach ($studentIds as $studentId) {
            Notification::create([
                'user_id' => $studentId,
                'title' => 'Pengumuman '.$request->user()->name.': '.$validated['title'],
                'message' => ($course?->title ? $course->title.' - ' : '').$validated['message'],
                'is_read' => false,
            ]);
        }

        return back()->with('success', 'Pengumuman berhasil dikirim ke '.$studentIds->count().' siswa.');
    }

    private function storeMaterialFile($file, string $directory): array
    {
        $disk = config('filesystems.materials_disk', 'public');
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $filename = Str::uuid().'-'.Str::slug($originalName ?: 'materi').'.'.$extension;
        $path = $file->storeAs($directory.'/'.now()->format('Y/m'), $filename, $disk);

        if (! $path) {
            throw ValidationException::withMessages([
                'content' => 'Upload gagal disimpan. Periksa konfigurasi storage.',
            ]);
        }

        return [
            'disk' => $disk,
            'path' => $path,
            'url' => Material::publicUrlFor($disk, $path),
        ];
    }

    private function createMaterial(
        Request $request,
        array $validated,
        string $type,
        ?string $fileUrl,
        ?string $content,
        ?string $storageDisk = null,
        ?string $filePath = null
    ): Material
    {
        return Material::withoutEvents(fn () => Material::create([
            'course_id' => $validated['course_id'],
            'uploaded_by' => $request->user()->id,
            'title' => $this->titleForType($validated['title'], $type),
            'type' => $type,
            'file_url' => $fileUrl,
            'storage_disk' => $storageDisk,
            'file_path' => $filePath,
            'content' => $content,
            'approval_status' => 'pending',
        ]));
    }

    private function notifyAdmins($tutor, array $materials): void
    {
        AdminNotifier::contentPendingUpload($tutor, $materials);
    }

    private function titleForType(string $title, string $type): string
    {
        return match ($type) {
            'module' => $title.' - Modul',
            'quiz' => $title.' - Bank Soal',
            default => $title,
        };
    }

    private function materialType(?string $type): string
    {
        return $type === 'bank_soal' ? 'quiz' : ($type ?? 'module');
    }

    private function tutorCourseIds($user)
    {
        return TutorCourseResolver::ids($user);
    }
}
