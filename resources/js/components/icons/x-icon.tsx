import type { SVGProps } from 'react';

export function XIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
            {...props}
        >
            <path d="M17.3 4h3.1l-6.8 7.8L21.5 20h-6.2l-4.9-6.4-5.6 6.4H1.6l7.3-8.3L2.5 4h6.3l4.4 5.8L17.3 4Zm-1.1 14.3h1.7L8.1 5.6H6.3l10 12.7Z" />
        </svg>
    );
}
