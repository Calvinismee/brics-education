import React from 'react';

export function BricsLogo({ size = 'md', variant, className = '', ...props }) {
    const sizes = {
        sm: { width: 84, height: 32 },
        md: { width: 127, height: 48 },
        lg: { width: 190, height: 72 },
    };
    const dimensions = sizes[size] || sizes.md;

    return (
        <img
            {...props}
            src="/images/logo.webp"
            alt="BRICS Education"
            width={dimensions.width}
            height={dimensions.height}
            decoding="async"
            className={className}
        />
    );
}

export default BricsLogo;
