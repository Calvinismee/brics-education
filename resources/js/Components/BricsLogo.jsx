import React from 'react';

export function BricsLogo({ size = 'md', variant, className = '', ...props }) {
    const sizes = { sm: 32, md: 48, lg: 72 };
    const s = sizes[size] || sizes.md;

    return (
        <img
            {...props}
            src="/images/logo.webp"
            alt="BRICS Education"
            width={s}
            height={s}
            className={className}
        />
    );
}

export default BricsLogo;
