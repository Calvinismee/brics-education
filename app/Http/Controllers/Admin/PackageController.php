<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::query()
            ->orderByDesc('popular')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Packages', [
            'packages' => $packages,
            'stats' => [
                'totalPackages' => $packages->count(),
                'activePackages' => $packages->where('popular', true)->count(),
                'revenue' => $packages->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'popular' => ['boolean'],
        ]);

        Package::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'features' => $validated['features'] ?? [],
            'popular' => (bool) ($validated['popular'] ?? false),
        ]);

        return redirect()->route('admin.packages')->with('success', 'Paket berhasil ditambahkan.');
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'popular' => ['boolean'],
        ]);

        $package->update([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'features' => $validated['features'] ?? [],
            'popular' => (bool) ($validated['popular'] ?? false),
        ]);

        return redirect()->route('admin.packages')->with('success', 'Paket berhasil diperbarui.');
    }

    public function destroy(Package $package): RedirectResponse
    {
        $package->delete();

        return redirect()->route('admin.packages')->with('success', 'Paket berhasil dihapus.');
    }
}
