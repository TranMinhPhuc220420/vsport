import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
            <TabsList className="rounded-admin-md border-admin inline-flex h-auto w-full max-w-full justify-start gap-1 overflow-x-auto border bg-[var(--admin-neutral)] p-1">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="rounded-admin-sm border-admin text-admin-secondary border border-transparent px-3 py-1.5 text-sm font-medium data-[state=active]:border-admin data-[state=active]:bg-[var(--admin-surface)] data-[state=active]:text-[var(--admin-primary)]"
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
