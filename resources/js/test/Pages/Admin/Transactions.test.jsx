import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Transactions from '@/Pages/Admin/Transactions';

const transactions = [
    {
        id: 'TRX-001',
        databaseId: 1,
        student: 'Alya Putri',
        course: 'Penalaran Umum',
        amount: 'Rp500.000',
        method: 'Transfer Bank',
        status: 'success',
        date: '2026-05-12 10:15:00',
    },
    {
        id: 'TRX-002',
        databaseId: 2,
        student: 'Bima Santoso',
        course: 'Pengetahuan Kuantitatif',
        amount: 'Rp750.000',
        method: 'QRIS',
        status: 'pending',
        date: '2026-05-13 09:00:00',
    },
    {
        id: 'TRX-003',
        databaseId: 3,
        student: 'Citra Lestari',
        course: 'Literasi Bahasa Indonesia',
        amount: 'Rp650.000',
        method: 'Virtual Account',
        status: 'failed',
        date: '2026-05-11 16:45:00',
    },
    {
        id: 'TRX-004',
        databaseId: 4,
        student: 'Danu Prakoso',
        course: 'Penalaran Matematika',
        amount: 'Rp450.000',
        method: 'Transfer Bank',
        status: 'success',
        date: '2026-05-10 13:20:00',
    },
];

function expectStat(label, value) {
    const card = screen.getByText(label).parentElement;

    expect(within(card).getByText(String(value))).toBeInTheDocument();
}

describe('Admin Transactions page', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('uses backend stats when they are provided', () => {
        render(
            <Transactions
                transactions={transactions}
                stats={{
                    successToday: 10,
                    pendingToday: 5,
                    failedToday: 2,
                }}
            />,
        );

        expectStat('Transaksi Berhasil', 10);
        expectStat('Menunggu Konfirmasi', 5);
        expectStat('Transaksi Gagal', 2);
    });

    it('falls back to counting statuses from the transaction list', () => {
        render(<Transactions transactions={transactions} />);

        expectStat('Transaksi Berhasil', 2);
        expectStat('Menunggu Konfirmasi', 1);
        expectStat('Transaksi Gagal', 1);
    });

    it('supports paginated transaction responses', () => {
        render(
            <Transactions
                transactions={{
                    data: transactions,
                    total: 12,
                    links: [],
                    last_page: 1,
                }}
            />,
        );

        expect(screen.getByText('Menampilkan 4 dari 12 transaksi')).toBeInTheDocument();
    });

    it('filters the visible rows by status', async () => {
        const user = userEvent.setup();

        render(<Transactions transactions={transactions} />);

        await user.click(screen.getByRole('button', { name: 'Pending' }));

        expect(screen.getByText('TRX-002')).toBeInTheDocument();
        expect(screen.queryByText('TRX-001')).not.toBeInTheDocument();
        expect(screen.queryByText('TRX-003')).not.toBeInTheDocument();
        expect(screen.queryByText('TRX-004')).not.toBeInTheDocument();
    });

    it('filters the visible rows by student search', async () => {
        const user = userEvent.setup();

        render(<Transactions transactions={transactions} />);

        await user.type(screen.getByPlaceholderText('Cari nama siswa...'), 'citra');

        expect(screen.getByText('TRX-003')).toBeInTheDocument();
        expect(screen.queryByText('TRX-001')).not.toBeInTheDocument();
        expect(screen.queryByText('TRX-002')).not.toBeInTheDocument();
    });

    it('renders unknown transaction statuses without crashing', () => {
        render(
            <Transactions
                transactions={[
                    {
                        ...transactions[0],
                        id: 'TRX-005',
                        databaseId: 5,
                        status: 'expired',
                    },
                ]}
            />,
        );

        expect(screen.getByText('expired')).toBeInTheDocument();
    });

    it('shows an empty state when no transaction matches the filters', async () => {
        const user = userEvent.setup();

        render(<Transactions transactions={transactions} />);

        await user.type(screen.getByPlaceholderText('Cari nama siswa...'), 'tidak ada');

        expect(screen.getByText('Tidak ada transaksi ditemukan.')).toBeInTheDocument();
        expect(screen.getByText('Menampilkan 0 dari 4 transaksi')).toBeInTheDocument();
    });
});
