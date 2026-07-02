import type { ReactNode } from 'react';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type AdminTab = {
    value: string;
    label: string;
    content: ReactNode;
};

type AdminTabsProps = {
    tabs: AdminTab[];
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
};

export function AdminTabs({
    tabs,
    defaultValue,
    value,
    onValueChange,
    className,
}: AdminTabsProps) {
    return (
        <Tabs
            defaultValue={defaultValue ?? tabs[0]?.value}
            value={value}
            onValueChange={onValueChange}
            className={cn('w-full', className)}
        >
            <TabsList className="inline-flex h-auto w-full justify-start gap-1 rounded-admin-md border border-admin bg-[var(--admin-neutral)] p-1">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="rounded-admin-sm px-3 py-1.5 text-sm font-medium text-admin-secondary data-[state=active]:bg-[var(--admin-surface)] data-[state=active]:text-[var(--admin-primary)] data-[state=active]:shadow-sm"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
}
