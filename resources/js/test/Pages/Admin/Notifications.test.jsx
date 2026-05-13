import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { router } from '@inertiajs/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Notifications from '@/Pages/Admin/Notifications';

const notifications = [
    {
        id: 1,
        title: 'Transaksi Baru',
        message: 'Ada pembayaran baru menunggu review.',
        is_read: false,
        created_at: '2026-05-13T09:00:00',
    },
    {
        id: 2,
        title: 'Konten Disetujui',
        message: 'Materi UTBK sudah disetujui.',
        is_read: true,
        created_at: '2026-05-12T09:00:00',
    },
];

describe('Admin Notifications page', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders notification counts and unread action', () => {
        render(<Notifications notifications={notifications} stats={{ totalNotifications: 2, unreadCount: 1 }} />);

        expect(screen.getByText('Total 2 notifikasi (1 belum dibaca)')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tandai Semua Dibaca' })).toBeInTheDocument();
        expect(screen.getByText('Transaksi Baru')).toBeInTheDocument();
        expect(screen.getByText('Konten Disetujui')).toBeInTheDocument();
    });

    it('filters read and unread notifications', async () => {
        const user = userEvent.setup();

        render(<Notifications notifications={notifications} stats={{ totalNotifications: 2, unreadCount: 1 }} />);

        await user.click(screen.getByRole('button', { name: 'Sudah Dibaca' }));

        expect(screen.getByText('Konten Disetujui')).toBeInTheDocument();
        expect(screen.queryByText('Transaksi Baru')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Belum Dibaca' }));

        expect(screen.getByText('Transaksi Baru')).toBeInTheDocument();
        expect(screen.queryByText('Konten Disetujui')).not.toBeInTheDocument();
    });

    it('posts mark as read actions', async () => {
        const user = userEvent.setup();

        render(<Notifications notifications={notifications} stats={{ totalNotifications: 2, unreadCount: 1 }} />);

        await user.click(screen.getByRole('button', { name: 'Baca' }));

        expect(router.post).toHaveBeenCalledWith('/admin/notifications/mark-as-read/1', {}, expect.objectContaining({
            preserveScroll: true,
        }));
    });
});
