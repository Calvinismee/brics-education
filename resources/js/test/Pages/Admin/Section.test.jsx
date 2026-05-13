import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Section from '@/Pages/Admin/Section';

describe('Admin Section scaffold page', () => {
    it('renders scaffold information and navigation links', () => {
        render(
            <Section
                title="Users"
                description="Kelola pengguna platform."
                focus="CRUD pengguna dan role."
            />,
        );

        expect(screen.getByText('Scaffolded admin section')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
        expect(screen.getByText('CRUD pengguna dan role.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/admin/dashboard');
        expect(screen.getByRole('link', { name: 'Open users' })).toHaveAttribute('href', '/admin/users');
    });
});
