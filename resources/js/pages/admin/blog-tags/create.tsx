import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogTagForm } from '@/components/admin/blog-tag-form';

export default function AdminBlogTagsCreate() {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogTags'),
                href: '/admin/blog-tags',
            },
            {
                title: t('breadcrumb.create'),
                href: '/admin/blog-tags/create',
            },
        ],
    });

    return (
        <BlogTagForm
            mode="create"
            action="/admin/blog-tags"
            method="post"
            initial={{
                name: '',
                slug: '',
            }}
        />
    );
}
