<?php

namespace App\Support;

class TutorSettings
{
    public static function defaults(): array
    {
        return [
            'notifications' => [
                'classReminder' => true,
            ],
            'teaching' => [
                'showProgressWarnings' => true,
            ],
        ];
    }

    public static function forUser($user): array
    {
        $savedSettings = is_array($user?->tutor_settings ?? null)
            ? $user->tutor_settings
            : [];
        $settings = array_replace_recursive(static::defaults(), $savedSettings);

        return [
            'notifications' => [
                'classReminder' => (bool) $settings['notifications']['classReminder'],
            ],
            'teaching' => [
                'showProgressWarnings' => (bool) $settings['teaching']['showProgressWarnings'],
            ],
        ];
    }
}
