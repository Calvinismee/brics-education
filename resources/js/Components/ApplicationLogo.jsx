export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            src="/images/logo.webp"
            alt="BRICS Education"
            className={className}
        />
    );
}
