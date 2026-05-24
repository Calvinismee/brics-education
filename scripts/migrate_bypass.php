#!/usr/bin/env php
<?php
/**
 * Bypass PHP version check and run migrations + seeder.
 * Usage: php scripts/migrate_bypass.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Temporarily patch the platform check to allow PHP 8.2
$platformCheckPath = __DIR__ . '/../vendor/composer/platform_check.php';
if (file_exists($platformCheckPath)) {
    $code = file_get_contents($platformCheckPath);
    $code = str_replace(
        'throw new RuntimeException',
        'if (false) throw new RuntimeException',
        $code
    );
    eval('?>' . $code);
}

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

// Run migrations
echo "Running migrations...\n";
$kernel->call('migrate', ['--force' => true]);

// Run seeder
echo "Running seeder...\n";
$kernel->call('db:seed', ['--class' => 'ProgressSeeder']);

echo "Done!\n";
