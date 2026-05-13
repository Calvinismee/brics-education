import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Schedule from '@/Pages/Admin/Schedule';

const scheduleDate = new Date();
const scheduleDateKey = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-15`;

const schedules = [
    {
        id: 1,
        course_id: 10,
        tutor_id: 2,
        course: 'Penalaran Umum',
        tutor: 'Bima Tutor',
        day: 'Jumat',
        schedule_date: scheduleDateKey,
        start_time: '08:00',
        end_time: '10:00',
        time: '08:00 - 10:00',
        meeting_link: 'https://zoom.test/penalaran-umum',
    },
];

function expectStat(label, value) {
    const card = screen.getByText(label).closest('div.rounded-2xl');

    expect(within(card).getByText(String(value))).toBeInTheDocument();
}

describe('Admin Schedule page', () => {
    it('renders schedule stats and list rows', () => {
        render(<Schedule schedules={schedules} tutors={[{ id: 2, name: 'Bima Tutor' }]} courses={[{ id: 10, title: 'Penalaran Umum' }]} />);

        expectStat('Total Kelas', 1);
        expectStat('Tutor Aktif', 1);
        expect(screen.getByText('Penalaran Umum')).toBeInTheDocument();
        expect(screen.getByText('Bima Tutor')).toBeInTheDocument();
        expect(screen.getByText('https://zoom.test/penalaran-umum')).toBeInTheDocument();
    });

    it('switches to calendar view and shows schedule items in the month grid', async () => {
        const user = userEvent.setup();

        render(<Schedule schedules={schedules} tutors={[{ id: 2, name: 'Bima Tutor' }]} courses={[{ id: 10, title: 'Penalaran Umum' }]} />);

        await user.click(screen.getByRole('button', { name: 'Kalender' }));

        expect(screen.getByText('Sen')).toBeInTheDocument();
        expect(screen.getByText('Jum')).toBeInTheDocument();
        expect(screen.getByText('Penalaran Umum')).toBeInTheDocument();
    });

    it('opens create form with course and tutor choices', async () => {
        const user = userEvent.setup();

        render(<Schedule schedules={schedules} tutors={[{ id: 2, name: 'Bima Tutor' }]} courses={[{ id: 10, title: 'Penalaran Umum' }]} />);

        await user.click(screen.getByRole('button', { name: /Tambah Kelas/i }));

        expect(screen.getByText('Tambah Jadwal Kelas')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Penalaran Umum' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Bima Tutor' })).toBeInTheDocument();
    });
});
