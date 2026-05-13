import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TransactionDetail from '@/Pages/Admin/TransactionDetail';

const transaction = {
    id: 7,
    invoiceNumber: 'INV-2026-0007',
    package: 'Paket Intensif',
    amountFormatted: 'Rp750.000',
    method: 'QRIS',
    status: 'unknown',
    rawStatus: 'gateway_timeout',
    gatewayReference: 'MID-123',
    enrollmentStatus: 'pending',
    paidAt: '-',
    createdAt: '13 Mei 2026',
    updatedAt: '13 Mei 2026',
    student: 'Alya Putri',
    studentEmail: 'alya@example.test',
    course: 'Penalaran Umum',
    courseDescription: 'Latihan penalaran UTBK',
};

describe('Admin TransactionDetail page', () => {
    it('renders transaction detail rows and fallback status', () => {
        render(<TransactionDetail transaction={transaction} />);

        expect(screen.getByRole('link', { name: /Kembali/i })).toHaveAttribute('href', '/admin/transactions');
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getAllByText('INV-2026-0007')).toHaveLength(2);
        expect(screen.getAllByText('Rp750.000')).toHaveLength(2);
        expect(screen.getByText('Alya Putri')).toBeInTheDocument();
        expect(screen.getByText('alya@example.test')).toBeInTheDocument();
        expect(screen.getByText('gateway_timeout')).toBeInTheDocument();
        expect(screen.getAllByText('MID-123')).toHaveLength(2);
    });
});
