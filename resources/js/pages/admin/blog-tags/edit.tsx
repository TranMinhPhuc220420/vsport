import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogTagForm } from '@/components/admin/blog-tag-form';

type AdminBlogTagsEditProps = {
    tag: {
        id: number;
        name: string;
        slug: string;
    };
};

export default function AdminBlogTagsEdit({ tag }: AdminBlogTagsEditProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogTags'),
                href: '/admin/blog-tags',
            },
            {
                title: t('breadcrumb.edit'),
                href: `/admin/blog-tags/${tag.slug}/edit`,
            },
        ],
    });

    return (
        <BlogTagForm
            mode="edit"
            action={`/admin/blog-tags/${tag.slug}`}
            method="put"
            initial={{
                name: tag.name,
                slug: tag.slug,
            }}
        />
    );
}
