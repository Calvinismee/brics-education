import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => ({
    ...(mode === 'test'
        ? {
            esbuild: {
                jsx: 'automatic',
            },
        }
        : {}),

    resolve: {
        alias: {
            '@': fileURLToPath(
                new URL('./resources/js', import.meta.url)
            ),
        },
    },

    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: 'resources/js/test/setup.jsx',
    },
}));