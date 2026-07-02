import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminSidebarHeader } from '@/components/admin/admin-sidebar-header';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AdminSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <div className="vsport-admin bg-admin-canvas min-h-screen">
            <AppShell variant="sidebar">
                <AdminSidebar />
                <AppContent
                    variant="sidebar"
                    className="bg-admin-canvas overflow-x-hidden"
                >
                    <AdminSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
        </div>
    );
}
