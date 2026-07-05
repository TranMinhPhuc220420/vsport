import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PdpDisclosure } from '@/components/storefront/pdp-disclosure';
import type { BlogHeading } from '@/lib/blog-heading-utils';
import { cn } from '@/lib/utils';

type BlogTableOfContentsProps = {
    headings: BlogHeading[];
    variant: 'desktop' | 'mobile';
    className?: string;
};

const MIN_HEADINGS = 3;

function TocLink({
    heading,
    activeId,
    onNavigate,
}: {
    heading: BlogHeading;
    activeId: string | null;
    onNavigate: (id: string) => void;
}) {
    return (
        <li>
            <a
                href={`#${heading.id}`}
                onClick={(event) => {
                    event.preventDefault();
                    onNavigate(heading.id);
                }}
                className={cn(
                    'text-caption-md block py-1 transition-colors hover:text-ink',
                    heading.level === 3 && 'pl-4',
                    activeId === heading.id
                        ? 'text-ink underline'
                        : 'text-mute',
                )}
            >
                {heading.text}
            </a>
        </li>
    );
}

function TocNav({
    headings,
    activeId,
    onNavigate,
    className,
}: {
    headings: BlogHeading[];
    activeId: string | null;
    onNavigate: (id: string) => void;
    className?: string;
}) {
    const { t } = useTranslation('storefront');

    return (
        <nav aria-label={t('blog.tableOfContents')} className={className}>
            <p className="text-caption-md text-mute">{t('blog.tableOfContents')}</p>
            <ul className="mt-3 space-y-1">
                {headings.map((heading) => (
                    <TocLink
                        key={heading.id}
                        heading={heading}
                        activeId={activeId}
                        onNavigate={onNavigate}
                    />
                ))}
            </ul>
        </nav>
    );
}

export function BlogTableOfContents({
    headings,
    variant,
    className,
}: BlogTableOfContentsProps) {
    const { t } = useTranslation('storefront');
    const [activeId, setActiveId] = useState<string | null>(null);

    const visibleHeadings = headings.length >= MIN_HEADINGS ? headings : [];

    useEffect(() => {
        if (visibleHeadings.length === 0) {
            return;
        }

        const elements = visibleHeadings
            .map((heading) => document.getElementById(heading.id))
            .filter((element): element is HTMLElement => element !== null);

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top -
                            b.boundingClientRect.top,
                    );

                if (visible[0]?.target.id) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
        );

        for (const element of elements) {
            observer.observe(element);
        }

        return () => observer.disconnect();
    }, [visibleHeadings]);

    if (visibleHeadings.length === 0) {
        return null;
    }

    const handleNavigate = (id: string) => {
        const element = document.getElementById(id);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveId(id);
        }
    };

    if (variant === 'mobile') {
        return (
            <div className={cn('mb-8 border-b border-hairline', className)}>
                <PdpDisclosure title={t('blog.tableOfContents')} defaultOpen={false}>
                    <TocNav
                        headings={visibleHeadings}
                        activeId={activeId}
                        onNavigate={handleNavigate}
                    />
                </PdpDisclosure>
            </div>
        );
    }

    return (
        <aside className={cn('sticky top-20', className)}>
            <TocNav
                headings={visibleHeadings}
                activeId={activeId}
                onNavigate={handleNavigate}
            />
        </aside>
    );
}
