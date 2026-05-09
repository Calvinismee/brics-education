import '../css/index.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from './Components/ui/sonner.tsx';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const bricsRuntime = (globalThis.__bricsRuntime ??= {
    appRoot: null,
    toasterRoot: null,
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        if (!bricsRuntime.appRoot) {
            bricsRuntime.appRoot = createRoot(el);
        }

        bricsRuntime.appRoot.render(<App {...props} />);

        const toasterContainerId = 'brics-toaster-root';
        let toasterContainer = document.getElementById(toasterContainerId);

        if (!toasterContainer) {
            toasterContainer = document.createElement('div');
            toasterContainer.id = toasterContainerId;
            document.body.appendChild(toasterContainer);
        }

        if (!bricsRuntime.toasterRoot) {
            bricsRuntime.toasterRoot = createRoot(toasterContainer);
        }

        bricsRuntime.toasterRoot.render(
            <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                    style: {
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    },
                }}
            />,
        );
    },
    progress: {
        color: '#691D1B',
        showSpinner: false,
        delay: 180,
    },
});
