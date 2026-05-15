import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Courses from '@/Pages/Admin/Courses';

const courses = [
    {
        id: 10,
        title: 'Penalaran Umum',
        description: 'Latihan penalaran UTBK',
        packages: [{ id: 1, name: 'Paket Dasar' }],
        students: [{ id: 1, name: 'Alya Putri', email: 'alya@example.test' }],
        mentors: [{ id: 2, name: 'Bima Tutor', email: 'bima@example.test' }],
        contents: [{ id: 100, title: 'Pengantar Penalaran Umum', tutor: 'Bima Tutor', submitted: '13 Mei 2026', status: 'approved' }],
        counts: { students: 1, mentors: 1, contents: 1 },
    },
    {
        id: 11,
        title: 'Literasi Bahasa Indonesia',
        description: '',
        packages: [],
        students: [],
        mentors: [],
        contents: [],
        counts: { students: 0, mentors: 0, contents: 0 },
    },
];

function expectStat(label, value) {
    const card = screen.getByText(label).closest('section');

    expect(within(card).getByText(String(value))).toBeInTheDocument();
}

describe('Admin Courses page', () => {
    it('renders course stats and related data', () => {
        render(<Courses courses={courses} stats={{ totalCourses: 2, totalEnrollments: 1, totalMentors: 1, totalContents: 1 }} />);

        expectStat('Total Course', 2);
        expectStat('Total Enrollment', 1);
        expect(screen.getByText('Penalaran Umum')).toBeInTheDocument();
        expect(screen.getByText('Paket Dasar')).toBeInTheDocument();
        expect(screen.getByText('Pengantar Penalaran Umum')).toBeInTheDocument();
        expect(screen.getByText('Belum ada mentor.')).toBeInTheDocument();
    });

    it('searches courses by mentor, package, and course text', async () => {
        const user = userEvent.setup();

        render(<Courses courses={courses} stats={{ totalCourses: 2 }} />);

        await user.type(screen.getByPlaceholderText('Cari course, siswa, mentor, atau paket...'), 'literasi');

        expect(screen.getByText('Literasi Bahasa Indonesia')).toBeInTheDocument();
        expect(screen.queryByText('Penalaran Umum')).not.toBeInTheDocument();

        await user.clear(screen.getByPlaceholderText('Cari course, siswa, mentor, atau paket...'));
        await user.type(screen.getByPlaceholderText('Cari course, siswa, mentor, atau paket...'), 'tidak ada');

        expect(screen.getByText('Tidak ada course ditemukan.')).toBeInTheDocument();
    });
});
