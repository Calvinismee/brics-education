<?php

namespace App\Support;

class TutorSettings
{
    public static function defaults(): array
    {
        return [
            'notifications' => [
                'materialReview' => true,
                'classReminder' => true,
                'studentQuestion' => true,
                'weeklyReport' => false,
            ],
            'teaching' => [
                'defaultSessionDuration' => 90,
                'autoPublishApprovedMaterial' => true,
                'showProgressWarnings' => true,
            ],
            'privacy' => [
                'showEmailToStudents' => false,
                'showRating' => true,
            ],
            'appearance' => [
                'theme' => 'system',
            ],
        ];
    }

    public static function forUser($user): array
    {
        $savedSettings = is_array($user?->tutor_settings ?? null)
            ? $user->tutor_settings
            : [];

        return array_replace_recursive(static::defaults(), $savedSettings);
    }
}
