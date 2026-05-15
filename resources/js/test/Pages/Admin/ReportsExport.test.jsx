import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { router } from '@inertiajs/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReportsExport from '@/Pages/Admin/ReportsExport';

const reports = [
    {
        id: 1,
        title: 'Export Transaksi Mei',
        type: 'transactions',
        createdBy: 'Admin Tester',
        rowCount: 24,
        createdAt: '13 Mei 2026',
    },
];

describe('Admin ReportsExport page', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders report shortcuts and export history', () => {
        render(<ReportsExport reports={reports} stats={{ availableReports: 3, lastExport: '13 Mei 2026' }} />);

        expect(screen.getByText('Laporan tersedia')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Export terakhir')).toBeInTheDocument();
        expect(screen.getAllByText('13 Mei 2026').length).toBeGreaterThan(0);
        expect(screen.getByText('Laporan Transaksi')).toBeInTheDocument();
        expect(screen.getByText('Export Transaksi Mei')).toBeInTheDocument();
    });

    it('applies date filters through Inertia router', async () => {
        const user = userEvent.setup();

        render(<ReportsExport reports={reports} />);

        await user.type(screen.getByTitle('Dari tanggal'), '2026-05-01');
        await user.type(screen.getByTitle('Sampai tanggal'), '2026-05-13');
        await user.click(screen.getByRole('button', { name: /Filter/i }));

        expect(router.get).toHaveBeenCalledWith('/admin/reports/export', {
            dateFrom: '2026-05-01',
            dateTo: '2026-05-13',
        }, {
            preserveScroll: true,
            replace: true,
        });
    });

    it('shows reset when filters are active', async () => {
        const user = userEvent.setup();

        render(<ReportsExport reports={[]} filters={{ dateFrom: '2026-05-01' }} />);

        expect(screen.getByText('Belum ada riwayat export.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Reset/i }));

        expect(router.get).toHaveBeenCalledWith('/admin/reports/export', {}, {
            preserveScroll: true,
            replace: true,
        });
    });
});
