import '../css/index.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { BricsPageLoader } from './Components/ui/LoadingStates.jsx';
import { Toaster } from './Components/ui/sonner.tsx';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const bricsRuntime = (globalThis.__bricsRuntime ??= {
    appRoot: null,
    loadingRoot: null,
    toasterRoot: null,
    routerBound: false,
});

function mountLoadingRoot() {
    if (typeof document === 'undefined') {
        return null;
    }

    let container = document.getElementById('brics-loading-root');

    if (!container) {
        container = document.createElement('div');
        container.id = 'brics-loading-root';
        document.body.appendChild(container);
    }

    if (!bricsRuntime.loadingRoot) {
        bricsRuntime.loadingRoot = createRoot(container);
    }

    return bricsRuntime.loadingRoot;
}

function showLoadingOverlay(message = 'Memuat halaman...') {
    const root = mountLoadingRoot();

    if (!root) {
        return;
    }

    root.render(<BricsPageLoader message={message} />);
}

function hideLoadingOverlay() {
    if (bricsRuntime.loadingRoot) {
        bricsRuntime.loadingRoot.render(null);
    }
}

if (!bricsRuntime.routerBound) {
    router.on('start', () => showLoadingOverlay());
    router.on('finish', () => hideLoadingOverlay());
    router.on('error', () => hideLoadingOverlay());
    bricsRuntime.routerBound = true;
}

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

        mountLoadingRoot();

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
    progress: false,
});
