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
            ->select('id', 'name', 'price', 'description', 'features', 'popular')
            ->orderByDesc('popular')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $totalPackages = Package::count();
        $popularPackages = Package::where('popular', true)->count();
        $revenue = (float) Package::query()->selectRaw('COALESCE(SUM(price::numeric), 0) as revenue')->value('revenue');

        return Inertia::render('Admin/Packages', [
            'packages' => $packages,
            'stats' => [
                'totalPackages' => $totalPackages,
                'activePackages' => $popularPackages,
                'revenue' => $revenue,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
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
            'price' => ['required', 'numeric', 'min:0'],
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
