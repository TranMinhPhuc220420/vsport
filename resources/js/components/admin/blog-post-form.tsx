import { Head, Link, useForm } from '@inertiajs/react';
import { ExternalLinkIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
    AdminInputField,
    AdminSelectField,
    AdminTextareaField,
} from '@/components/admin/admin-field';
import {
    AdminFormErrorSummary,
    notifyAdminFormValidationError,
} from '@/components/admin/admin-form-error-summary';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { BlogPostStatusBadge } from '@/components/admin/blog-post-status-badge';
import type { BlogPostStatus } from '@/components/admin/blog-post-status-badge';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { uploadBlogFeaturedImage } from '@/lib/admin-upload';
import { cn } from '@/lib/utils';
import { BlogFeaturedImageCreateField } from '@/pages/admin/blog-posts/components/blog-featured-image-create-field';
import { BlogFeaturedImageEditor } from '@/pages/admin/blog-posts/components/blog-featured-image-editor';

type BlogPostFormProps = {
    mode: 'create' | 'edit';
    postSlug?: string;
    viewPostHref?: string;
    action: string;
    method: 'post' | 'put';
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    productOptions: { id: number; name: string; slug: string }[];
    statusOptions: string[];
    featuredImageUrl?: string | null;
    featuredImageAlt?: string | null;
    initial: {
        title: string;
        slug: string;
        excerpt: string;
        bodyHtml: string;
        blogCategoryId: number | string;
        tagIds: number[];
        productIds: number[];
        metaTitle: string;
        metaDescription: string;
        status: BlogPostStatus;
        isFeatured: boolean;
        publishedAt: string;
        authorName: string;
    };
};

const EXCERPT_MAX = 300;
const PRODUCT_MAX = 3;

