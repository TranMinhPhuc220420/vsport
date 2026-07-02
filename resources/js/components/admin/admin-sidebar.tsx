import { Link } from '@inertiajs/react';
import {
    BarChart3,
    FolderTree,
    Image,
    LayoutGrid,
    MessageSquare,
    Package,
    ShoppingCart,
    ScrollText,
    Tag,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/language-switcher';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes/admin';
import type { NavItem } from '@/types';

export function AdminSidebar() {
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslation('admin');

    const mainNavItems: NavItem[] = useMemo(
        () => [
            {
                title: t('nav.dashboard'),
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: t('nav.products'),
                href: '/admin/products',
                icon: Package,
            },
            {
                title: t('nav.categories'),
                href: '/admin/categories',
                icon: FolderTree,
            },
            {
                title: t('nav.homepage'),
                href: '/admin/homepage',
                icon: Image,
            },
            {
                title: t('nav.orders'),
                href: '/admin/orders',
                icon: ShoppingCart,
            },
            {
                title: t('nav.users'),
                href: '/admin/users',
                icon: Users,
            },
            {
                title: t('nav.discountCodes'),
                href: '/admin/discount-codes',
                icon: Tag,
            },
            {
                title: t('nav.reviews'),
                href: '/admin/reviews',
                icon: MessageSquare,
            },
            {
                title: t('nav.analytics'),
                href: '/admin/analytics',
                icon: BarChart3,
            },
            {
                title: t('nav.activityLogs'),
                href: '/admin/activity-logs',
                icon: ScrollText,
            },
        ],
        [t],
    );

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-admin border-r bg-[var(--admin-surface)]"
        >
            <SidebarHeader className="border-admin border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <span className="text-sm font-semibold text-[var(--admin-primary)]">
                                    {t('brand')}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="px-3 pb-3">
                    <LanguageSwitcher compact />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="px-2 py-4">
                    {mainNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                className="text-admin-secondary data-[active=true]:border-l-2 data-[active=true]:border-[var(--admin-primary)] data-[active=true]:bg-[var(--admin-neutral)] data-[active=true]:font-medium data-[active=true]:text-[var(--admin-primary)]"
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-admin border-t">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
