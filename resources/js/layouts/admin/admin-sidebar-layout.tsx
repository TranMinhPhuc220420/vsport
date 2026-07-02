import { AppContent } from '@/components/app-content';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminSidebarHeader } from '@/components/admin/admin-sidebar-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AdminSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <div className="vsport-admin min-h-screen bg-admin-canvas">
            <AppShell variant="sidebar">
                <AdminSidebar />
                <AppContent
                    variant="sidebar"
                    className="overflow-x-hidden bg-admin-canvas"
                >
                    <AdminSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
        </div>
    );
}
