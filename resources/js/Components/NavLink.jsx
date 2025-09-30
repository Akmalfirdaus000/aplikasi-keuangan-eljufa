import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    variant = 'nav', // "nav" untuk top nav, "sidebar" untuk sidebar
    className = '',
    children,
    ...props
}) {
    const baseClass =
        'inline-flex items-center text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ';

    const variants = {
        nav: active
            ? 'border-b-2 border-indigo-400 text-gray-900 focus:border-indigo-700'
            : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700',
        sidebar: active
            ? 'rounded-md bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md',
    };

    return (
        <Link
            {...props}
            className={`${baseClass} ${variants[variant]} ${className}`}
        >
            {children}
        </Link>
    );
}
