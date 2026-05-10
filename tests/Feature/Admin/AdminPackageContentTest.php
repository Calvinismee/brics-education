<?php

use Illuminate\Support\Facades\DB;

test('TC_ADMIN_COURSE_001 admin berhasil menambah course atau paket', function () {
    // Dokumentasi: admin POST paket baru; expected paket tersimpan dan tampil sebagai data admin packages.
    $admin = adminUser();

    $response = $this->actingAs($admin)->post(route('admin.packages.store'), [
        'name' => 'Paket SNBT',
        'price' => '15000',
        'description' => 'Paket latihan SNBT.',
        'features' => ['Tryout', 'Pembahasan'],
        'popular' => true,
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.packages', absolute: false));

    $this->assertDatabaseHas('packages', [
        'name' => 'Paket SNBT',
        'price' => '15000',
        'popular' => true,
    ]);
});

test('TC_ADMIN_COURSE_003 admin berhasil mengubah data course atau paket', function () {
    // Dokumentasi: admin PUT perubahan harga/deskripsi paket; expected data paket terbarui.
    $admin = adminUser();
    $package = packageRecord([
        'name' => 'Paket SNBT',
        'price' => '15000',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.packages.update', $package), [
        'name' => 'Paket SNBT Plus',
        'price' => '20000',
        'description' => 'Paket SNBT dengan pembahasan tambahan.',
        'features' => ['Tryout', 'Pembahasan', 'Konsultasi'],
        'popular' => false,
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.packages', absolute: false));

    $this->assertDatabaseHas('packages', [
        'id' => $package->id,
        'name' => 'Paket SNBT Plus',
        'price' => '20000',
    ]);
});

test('TC_ADMIN_MATERI_001 admin dapat melihat materi yang diunggah tutor', function () {
    // Dokumentasi: admin membuka halaman validasi konten; expected materi unggahan tutor tampil sebagai data review.
    $admin = adminUser();
    $course = courseRecord(['title' => 'Paket SNBT']);
    $tutor = tutorUser(['name' => 'Fajar Tutor']);
    materialRecord([
        'course' => $course,
        'tutor' => $tutor,
        'title' => 'Materi TPS',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.content'));

    $response
        ->assertSessionHasNoErrors()
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Content')
            ->has('contents.data', 1)
            ->where('contents.data.0.title', 'Materi TPS')
            ->where('contents.data.0.tutor', 'Fajar Tutor')
            ->where('contents.data.0.status', 'pending'));
});

test('TC_ADMIN_MATERI_002 admin berhasil menyetujui materi unggahan tutor', function () {
    // Dokumentasi: admin POST approve materi pending; expected status menjadi approved, reviewer tercatat, komentar penolakan dibersihkan.
    $admin = adminUser();
    $material = materialRecord([
        'approval_status' => 'rejected',
        'rejection_comment' => 'Perlu perbaikan contoh soal.',
    ]);

    $response = $this->actingAs($admin)->post(route('admin.content.approve', $material['id']));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.content', absolute: false));

    $this->assertDatabaseHas('materials', [
        'id' => $material['id'],
        'approval_status' => 'approved',
        'approved_by' => $admin->id,
        'rejection_comment' => null,
    ]);
});

test('TC_ADMIN_MATERI_004 admin berhasil menolak materi dengan komentar', function () {
    // Dokumentasi: admin POST reject materi pending dengan komentar; expected status menjadi rejected dan komentar tersimpan untuk tutor.
    $admin = adminUser();
    $material = materialRecord(['approval_status' => 'pending']);

    $response = $this->actingAs($admin)->post(route('admin.content.reject', $material['id']), [
        'comment' => 'Mohon tambahkan referensi sumber dan perbaiki urutan materi.',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.content', absolute: false));

    $this->assertDatabaseHas('materials', [
        'id' => $material['id'],
        'approval_status' => 'rejected',
        'approved_by' => null,
        'approved_at' => null,
        'rejection_comment' => 'Mohon tambahkan referensi sumber dan perbaiki urutan materi.',
    ]);
});

test('TC_ADMIN_MATERI_005 admin tidak dapat membuat mengedit atau menghapus materi', function () {
    // Dokumentasi: admin hanya boleh review materi dari tutor; expected endpoint store/update/delete materi mengembalikan forbidden.
    $admin = adminUser();
    $material = materialRecord();
    $beforeCount = DB::table('materials')->count();

    $this->actingAs($admin)->post(route('admin.content.store'), [
        'title' => 'Materi Baru Admin',
        'type' => 'module',
        'course_id' => $material['course_id'],
        'tutor_id' => $material['uploaded_by'],
        'content' => '<p>Materi.</p>',
        'status' => 'pending',
    ])->assertForbidden();

    $this->actingAs($admin)->put(route('admin.content.update', $material['id']), [
        'title' => 'Materi Diubah Admin',
        'type' => 'module',
        'course_id' => $material['course_id'],
        'tutor_id' => $material['uploaded_by'],
        'content' => '<p>Materi diubah.</p>',
        'status' => 'approved',
    ])->assertForbidden();

    $this->actingAs($admin)
        ->delete(route('admin.content.destroy', $material['id']))
        ->assertForbidden();

    expect(DB::table('materials')->count())->toBe($beforeCount);

    $this->assertDatabaseHas('materials', [
        'id' => $material['id'],
        'title' => $material['title'],
        'approval_status' => 'pending',
    ]);
});
