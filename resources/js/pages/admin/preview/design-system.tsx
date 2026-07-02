import { Head, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';

import {
    AdminActiveBadge,
    AdminStockBadge,
} from '@/components/admin/admin-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AdminCard } from '@/components/admin/ui/admin-card';
import {
    AdminDataTable,
    AdminDataTableBody,
    AdminDataTableCell,
    AdminDataTableHead,
    AdminDataTableHeaderCell,
    AdminDataTableHeaderRow,
    AdminDataTableRow,
} from '@/components/admin/ui/admin-data-table';
import { AdminEmptyState } from '@/components/admin/ui/admin-empty-state';
import { AdminFilterTabs } from '@/components/admin/ui/admin-filter-tabs';
import { adminInputClassName } from '@/components/admin/ui/admin-input-styles';
import { AdminStatCard } from '@/components/admin/ui/admin-stat-card';

const colorTokens = [
    { name: 'primary', hex: '#0A2540', className: 'bg-[#0A2540]' },
    { name: 'secondary', hex: '#425466', className: 'bg-[#425466]' },
    { name: 'tertiary', hex: '#635BFF', className: 'bg-[#635BFF]' },
    { name: 'neutral', hex: '#F6F9FC', className: 'bg-[#F6F9FC] border border-admin' },
    { name: 'surface', hex: '#FFFFFF', className: 'bg-[#FFFFFF] border border-admin' },
];

export default function AdminDesignSystemPreview() {
    const [filter, setFilter] = useState<string | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Admin', href: '/admin' },
            { title: 'Design system', href: '/admin/preview/design-system' },
        ],
    });

    return (
        <>
            <Head title="Admin Design System" />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <AdminPageHeader
                    title="Admin design system"
                    subtitle="Stripe aesthetic — flat surfaces, navy typography, indigo tertiary CTA only (see docs/DESIGN_ADMIN.md)."
                />

                <section className="space-y-4">
                    <h2 className="admin-section-title">Color tokens</h2>
                    <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-5">
                        {colorTokens.map((token) => (
                            <div key={token.name} className="space-y-2">
                                <div
                                    className={`h-16 rounded-admin-md ${token.className}`}
                                />
                                <p className="admin-label">{token.name}</p>
                                <p className="admin-caption">{token.hex}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Typography</h2>
                    <AdminCard className="space-y-4">
                        <p className="admin-display">Display</p>
                        <p className="admin-title">Page title (h1)</p>
                        <p className="admin-section-title">Section title</p>
                        <p className="admin-body">
                            Body — Inter 0.98rem, line-height 1.6 for dense
                            operational copy.
                        </p>
                        <p className="admin-label">LABEL / METADATA</p>
                        <p className="admin-caption">Caption and helper text</p>
                    </AdminCard>
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Buttons</h2>
                    <AdminCard className="space-y-4">
                        <p className="admin-caption">
                            One tertiary (primary) action per screen. Others use
                            secondary or ghost.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <AdminButton>Primary (tertiary)</AdminButton>
                            <AdminButton variant="secondary">Secondary</AdminButton>
                            <AdminButton variant="ghost">Ghost</AdminButton>
                            <AdminButton variant="destructive">
                                Destructive
                            </AdminButton>
                        </div>
                    </AdminCard>
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Form input</h2>
                    <div className="max-w-sm space-y-2">
                        <label className="admin-label" htmlFor="preview-input">
                            Sample input
                        </label>
                        <input
                            id="preview-input"
                            className={adminInputClassName}
                            placeholder="Type here…"
                        />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Badges</h2>
                    <div className="flex flex-wrap gap-2">
                        <AdminActiveBadge active />
                        <AdminActiveBadge active={false} />
                        <AdminStockBadge status="in_stock" />
                        <AdminStockBadge status="low_stock" />
                        <AdminStockBadge status="out_of_stock" />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Filter tabs</h2>
                    <AdminFilterTabs
                        value={filter}
                        onChange={setFilter}
                        options={[
                            { value: null, label: 'All' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'completed', label: 'Completed' },
                        ]}
                    />
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Stat card</h2>
                    <div className="grid gap-4 tablet:grid-cols-3">
                        <AdminStatCard label="Revenue" value="$12,450" />
                        <AdminStatCard label="Orders" value="128" />
                        <AdminStatCard label="Products" value="42" />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Data table</h2>
                    <AdminDataTable>
                        <AdminDataTableHead>
                            <AdminDataTableHeaderRow>
                                <AdminDataTableHeaderCell>Name</AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>Status</AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell className="text-right">
                                    Qty
                                </AdminDataTableHeaderCell>
                            </AdminDataTableHeaderRow>
                        </AdminDataTableHead>
                        <AdminDataTableBody>
                            <AdminDataTableRow>
                                <AdminDataTableCell className="font-medium">
                                    Air Zoom Pegasus
                                </AdminDataTableCell>
                                <AdminDataTableCell>
                                    <AdminActiveBadge active />
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-right">
                                    24
                                </AdminDataTableCell>
                            </AdminDataTableRow>
                            <AdminDataTableRow>
                                <AdminDataTableCell className="font-medium">
                                    Jordan 1 Low
                                </AdminDataTableCell>
                                <AdminDataTableCell>
                                    <AdminStockBadge status="low_stock" />
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-right">
                                    3
                                </AdminDataTableCell>
                            </AdminDataTableRow>
                        </AdminDataTableBody>
                    </AdminDataTable>
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">Empty state</h2>
                    <AdminEmptyState
                        title="No products yet"
                        description="Create your first product to get started."
                        action={<AdminButton>Add product</AdminButton>}
                    />
                </section>

                <section className="space-y-2">
                    <h2 className="admin-section-title">Shell</h2>
                    <p className="admin-caption">
                        Light sidebar on surface white; content canvas uses
                        neutral #F6F9FC. Navigation uses primary navy — tertiary
                        reserved for page CTAs only.
                    </p>
                </section>
            </div>
        </>
    );
}
