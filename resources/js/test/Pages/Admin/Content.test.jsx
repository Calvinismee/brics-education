import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { router } from '@inertiajs/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Content from '@/Pages/Admin/Content';

const contents = [
    {
        id: 100,
        title: 'Pengantar Penalaran Umum',
        tutor: 'Bima Tutor',
        course: 'Penalaran Umum',
        course_id: 10,
        type: 'video',
        size: '24 MB',
        submitted: '13 Mei 2026',
        status: 'pending',
        content: '<p>Isi <strong>konten</strong> penalaran umum.</p>',
        file_url: 'https://files.test/penalaran-umum.mp4',
    },
    {
        id: 101,
        title: 'Modul Literasi Bahasa Indonesia',
        tutor: 'Citra Tutor',
        course: 'Literasi Bahasa Indonesia',
        course_id: 11,
        type: 'module',
        size: '2 MB',
        submitted: '12 Mei 2026',
        status: 'approved',
        content: 'Materi literasi UTBK',
    },
    {
        id: 102,
        title: 'Bank Soal Literasi',
        tutor: 'Danu Tutor',
        course: 'Literasi Bahasa Indonesia',
        course_id: 11,
        type: 'bank_soal',
        size: '1 MB',
        submitted: '11 Mei 2026',
        status: 'rejected',
        rejection_comment: 'Perlu perbaikan pembahasan.',
    },
];

const courses = [
    { id: 10, title: 'Penalaran Umum', contentCount: 1 },
    { id: 11, title: 'Literasi Bahasa Indonesia', contentCount: 2 },
];

function expectStat(label, value) {
    const card = screen.getByText(label).parentElement;

    expect(within(card).getByText(String(value))).toBeInTheDocument();
}

describe('Admin Content page', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders content stats and groups content by course', () => {
        render(<Content contents={contents} courses={courses} />);

        expectStat('Total Konten', 3);
        expectStat('Menunggu Review', 1);
        expectStat('Dipublikasikan', 1);
        expect(screen.getAllByText('Penalaran Umum').length).toBeGreaterThan(0);
        expect(screen.getByText('Pengantar Penalaran Umum')).toBeInTheDocument();
        expect(screen.getByText('Perlu perbaikan pembahasan.')).toBeInTheDocument();
    });

    it('filters by status, course, and search text', async () => {
        const user = userEvent.setup();

        render(<Content contents={contents} courses={courses} />);

        await user.click(screen.getByRole('button', { name: /Menunggu 1/i }));

        expect(screen.getByText('Pengantar Penalaran Umum')).toBeInTheDocument();
        expect(screen.queryByText('Modul Literasi Bahasa Indonesia')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Semua 3/i }));
        await user.click(screen.getByRole('button', { name: /Literasi Bahasa Indonesia/i }));

        expect(screen.getByText('Modul Literasi Bahasa Indonesia')).toBeInTheDocument();
        expect(screen.queryByText('Pengantar Penalaran Umum')).not.toBeInTheDocument();

        await user.type(screen.getByPlaceholderText('Cari konten...'), 'bank soal');

        expect(screen.getByText('Bank Soal Literasi')).toBeInTheDocument();
        expect(screen.queryByText('Modul Literasi Bahasa Indonesia')).not.toBeInTheDocument();
    });

    it('opens detail modal and strips HTML from content preview', async () => {
        const user = userEvent.setup();

        render(<Content contents={contents} courses={courses} />);

        await user.click(screen.getAllByTitle('Lihat konten')[0]);

        expect(screen.getByRole('heading', { name: 'Pengantar Penalaran Umum' })).toBeInTheDocument();
        expect(screen.getByText('Isi konten penalaran umum.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Buka file/i })).toHaveAttribute('href', 'https://files.test/penalaran-umum.mp4');
    });

    it('embeds youtube video links in the detail modal', async () => {
        const user = userEvent.setup();
        const youtubeContent = [{
            ...contents[0],
            id: 200,
            title: 'Video YouTube UTBK',
            content: 'https://youtu.be/abc123XYZ89',
            file_url: null,
        }];

        render(<Content contents={youtubeContent} courses={courses} />);

        await user.click(screen.getByTitle('Lihat konten'));

        expect(screen.getByTitle('Video Video YouTube UTBK')).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123XYZ89');
        expect(screen.getByRole('link', { name: /Buka video/i })).toHaveAttribute('href', 'https://youtu.be/abc123XYZ89');
    });

    it('posts approve and reject actions', async () => {
        const user = userEvent.setup();

        render(<Content contents={contents} courses={courses} />);

        await user.click(screen.getByTitle('Setujui konten'));

        expect(router.post).toHaveBeenCalledWith('/admin/content/approve/100', {}, expect.objectContaining({
            preserveScroll: true,
        }));

        await user.click(screen.getByTitle('Tolak konten'));
        await user.type(screen.getByPlaceholderText('Tuliskan catatan untuk tutor'), 'Audio kurang jelas');
        await user.click(screen.getByRole('button', { name: 'Ya, tolak konten' }));

        expect(router.post).toHaveBeenCalledWith('/admin/content/reject/100', {
            comment: 'Audio kurang jelas',
        }, expect.objectContaining({
            preserveScroll: true,
        }));
    });
});
