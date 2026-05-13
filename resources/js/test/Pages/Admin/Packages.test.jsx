import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Packages from '@/Pages/Admin/Packages';

const packages = [
    {
        id: 1,
        name: 'Paket Dasar',
        price: 250000,
        description: 'Belajar mandiri',
        popular: false,
        features: ['Akses video'],
        courses: [{ id: 10, title: 'Penalaran Umum' }],
    },
    {
        id: 2,
        name: 'Paket Intensif',
        price: '750000',
        description: 'Belajar dengan tutor',
        popular: true,
        features: ['Live class', 'Sertifikat'],
        courses: [],
    },
];

const courses = [
    { id: 10, title: 'Penalaran Umum' },
    { id: 11, title: 'Pengetahuan Kuantitatif' },
];

function expectStat(label, value) {
    const card = screen.getByText(label).parentElement;

    expect(within(card).getByText(String(value))).toBeInTheDocument();
}

describe('Admin Packages page', () => {
    it('renders package stats, price formatting, and popular badge', () => {
        render(<Packages packages={packages} courses={courses} />);

        expectStat('Total Paket', 2);
        expectStat('Paket Populer', 1);
        expect(screen.getByText('Paket Intensif')).toBeInTheDocument();
        expect(screen.getByText('Paling Populer')).toBeInTheDocument();
        expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
        expect(screen.getByText('Belum ada course dipilih.')).toBeInTheDocument();
    });

    it('opens create form and adds a local feature chip', async () => {
        const user = userEvent.setup();

        render(<Packages packages={packages} courses={courses} />);

        await user.click(screen.getByRole('button', { name: /Tambah Paket/i }));
        await user.type(screen.getByPlaceholderText('Tambahkan fitur'), 'Konsultasi mentor');
        await user.click(screen.getByRole('button', { name: 'Tambah' }));

        expect(screen.getByText('Tambah Paket Baru')).toBeInTheDocument();
        expect(screen.getByText('Konsultasi mentor')).toBeInTheDocument();
        expect(screen.getByLabelText('Tandai sebagai paling populer')).toBeInTheDocument();
    });

    it('opens edit form with package data', async () => {
        const user = userEvent.setup();

        render(<Packages packages={packages} courses={courses} />);

        await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

        expect(screen.getByText('Edit Paket')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Paket Dasar')).toBeInTheDocument();
        expect(screen.getByDisplayValue('250.000')).toBeInTheDocument();
    });
});
