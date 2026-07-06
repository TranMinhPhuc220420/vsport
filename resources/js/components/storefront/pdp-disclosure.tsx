import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PdpDisclosureProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
    /** Keep panel content out of the DOM until first open. */
    lazyMount?: boolean;
};

function PdpDisclosure({
    title,
    children,
    defaultOpen = false,
    className,
    lazyMount = true,
}: PdpDisclosureProps) {
    const [open, setOpen] = useState(defaultOpen);
    const [showContent, setShowContent] = useState(defaultOpen || !lazyMount);
    const panelId = useId();

    const handleToggle = () => {
        if (open) {
            setOpen(false);

            return;
        }

        if (lazyMount && !showContent) {
            setShowContent(true);
            requestAnimationFrame(() => setOpen(true));

            return;
        }

        setOpen(true);
    };

    const handlePanelTransitionEnd = (
        event: React.TransitionEvent<HTMLDivElement>,
    ) => {
        if (event.propertyName !== 'grid-template-rows' || open || !lazyMount) {
            return;
        }

        setShowContent(false);
    };

    const content = lazyMount ? (showContent ? children : null) : children;

    return (
        <div
            data-slot="pdp-disclosure"
            className={cn('border-b border-hairline', className)}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={handleToggle}
                className="flex w-full items-center justify-between py-6 text-left font-bold text-ink"
            >
                <span>{title}</span>
                <ChevronDown
                    className={cn(
                        'size-5 shrink-0 transition-transform duration-300 ease-[var(--motion-ease)]',
                        open && 'rotate-180',
                    )}
                    aria-hidden
                />
            </button>
            <div
                id={panelId}
                aria-hidden={!open}
                onTransitionEnd={handlePanelTransitionEnd}
                className={cn(
                    'pdp-disclosure-panel',
                    open && 'pdp-disclosure-panel-open',
                )}
            >
                <div
                    className={`pdp-disclosure-panel-inner ${open ? 'pb-6' : ''}`}
                >
                    {content}
                </div>
            </div>
        </div>
    );
}

export { PdpDisclosure };
