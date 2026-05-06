<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        $role = strtolower(trim((string) $this->getAttribute('role')));

        if ($role === 'admin') {
            return true;
        }

        $roleId = $this->getAttribute('role_id');

        if ($roleId === null) {
            return false;
        }

        static $cachedAdminRoleId = null;

        if ($cachedAdminRoleId === null) {
            $cachedAdminRoleId = DB::table('roles')->where('name', 'admin')->value('id');
        }

        return $cachedAdminRoleId !== null && (int) $roleId === (int) $cachedAdminRoleId;
    }
}
