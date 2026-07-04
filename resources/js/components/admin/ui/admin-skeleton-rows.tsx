import { Skeleton } from '@/components/ui/skeleton';

import { AdminDataTableCell, AdminDataTableRow } from './admin-data-table';

type AdminSkeletonRowsProps = {
    rows?: number;
    columns: number;
};

function AdminSkeletonRows({ rows = 5, columns }: AdminSkeletonRowsProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <AdminDataTableRow key={rowIndex}>
                    {Array.from({ length: columns }).map((_, columnIndex) => (
                        <AdminDataTableCell key={columnIndex}>
                            <Skeleton className="h-4 w-full max-w-[160px]" />
                        </AdminDataTableCell>
                    ))}
                </AdminDataTableRow>
            ))}
        </>
    );
}

export { AdminSkeletonRows };
