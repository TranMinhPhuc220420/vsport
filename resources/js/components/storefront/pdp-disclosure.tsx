import { ChevronDown } from 'lucide-react';
import { useId, useState  } from 'react';
import type {ReactNode} from 'react';

import { cn } from '@/lib/utils';

type PdpDisclosureProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
};

function PdpDisclosure({
    title,
    children,
    defaultOpen = false,
    className,
}: PdpDisclosureProps) {
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();

    return (
        <div
            data-slot="pdp-disclosure"
            className={cn('border-b border-hairline', className)}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                className="text-body-strong flex w-full items-center justify-between py-6 text-left text-ink"
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
                className={cn(
                    'pdp-disclosure-panel',
                    open && 'pdp-disclosure-panel-open',
                )}
            >
                <div className="pdp-disclosure-panel-inner pb-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export { PdpDisclosure };
