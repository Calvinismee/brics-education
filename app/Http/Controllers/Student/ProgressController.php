<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ProgressRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgressController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $rows = ProgressRecord::where('user_id', $user->id)
            ->select('course_id', DB::raw('MAX(percent) as percent'))
            ->groupBy('course_id')
            ->get()
            ->map(fn($r) => [
                'course_id' => (int) $r->course_id,
                'percent' => (int) $r->percent,
            ]);

        return response()->json(['courses' => $rows]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'course_id' => 'required|integer',
            'material_id' => 'nullable|integer',
            'percent' => 'nullable|integer|min:0|max:100',
            'status' => 'nullable|string',
        ]);

        $record = ProgressRecord::updateOrCreate(
            [
                'user_id' => $user->id,
                'course_id' => $validated['course_id'],
                'material_id' => $validated['material_id'] ?? null,
            ],
            [
                'percent' => $validated['percent'] ?? 0,
                'status' => $validated['status'] ?? 'started',
            ]
        );

        return response()->json($record, 201);
    }
}
