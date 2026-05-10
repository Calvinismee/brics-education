<?php

use Inertia\Testing\AssertableInertia as Assert;

test('TC_ADMIN_DASH_001 dashboard admin menampilkan ringkasan sistem', function () {
    // Dokumentasi: admin membuka dashboard; expected komponen dashboard dan ringkasan statistik tersedia.
    $admin = adminUser();
    studentUser();
    tutorUser();

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('userStats')
            ->has('studentStats')
            ->has('tutorStats')
            ->has('activityStats')
            ->has('distributionData'));
});

test('TC_ADMIN_ROLE_001 admin dapat mengakses seluruh menu manajemen yang tersedia', function () {
    // Dokumentasi: admin membuka route manajemen yang sudah ada; expected seluruh route merespons OK.
    $admin = adminUser();
    transactionRecord();
    materialRecord();

    foreach ([
        'admin.users',
        'admin.packages',
        'admin.content',
        'admin.transactions',
        'admin.transaction-stats',
        'admin.schedule',
        'admin.reports.export',
        'admin.settings',
    ] as $routeName) {
        $this->actingAs($admin)
            ->get(route($routeName))
            ->assertOk();
    }
});

test('admin middleware menolak user non-admin mengakses menu admin', function () {
    // Dokumentasi tambahan: student mencoba membuka dashboard admin; expected diarahkan ke beranda dengan pesan error.
    $student = studentUser();

    $this->actingAs($student)
        ->get(route('admin.dashboard'))
        ->assertRedirect('/')
        ->assertSessionHas('error', 'Unauthorized access');
});
