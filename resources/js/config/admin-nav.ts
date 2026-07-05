import type { InertiaLinkProps } from '@inertiajs/react';
import {
    BarChart3,
    FileText,
    FolderTree,
    Image,
    LayoutGrid,
    MessageSquare,
    Package,
    ScrollText,
    Settings,
    ShoppingCart,
    Tag,
    Tags,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { dashboard } from '@/routes/admin';

export type AdminNavItem = {
    titleKey: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon: LucideIcon;
};

export type AdminNavGroup = {
    key: string;
    titleKey: string;
    items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
    {
        key: 'overview',
        titleKey: 'nav.groups.overview',
        items: [
            { titleKey: 'nav.dashboard', href: dashboard(), icon: LayoutGrid },
        ],
    },
    {
        key: 'catalog',
        titleKey: 'nav.groups.catalog',
        items: [
            { titleKey: 'nav.products', href: '/admin/products', icon: Package },
            {
                titleKey: 'nav.categories',
                href: '/admin/categories',
                icon: FolderTree,
            },
            { titleKey: 'nav.homepage', href: '/admin/homepage', icon: Image },
        ],
    },
    {
        key: 'sales',
        titleKey: 'nav.groups.sales',
        items: [
            {
                titleKey: 'nav.orders',
                href: '/admin/orders',
                icon: ShoppingCart,
            },
            {
                titleKey: 'nav.discountCodes',
                href: '/admin/discount-codes',
                icon: Tag,
            },
        ],
    },
    {
        key: 'customers',
        titleKey: 'nav.groups.customers',
        items: [
            { titleKey: 'nav.users', href: '/admin/users', icon: Users },
            {
                titleKey: 'nav.reviews',
                href: '/admin/reviews',
                icon: MessageSquare,
            },
        ],
    },
    {
        key: 'content',
        titleKey: 'nav.groups.content',
        items: [
            {
                titleKey: 'nav.blogPosts',
                href: '/admin/blog-posts',
                icon: FileText,
            },
            {
                titleKey: 'nav.blogCategories',
                href: '/admin/blog-categories',
                icon: FolderTree,
            },
            {
                titleKey: 'nav.blogTags',
                href: '/admin/blog-tags',
                icon: Tags,
            },
        ],
    },
    {
        key: 'insights',
        titleKey: 'nav.groups.insights',
        items: [
            {
                titleKey: 'nav.analytics',
                href: '/admin/analytics',
                icon: BarChart3,
            },
            {
                titleKey: 'nav.activityLogs',
                href: '/admin/activity-logs',
                icon: ScrollText,
            },
        ],
    },
    {
        key: 'settings',
        titleKey: 'nav.groups.settings',
        items: [
            { titleKey: 'nav.settings', href: '/admin/settings', icon: Settings },
        ],
    },
];

export const adminQuickCreateItems: AdminNavItem[] = [
    {
        titleKey: 'commandPalette.newProduct',
        href: '/admin/products/create',
        icon: Package,
    },
    {
        titleKey: 'commandPalette.newCategory',
        href: '/admin/categories/create',
        icon: FolderTree,
    },
    {
        titleKey: 'commandPalette.newDiscountCode',
        href: '/admin/discount-codes/create',
        icon: Tag,
    },
    {
        titleKey: 'commandPalette.newBlogPost',
        href: '/admin/blog-posts/create',
        icon: FileText,
    },
];
