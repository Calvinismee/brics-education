<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();

        $this->guardRemoteTestDatabase();

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function guardRemoteTestDatabase(): void
    {
        $connectionName = (string) config('database.default');
        $connection = config("database.connections.{$connectionName}", []);
        $host = strtolower((string) ($connection['host'] ?? ''));
        $searchPath = strtolower(trim((string) ($connection['search_path'] ?? 'public')));
        $isLocal = in_array($host, ['', '127.0.0.1', 'localhost'], true);
        $allowsRemoteRefresh = filter_var(
            env('TEST_DB_ALLOW_REMOTE_REFRESH', false),
            FILTER_VALIDATE_BOOL
        );

        if ($connectionName !== 'pgsql' || $isLocal) {
            return;
        }

        if ($searchPath !== 'testing' || ! $allowsRemoteRefresh) {
            throw new RuntimeException(
                'Remote database tests are blocked. Use DB_SEARCH_PATH=testing and TEST_DB_ALLOW_REMOTE_REFRESH=true so RefreshDatabase cannot reset the public schema.'
            );
        }
    }
}
