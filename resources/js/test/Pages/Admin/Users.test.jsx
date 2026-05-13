import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Users from '@/Pages/Admin/Users';

const users = {
    data: [
        {
            id: 1,
            name: 'Alya Putri',
            email: 'alya@example.test',
            role: 'student',
            created_at: '2026-05-11T08:00:00',
            enrolledCourses: [{ id: 10, title: 'Penalaran Umum' }],
        },
        {
            id: 2,
            name: 'Bima Santoso',
            email: 'bima@example.test',
            role: 'tutor',
            created_at: '2026-05-12T08:00:00',
            taughtCourse: 'Pengetahuan Kuantitatif',
            mentor_course_id: 11,
        },
        {
            id: 3,
            name: 'Citra Admin',
            email: 'citra@example.test',
            role: 'admin',
            created_at: '2026-05-10T08:00:00',
        },
    ],
    links: [],
};

const courses = [
    { id: 10, title: 'Penalaran Umum' },
    { id: 11, title: 'Pengetahuan Kuantitatif' },
];

function expectStat(label, value) {
    const card = screen.getByText(label).parentElement;

    expect(within(card).getByText(String(value))).toBeInTheDocument();
}

describe('Admin Users page', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders user stats and rows from props', () => {
        render(<Users users={users} courses={courses} totalUsers={3} stats={{ student: 1, tutor: 1, admin: 1 }} />);

        expectStat('Total Siswa', 1);
        expectStat('Total Tutor', 1);
        expectStat('Total Admin', 1);
        expectStat('Total Pengguna', 3);
        expect(screen.getByText('Alya Putri')).toBeInTheDocument();
        expect(screen.getByText('Pengetahuan Kuantitatif')).toBeInTheDocument();
    });

    it('filters users by search and role', async () => {
        const user = userEvent.setup();

        render(<Users users={users} courses={courses} totalUsers={3} stats={{ student: 1, tutor: 1, admin: 1 }} />);

        await user.click(screen.getByRole('button', { name: 'Tutor' }));

        expect(screen.getByText('Bima Santoso')).toBeInTheDocument();
        expect(screen.queryByText('Alya Putri')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Semua' }));
        await user.type(screen.getByPlaceholderText('Cari pengguna...'), 'citra');

        expect(screen.getByText('Citra Admin')).toBeInTheDocument();
        expect(screen.queryByText('Bima Santoso')).not.toBeInTheDocument();
    });

    it('opens the create form and reveals tutor course assignment', async () => {
        const user = userEvent.setup();

        render(<Users users={users} courses={courses} totalUsers={3} stats={{ student: 1, tutor: 1, admin: 1 }} />);

        await user.click(screen.getByRole('button', { name: /Tambah Pengguna/i }));
        await user.selectOptions(screen.getByLabelText('Peran'), 'tutor');

        expect(screen.getByRole('heading', { name: 'Tambah Pengguna' })).toBeInTheDocument();
        expect(screen.getByLabelText('Course yang Diajar')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Pengetahuan Kuantitatif' })).toBeInTheDocument();
    });

    it('shows selected user count when a row is checked', async () => {
        const user = userEvent.setup();

        render(<Users users={users} courses={courses} totalUsers={3} stats={{ student: 1, tutor: 1, admin: 1 }} />);

        await user.click(screen.getAllByRole('checkbox')[0]);

        expect(screen.getByText('1 dipilih')).toBeInTheDocument();
    });
});
