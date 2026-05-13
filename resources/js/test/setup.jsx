import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

globalThis.route = vi.fn((name, parameter) => {
    const path = `/${String(name).replaceAll('.', '/')}`;

    return parameter === undefined || parameter === null
        ? path
        : `${path}/${parameter}`;
});

vi.mock('@inertiajs/react', async () => {
    const React = await import('react');

    const callRouterCallbacks = (...args) => {
        const options = args.find((arg) => arg && typeof arg === 'object' && (
            typeof arg.onSuccess === 'function' ||
            typeof arg.onFinish === 'function'
        ));

        options?.onSuccess?.();
        options?.onFinish?.();
    };

    const router = {
        get: vi.fn((...args) => callRouterCallbacks(...args)),
        post: vi.fn((...args) => callRouterCallbacks(...args)),
        put: vi.fn((...args) => callRouterCallbacks(...args)),
        delete: vi.fn((...args) => callRouterCallbacks(...args)),
    };

    const useForm = (initialData = {}) => {
        const [data, setDataState] = React.useState(initialData);
        const [errors, setErrors] = React.useState({});
        const [processing, setProcessing] = React.useState(false);

        const setData = (key, value) => {
            if (typeof key === 'function') {
                setDataState((current) => key(current));
                return;
            }

            if (typeof key === 'string') {
                setDataState((current) => ({ ...current, [key]: value }));
                return;
            }

            setDataState(key || {});
        };

        const finishRequest = (options = {}) => {
            setProcessing(false);
            options.onSuccess?.();
            options.onFinish?.();
        };

        return {
            data,
            errors,
            processing,
            setData,
            setError: (nextErrors = {}) => setErrors(nextErrors),
            clearErrors: () => setErrors({}),
            reset: () => setDataState(initialData),
            post: vi.fn((url, options = {}) => {
                setProcessing(true);
                finishRequest(options);
            }),
            put: vi.fn((url, options = {}) => {
                setProcessing(true);
                finishRequest(options);
            }),
            delete: vi.fn((url, options = {}) => {
                setProcessing(true);
                finishRequest(options);
            }),
        };
    };

    return {
        Head: ({ title }) => <title>{title}</title>,
        Link: ({ href, children, ...props }) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
        router,
        useForm,
        usePage: () => ({
            props: {
                auth: { user: { name: 'Admin Tester' } },
                notifications: [],
            },
            url: '/admin',
        }),
    };
});

vi.mock('@/Layouts/AdminLayout', () => ({
    default: ({ children, title }) => <main aria-label={title}>{children}</main>,
}));

vi.mock('@/utils/toast', () => ({
    showSuccessToast: vi.fn(),
}));