export function BlogPostForm({
    mode,
    postSlug,
    viewPostHref,
    action,
    method,
    categories,
    tags,
    productOptions,
    statusOptions,
    featuredImageUrl = null,
    featuredImageAlt = null,
    initial,
}: BlogPostFormProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { data, setData, processing, errors, post, put } = useForm(initial);
    const pendingFeaturedFileRef = useRef<File | null>(null);
    const [pendingFeaturedPreview, setPendingFeaturedPreview] = useState<
        string | null
    >(null);

    const pageTitle =
        mode === 'create' ? t('blogPosts.newTitle') : t('blogPosts.editTitle');
    const headerTitle = data.title.trim() || pageTitle;
    const headerSubtitle =
        data.slug.trim() !== '' ? `/blog/${data.slug}` : undefined;
    const submitLabel =
        mode === 'create' ? t('blogPosts.create') : t('blogPosts.save');

    const hasSeoErrors = Boolean(errors.metaTitle || errors.metaDescription);
    const hasSeoData = Boolean(data.metaTitle || data.metaDescription);

    const handleValidationError = () => {
        notifyAdminFormValidationError(t('form.validationFailed'));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (method === 'put') {
            put(action, {
                onError: handleValidationError,
            });

            return;
        }

        post(action, {
            onError: handleValidationError,
            onSuccess: async (page) => {
                const createdSlug =
                    (page.props.post as { slug?: string } | undefined)?.slug ??
                    data.slug;

                if (
                    pendingFeaturedFileRef.current === null ||
                    createdSlug === ''
                ) {
                    return;
                }

                try {
                    await uploadBlogFeaturedImage(
                        createdSlug,
                        pendingFeaturedFileRef.current,
                        {
                            imageAlt: data.title,
                        },
                    );
                } catch (uploadError) {
                    toast.error(
                        uploadError instanceof Error
                            ? uploadError.message
                            : t('blogPosts.imageUploadFailed'),
                    );
                } finally {
                    pendingFeaturedFileRef.current = null;
                    setPendingFeaturedPreview(null);
                }
            },
        });
    };

    const handleCreateFeaturedFileChange = (file: File | null) => {
        pendingFeaturedFileRef.current = file;

        if (file) {
            setPendingFeaturedPreview(URL.createObjectURL(file));
        } else {
            setPendingFeaturedPreview(null);
        }
    };

    const toggleTag = (tagId: number) => {
        const next = data.tagIds.includes(tagId)
            ? data.tagIds.filter((id) => id !== tagId)
            : [...data.tagIds, tagId];

        setData('tagIds', next);
    };

    const toggleProduct = (productId: number) => {
        if (data.productIds.includes(productId)) {
            setData(
                'productIds',
                data.productIds.filter((id) => id !== productId),
            );

            return;
        }

        if (data.productIds.length >= PRODUCT_MAX) {
            return;
        }

        setData('productIds', [...data.productIds, productId]);
    };

    return (
        <>
            <Head title={pageTitle} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/blog-posts"
                    backLabel={t('blogPosts.back')}
                    title={headerTitle}
                    subtitle={headerSubtitle}
                    sticky
                    badges={
                        mode === 'edit' ? (
                            <BlogPostStatusBadge
                                status={data.status}
                                isFeatured={data.isFeatured}
                            />
                        ) : undefined
                    }
                    actions={
                        <div className="flex flex-wrap gap-2">
                            {viewPostHref && (
                                <AdminButton
                                    asChild
                                    variant="secondary"
                                    type="button"
                                >
                                    <a
                                        href={viewPostHref}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {t('blogPosts.viewPost')}
                                        <ExternalLinkIcon className="ml-1.5 size-3.5" />
                                    </a>
                                </AdminButton>
                            )}
                            <AdminButton
                                type="submit"
                                form="blog-post-form"
                                disabled={processing}
                            >
                                {submitLabel}
                            </AdminButton>
                        </div>
                    }
                />

                <form
                    id="blog-post-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <AdminFormErrorSummary errors={errors} />

                    <div className="grid items-start gap-6 desktop:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
                        <div className="min-w-0 space-y-6">
                            <AdminFormSection
                                title={t('blogPosts.contentSection')}
                                description={t(
                                    'blogPosts.contentSectionDescription',
                                )}
                            >
                                <AdminInputField
                                    label={t('blogPosts.postTitle')}
                                    value={data.title}
                                    onChange={(event) =>
                                        setData('title', event.target.value)
                                    }
                                    error={errors.title}
                                />
                                <div>
                                    <AdminTextareaField
                                        label={t('blogPosts.excerpt')}
                                        value={data.excerpt}
                                        onChange={(event) =>
                                            setData(
                                                'excerpt',
                                                event.target.value,
                                            )
                                        }
                                        rows={3}
                                        error={errors.excerpt}
                                    />
                                    <p
                                        className={cn(
                                            'admin-caption mt-1 text-right',
                                            data.excerpt.length > EXCERPT_MAX
                                                ? 'text-red-600'
                                                : 'text-admin-secondary',
                                        )}
                                    >
                                        {t('blogPosts.excerptCharCount', {
                                            count: data.excerpt.length,
                                            max: EXCERPT_MAX,
                                        })}
                                    </p>
                                </div>
                                <RichTextEditor
                                    label={t('blogPosts.body')}
                                    value={data.bodyHtml}
                                    onChange={(html) =>
                                        setData('bodyHtml', html ?? '')
                                    }
                                    error={errors.bodyHtml}
                                />
                            </AdminFormSection>

                            <AdminFormSection
                                title={t('blogPosts.tagsSection')}
                                description={
                                    tags.length > 0
                                        ? t('blogPosts.tagsSectionDescription')
                                        : undefined
                                }
                            >
                                {tags.length === 0 ? (
                                    <p className="admin-caption text-admin-secondary">
                                        {t('blogPosts.tagsEmpty')}{' '}
                                        <Link
                                            href="/admin/blog-tags/create"
                                            className="text-[var(--admin-tertiary)] hover:underline"
                                        >
                                            {t('blogPosts.createTagLink')}
                                        </Link>
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => {
                                            const selected =
                                                data.tagIds.includes(tag.id);

                                            return (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleTag(tag.id)
                                                    }
                                                    aria-pressed={selected}
                                                    className={cn(
                                                        'rounded-admin-md px-3 py-1.5 text-sm transition-colors',
                                                        selected
                                                            ? 'bg-[var(--admin-tertiary)] font-medium text-white'
                                                            : 'border-admin border bg-white text-[var(--admin-secondary)] hover:border-[var(--admin-tertiary)] hover:text-[var(--admin-primary)]',
                                                    )}
                                                >
                                                    {tag.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.tagIds && (
                                    <p className="admin-caption text-red-600">
                                        {errors.tagIds}
                                    </p>
                                )}
                            </AdminFormSection>

                            <AdminFormSection
                                title={t('blogPosts.productsSection')}
                                description={t('blogPosts.productsHint')}
                                actions={
                                    <span className="admin-caption text-admin-secondary">
                                        {t('blogPosts.productsSelected', {
                                            selected: data.productIds.length,
                                            max: PRODUCT_MAX,
                                        })}
                                    </span>
                                }
                            >
                                {productOptions.length === 0 ? (
                                    <p className="admin-caption text-admin-secondary">
                                        {t('blogPosts.productsEmpty')}
                                    </p>
                                ) : (
                                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                        {productOptions.map((product) => {
                                            const selected =
                                                data.productIds.includes(
                                                    product.id,
                                                );
                                            const atLimit =
                                                data.productIds.length >=
                                                    PRODUCT_MAX && !selected;

                                            return (
                                                <label
                                                    key={product.id}
                                                    className={cn(
                                                        'rounded-admin-md flex items-center gap-2 px-2 py-1.5',
                                                        atLimit &&
                                                            'cursor-not-allowed opacity-50',
                                                        selected &&
                                                            'bg-[var(--admin-neutral)]',
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={selected}
                                                        disabled={atLimit}
                                                        onCheckedChange={() =>
                                                            toggleProduct(
                                                                product.id,
                                                            )
                                                        }
                                                    />
                                                    <span className="text-sm text-[var(--admin-primary)]">
                                                        {product.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.productIds && (
                                    <p className="admin-caption text-red-600">
                                        {errors.productIds}
                                    </p>
                                )}
                            </AdminFormSection>

                            <details
                                className="rounded-admin-lg border-admin group border bg-[var(--admin-surface)]"
                                open={hasSeoErrors || hasSeoData}
                            >
                                <summary className="admin-section-title cursor-pointer list-none px-6 py-4 [&::-webkit-details-marker]:hidden">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <span>
                                                {t('blogPosts.seoSection')}
                                            </span>
                                            <p className="admin-caption mt-1 font-normal">
                                                {t(
                                                    'blogPosts.seoSectionDescription',
                                                )}
                                            </p>
                                        </div>
                                        <span className="admin-caption text-admin-secondary group-open:rotate-180">
                                            ▾
                                        </span>
                                    </div>
                                </summary>
                                <div className="space-y-4 border-t border-[var(--admin-border)] px-6 py-4">
                                    <AdminInputField
                                        label={t('blogPosts.metaTitle')}
                                        value={data.metaTitle}
                                        onChange={(event) =>
                                            setData(
                                                'metaTitle',
                                                event.target.value,
                                            )
                                        }
                                        error={errors.metaTitle}
                                    />
                                    <AdminTextareaField
                                        label={t('blogPosts.metaDescription')}
                                        value={data.metaDescription}
                                        onChange={(event) =>
                                            setData(
                                                'metaDescription',
                                                event.target.value,
                                            )
                                        }
                                        rows={3}
                                        error={errors.metaDescription}
                                    />
                                </div>
                            </details>
                        </div>

                        <aside className="space-y-6 desktop:sticky desktop:top-24">
                            <AdminFormSection
                                title={t('blogPosts.publishSection')}
                                description={t(
                                    'blogPosts.publishSectionDescription',
                                )}
                                className="p-4"
                            >
                                <AdminSelectField
                                    label={tCommon('status')}
                                    value={data.status}
                                    onChange={(value) =>
                                        setData(
                                            'status',
                                            value as BlogPostStatus,
                                        )
                                    }
                                    options={statusOptions.map((status) => ({
                                        value: status,
                                        label:
                                            status === 'published'
                                                ? t('blogPosts.published')
                                                : t('blogPosts.draft'),
                                    }))}
                                    error={errors.status}
                                />
                                <AdminInputField
                                    label={t('blogPosts.publishedAt')}
                                    type="datetime-local"
                                    value={data.publishedAt}
                                    onChange={(event) =>
                                        setData(
                                            'publishedAt',
                                            event.target.value,
                                        )
                                    }
                                    error={errors.publishedAt}
                                />
                                <div className="rounded-admin-md flex items-start gap-2 bg-[var(--admin-neutral)] px-3 py-2.5">
                                    <Checkbox
                                        id="isFeatured"
                                        checked={data.isFeatured}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'isFeatured',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <div>
                                        <Label
                                            htmlFor="isFeatured"
                                            className="admin-label"
                                        >
                                            {t('blogPosts.featured')}
                                        </Label>
                                        <p className="admin-caption text-admin-secondary mt-0.5">
                                            {t('blogPosts.featuredHint')}
                                        </p>
                                    </div>
                                </div>
                                {errors.isFeatured && (
                                    <p className="admin-caption text-red-600">
                                        {errors.isFeatured}
                                    </p>
                                )}
                            </AdminFormSection>

                            {mode === 'edit' && postSlug !== undefined ? (
                                <BlogFeaturedImageEditor
                                    postSlug={postSlug}
                                    initialImageUrl={featuredImageUrl}
                                    initialImageAlt={featuredImageAlt}
                                    postTitle={data.title}
                                    layout="sidebar"
                                />
                            ) : (
                                <AdminFormSection
                                    title={t('blogPosts.featuredImageTitle')}
                                    className="p-4"
                                >
                                    <BlogFeaturedImageCreateField
                                        previewUrl={pendingFeaturedPreview}
                                        postTitle={data.title}
                                        onFileChange={
                                            handleCreateFeaturedFileChange
                                        }
                                    />
                                </AdminFormSection>
                            )}

                            <AdminFormSection
                                title={t('blogPosts.classificationSection')}
                                description={t(
                                    'blogPosts.classificationSectionDescription',
                                )}
                                className="p-4"
                            >
                                <AdminSelectField
                                    label={t('blogPosts.category')}
                                    value={String(data.blogCategoryId)}
                                    onChange={(value) =>
                                        setData(
                                            'blogCategoryId',
                                            value === '' ? '' : Number(value),
                                        )
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: t('blogPosts.noCategory'),
                                        },
                                        ...categories.map((category) => ({
                                            value: String(category.id),
                                            label: category.name,
                                        })),
                                    ]}
                                    error={errors.blogCategoryId}
                                />
                                <AdminInputField
                                    label={t('blogPosts.authorName')}
                                    value={data.authorName}
                                    onChange={(event) =>
                                        setData(
                                            'authorName',
                                            event.target.value,
                                        )
                                    }
                                    error={errors.authorName}
                                />
                                <AdminInputField
                                    label={t('blogPosts.slug')}
                                    value={data.slug}
                                    onChange={(event) =>
                                        setData('slug', event.target.value)
                                    }
                                    hint={t('blogPosts.slugHint')}
                                    error={errors.slug}
                                />
                            </AdminFormSection>
                        </aside>
                    </div>

                    <div className="border-admin flex justify-end border-t pt-4 desktop:hidden">
                        <AdminButton type="submit" disabled={processing}>
                            {submitLabel}
                        </AdminButton>
                    </div>
                </form>
            </div>
        </>
    );
}
