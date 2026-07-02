import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default function AdminLayout({ children, breadcrumbs }: AppLayoutProps) {
    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            {children}
        </AdminSidebarLayout>
    );
}
