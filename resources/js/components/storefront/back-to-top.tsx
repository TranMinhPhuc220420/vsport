import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

function BackToTop() {
    const { t } = useTranslation('storefront');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label={t('plp.backToTop')}
            className={cn(
                'fixed right-4 z-40 flex size-12 items-center justify-center rounded-full bg-ink text-canvas shadow-lg transition-all duration-300 bottom-[max(calc(1.5rem+var(--storefront-safe-bottom,0px)),var(--storefront-sticky-bottom-inset,0px))] desktop:bottom-[calc(1.5rem+var(--storefront-safe-bottom,0px))]',
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0',
            )}
        >
            <ArrowUp className="size-5" />
        </button>
    );
}

export { BackToTop };
