import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TransactionStats from '@/Pages/Admin/TransactionStats';

const summary = {
    totalRevenue: 10000000,
    averageTransaction: 2500000,
    monthlyRevenue: [
        { period: 'Apr', amount: 4000000 },
        { period: 'Mei', amount: 6000000 },
    ],
};

const paymentMethods = [
    { method: 'Transfer Bank', pct: 60, amount: 6000000 },
    { method: 'QRIS', pct: 40, amount: 4000000 },
];

const recentTransactions = [
    {
        id: 'TRX-001',
        student: 'Alya Putri',
        course: 'Penalaran Umum',
        amount: 500000,
        method: 'Transfer Bank',
        status: 'success',
        date: '13 Mei 2026',
    },
    {
        id: 'TRX-002',
        student: 'Bima Santoso',
        course: 'Pengetahuan Kuantitatif',
        amount: 750000,
        method: 'QRIS',
        status: 'expired',
        date: '12 Mei 2026',
    },
];

function expectCard(label, value) {
    const card = screen.getByText(label).parentElement;

    expect(within(card).getByText((content) => {
        return content.replace(/\s/g, '') === value.replace(/\s/g, '');
    })).toBeInTheDocument();
}

describe('Admin TransactionStats page', () => {
    it('renders summary cards, chart data, and payment methods', () => {
        render(<TransactionStats summary={summary} paymentMethods={paymentMethods} recentTransactions={recentTransactions} />);

        expectCard('Total Pendapatan', 'Rp10.000.000');
        expectCard('Rata-rata Transaksi/Bulan', 'Rp2.500.000');
        expect(screen.queryByText('Tingkat Keberhasilan')).not.toBeInTheDocument();
        expect(screen.queryByText('Pertumbuhan')).not.toBeInTheDocument();
        expect(screen.getByText('Pendapatan Bulanan')).toBeInTheDocument();
        expect(screen.getAllByText('Transfer Bank').length).toBeGreaterThan(0);
        expect(screen.getAllByText('QRIS').length).toBeGreaterThan(0);
    });

    it('renders recent transactions and labels expired statuses', () => {
        render(<TransactionStats summary={summary} paymentMethods={paymentMethods} recentTransactions={recentTransactions} />);

        expect(screen.getByText('TRX-001')).toBeInTheDocument();
        expect(screen.getByText('Alya Putri')).toBeInTheDocument();
        expect(screen.getByText('Berhasil')).toBeInTheDocument();
        expect(screen.getByText('TRX-002')).toBeInTheDocument();
        expect(screen.getByText('Kedaluwarsa')).toBeInTheDocument();
    });
});
