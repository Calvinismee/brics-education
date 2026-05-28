import '../css/index.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Toaster } from './Components/ui/sonner.tsx';
import { IndeterminateProgressBar, Spinner, useStagedLoading } from './Components/ui/LoadingStates.jsx';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const bricsRuntime = (globalThis.__bricsRuntime ??= {
    appRoot: null,
    toasterRoot: null,
});

function GlobalNavigationLoader() {
    const [loading, setLoading] = useState(false);
    const loadingState = useStagedLoading(loading);

    useEffect(() => {
        const removeStartListener = router.on('start', () => setLoading(true));
        const removeFinishListener = router.on('finish', () => setLoading(false));

        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    if (!loading || loadingState.stage === 'idle') {
        return null;
    }

    if (loadingState.showProgress) {
        return (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 px-4 py-6 backdrop-blur-[1px]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                <div className="fixed left-0 right-0 top-0">
                    <IndeterminateProgressBar />
                </div>
                <div className="w-full max-w-[20rem] rounded-2xl border border-[#D8D7BE] bg-white p-5 text-center shadow-2xl">
                    <p className="text-sm font-extrabold text-[#691D1B]">Masih memuat...</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">Koneksi atau proses server sedang berjalan sedikit lebih lama.</p>
                    <div className="mt-4">
                        <IndeterminateProgressBar />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 px-4 py-6 backdrop-blur-[1px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            <div className="flex min-h-24 w-full max-w-48 flex-col items-center justify-center gap-3 rounded-2xl border border-[#D8D7BE] bg-white px-6 py-5 text-sm font-extrabold text-[#691D1B] shadow-2xl">
                <Spinner size="md" />
                Memuat...
            </div>
        </div>
    );
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

        bricsRuntime.appRoot.render(
            <>
                <App {...props} />
                <GlobalNavigationLoader />
            </>,
        );

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
