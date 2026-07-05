import type { SVGProps } from 'react';

export function ZaloIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
            {...props}
        >
            <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.19 4.81 3.05 6.27L4.5 21.5l5.2-2.1c.7.1 1.42.16 2.15.16 5.52 0 10-3.58 10-8S17.52 2 12 2Zm0 14.5c-.62 0-1.23-.06-1.82-.17l-.35-.07-2.1.85.72-2.05-.23-.37A6.44 6.44 0 0 1 5.5 10C5.5 6.91 8.41 4.5 12 4.5s6.5 2.41 6.5 5.5-2.91 5.5-6.5 5.5Z" />
            <path d="M8.5 9.5h7v1.5h-7V9.5Zm0 3h4.5v1.5H8.5v-1.5Z" />
        </svg>
    );
}
