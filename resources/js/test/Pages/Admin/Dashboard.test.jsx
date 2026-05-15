import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Dashboard from '@/Pages/Admin/Dashboard';

const dashboardProps = {
    userStats: [
        { label: 'Total Pengguna', value: '120', change: '+12%' },
        { label: 'Pengguna Baru', value: '18', change: '+4%' },
        { label: 'Aktif Hari Ini', value: '42', change: '+6%' },
        { label: 'Nonaktif', value: '3', change: '-1%' },
    ],
    growthData: [10, 20, 30, 40, 50, 60],
    growthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    distributionData: [
        { label: 'Siswa', value: 90, pct: 75, color: '#691D1B' },
        { label: 'Tutor', value: 25, pct: 21, color: '#FFE882' },
        { label: 'Admin', value: 5, pct: 4, color: '#D8D7BE' },
    ],
    studentStats: [{ label: 'Aktif', value: 80 }],
    tutorStats: [{ label: 'Bertugas', value: 20 }],
    activityStats: [{ label: 'Login Hari Ini', value: 45 }],
    topUsers: [
        { id: 1, name: 'Alya Putri', role: 'Siswa', status: 'Aktif' },
        { id: 2, name: 'Bima Tutor', role: 'Tutor', status: 'Aktif' },
    ],
};

describe('Admin Dashboard page', () => {
    it('renders dashboard stats and user distribution data', () => {
        render(<Dashboard {...dashboardProps} />);

        expect(screen.getByText('Statistik Pengguna')).toBeInTheDocument();
        expect(screen.getByText('Total Pengguna')).toBeInTheDocument();
        expect(screen.getAllByText('120').length).toBeGreaterThan(0);
        expect(screen.getByText('Pertumbuhan Pengguna')).toBeInTheDocument();
        expect(screen.getByText('Distribusi Pengguna')).toBeInTheDocument();
        expect(screen.getByText('Bima Tutor')).toBeInTheDocument();
    });

    it('filters recent users by role', async () => {
        const user = userEvent.setup();

        render(<Dashboard {...dashboardProps} />);

        await user.selectOptions(screen.getByDisplayValue('All'), 'Tutor');

        expect(screen.getByText('Bima Tutor')).toBeInTheDocument();
        expect(screen.queryByText('Alya Putri')).not.toBeInTheDocument();
    });
});
