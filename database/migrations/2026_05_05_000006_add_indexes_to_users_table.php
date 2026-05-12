<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $studentRoleId = $this->ensureRole('student');
        $this->ensureRole('mentor');
        $this->ensureRole('admin');

        if (! Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) use ($studentRoleId) {
                $table->foreignId('role_id')
                    ->default($studentRoleId)
                    ->after('id')
                    ->constrained('roles');
            });

            $this->syncRoleIdsFromLegacyRoleColumn($studentRoleId);
        }

        if (Schema::hasColumn('users', 'role')) {
            Schema::whenTableDoesntHaveIndex('users', ['role'], function (Blueprint $table) {
                $table->index('role');
            });
        }

        if (Schema::hasColumn('users', 'role_id')) {
            Schema::whenTableDoesntHaveIndex('users', ['role_id'], function (Blueprint $table) {
                $table->index('role_id');
            });
        }

        if (Schema::hasColumn('users', 'email') && ! Schema::hasIndex('users', ['email'])) {
            Schema::table('users', function (Blueprint $table) {
                $table->index('email');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::whenTableHasIndex('users', 'users_role_index', function (Blueprint $table) {
            $table->dropIndex('users_role_index');
        });

        Schema::whenTableHasIndex('users', 'users_role_id_index', function (Blueprint $table) {
            $table->dropIndex('users_role_id_index');
        });

        Schema::whenTableHasIndex('users', 'users_email_index', function (Blueprint $table) {
            $table->dropIndex('users_email_index');
        });
    }

    private function ensureRole(string $name): int
    {
        $roleId = DB::table('roles')->where('name', $name)->value('id');

        if ($roleId !== null) {
            return (int) $roleId;
        }

        $values = [
            'name' => $name,
        ];

        if (Schema::hasColumn('roles', 'created_at')) {
            $values['created_at'] = now();
        }

        if (Schema::hasColumn('roles', 'updated_at')) {
            $values['updated_at'] = now();
        }

        return (int) DB::table('roles')->insertGetId($values);
    }

    private function syncRoleIdsFromLegacyRoleColumn(int $defaultRoleId): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            DB::table('users')
                ->whereNull('role_id')
                ->update(['role_id' => $defaultRoleId]);

            return;
        }

        $roles = DB::table('roles')->pluck('id', 'name');

        foreach ($roles as $roleName => $roleId) {
            DB::table('users')
                ->where('role', $roleName)
                ->update(['role_id' => $roleId]);
        }

        DB::table('users')
            ->whereNull('role_id')
            ->update(['role_id' => $defaultRoleId]);
    }
};
