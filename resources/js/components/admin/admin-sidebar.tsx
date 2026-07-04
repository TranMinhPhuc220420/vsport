import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { adminNavGroups } from '@/config/admin-nav';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes/admin';

export function AdminSidebar() {
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslation('admin');

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
            </SidebarHeader>

            <SidebarContent>
                {adminNavGroups.map((group) => (
                    <SidebarGroup key={group.key}>
                        <SidebarGroupLabel className="text-admin-secondary admin-label px-2">
                            {t(group.titleKey)}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.titleKey}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isCurrentUrl(item.href)}
                                            className="text-admin-secondary data-[active=true]:border-l-2 data-[active=true]:border-[var(--admin-tertiary)] data-[active=true]:bg-[var(--admin-neutral)] data-[active=true]:font-medium data-[active=true]:text-[var(--admin-primary)]"
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon />
                                                <span>{t(item.titleKey)}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-admin border-t">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
