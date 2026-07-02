import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AdminDataTableProps = {
    children: ReactNode;
    className?: string;
    minWidth?: string;
};

function AdminDataTable({
    children,
    className,
    minWidth = '640px',
}: AdminDataTableProps) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-admin-lg border border-admin bg-[var(--admin-surface)]',
                className,
            )}
        >
            <div className="overflow-x-auto">
                <table
                    className="w-full text-left"
                    style={{ minWidth }}
                >
                    {children}
                </table>
            </div>
        </div>
    );
}

function AdminDataTableHead({ children }: { children: ReactNode }) {
    return (
        <thead className="border-b border-admin bg-[var(--admin-neutral)]">
            {children}
        </thead>
    );
}

function AdminDataTableHeaderRow({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <tr className={cn('admin-label text-admin-secondary', className)}>
            {children}
        </tr>
    );
}

function AdminDataTableHeaderCell({
    children,
    className,
    align = 'left',
}: {
    children: ReactNode;
    className?: string;
    align?: 'left' | 'right' | 'center';
}) {
    return (
        <th
            className={cn(
                'px-4 py-2.5',
                align === 'right' && 'text-right',
                align === 'center' && 'text-center',
                className,
            )}
        >
            {children}
        </th>
    );
}

function AdminDataTableBody({ children }: { children: ReactNode }) {
    return (
        <tbody className="divide-y divide-[color-mix(in_srgb,var(--admin-secondary)_12%,transparent)]">
            {children}
        </tbody>
    );
}

function AdminDataTableRow({
    children,
    className,
    onClick,
}: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    return (
        <tr
            className={cn(
                'transition-colors',
                onClick && 'cursor-pointer hover:bg-[var(--admin-neutral)]',
                className,
            )}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

function AdminDataTableCell({
    children,
    className,
    align = 'left',
    colSpan,
}: {
    children: ReactNode;
    className?: string;
    align?: 'left' | 'right' | 'center';
    colSpan?: number;
}) {
    return (
        <td
            colSpan={colSpan}
            className={cn(
                'admin-body px-4 py-2.5',
                align === 'right' && 'text-right',
                align === 'center' && 'text-center',
                className,
            )}
        >
            {children}
        </td>
    );
}

export {
    AdminDataTable,
    AdminDataTableBody,
    AdminDataTableCell,
    AdminDataTableHead,
    AdminDataTableHeaderCell,
    AdminDataTableHeaderRow,
    AdminDataTableRow,
};
