import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminInputField } from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import type { SizeGuideRow } from '@/types/catalog';

type TableRow = {
    id?: number;
    position: number;
    values: string[];
};

type SizeGuideTableEditorProps = {
    sizeGuideId: number;
    columns: string[];
    rows: SizeGuideRow[];
};

export function SizeGuideTableEditor({
    sizeGuideId,
    columns,
    rows,
}: SizeGuideTableEditorProps) {
    const { t } = useTranslation('admin');

    const form = useForm<{ columns: string[]; rows: TableRow[] }>({
        columns,
        rows: rows.map((row) => ({
            id: row.id,
            position: row.position,
            values: row.values,
        })),
    });

    const addColumn = () => {
        form.setData('columns', [...form.data.columns, '']);
        form.setData(
            'rows',
            form.data.rows.map((row) => ({
                ...row,
                values: [...row.values, ''],
            })),
        );
    };

    const removeColumn = (index: number) => {
        form.setData(
            'columns',
            form.data.columns.filter((_, i) => i !== index),
        );
        form.setData(
            'rows',
            form.data.rows.map((row) => ({
                ...row,
                values: row.values.filter((_, i) => i !== index),
            })),
        );
    };

    const updateColumn = (index: number, value: string) => {
        const columnsCopy = [...form.data.columns];
        columnsCopy[index] = value;
        form.setData('columns', columnsCopy);
    };

    const addRow = () => {
        form.setData('rows', [
            ...form.data.rows,
            {
                position: form.data.rows.length,
                values: form.data.columns.map(() => ''),
            },
        ]);
    };

    const removeRow = (index: number) => {
        form.setData(
            'rows',
            form.data.rows.filter((_, i) => i !== index),
        );
    };

    const updateRowValue = (
        rowIndex: number,
        columnIndex: number,
        value: string,
    ) => {
        const rowsCopy = [...form.data.rows];
        const valuesCopy = [...rowsCopy[rowIndex].values];
        valuesCopy[columnIndex] = value;
        rowsCopy[rowIndex] = { ...rowsCopy[rowIndex], values: valuesCopy };
        form.setData('rows', rowsCopy);
    };

    const save = (event: React.FormEvent) => {
        event.preventDefault();

        form.transform((data) => ({
            columns: data.columns,
            rows: data.rows.map((row, index) => ({
                ...row,
                position: index,
            })),
        }));

        form.put(`/admin/size-guides/${sizeGuideId}/rows`, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('sizeGuides.tableSaveSuccess')),
            onError: () => toast.error(t('sizeGuides.tableSaveFailed')),
        });
    };

    return (
        <form onSubmit={save}>
            <AdminFormSection title={t('sizeGuides.tabTable')}>
                <p className="admin-caption text-admin-secondary -mt-2">
                    {t('sizeGuides.tableHint')}
                </p>

                <div className="space-y-2">
                    <p className="admin-label">
                        {t('sizeGuides.columnsLabel')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {form.data.columns.map((column, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1"
                            >
                                <AdminInputField
                                    label=""
                                    value={column}
                                    onChange={(e) =>
                                        updateColumn(index, e.target.value)
                                    }
                                    className="w-24"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeColumn(index)}
                                    aria-label={t('sizeGuides.removeColumn')}
                                    className="text-admin-secondary hover:text-red-600"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={addColumn}
                    >
                        {t('sizeGuides.addColumn')}
                    </AdminButton>
                </div>

                <div className="space-y-2">
                    <p className="admin-label">{t('sizeGuides.rowsLabel')}</p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr>
                                    {form.data.columns.map((column, index) => (
                                        <th
                                            key={index}
                                            className="admin-caption px-2 pb-2 font-medium"
                                        >
                                            {column || '—'}
                                        </th>
                                    ))}
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {form.data.rows.map((row, rowIndex) => (
                                    <tr key={row.id ?? `new-${rowIndex}`}>
                                        {form.data.columns.map(
                                            (_, columnIndex) => (
                                                <td
                                                    key={columnIndex}
                                                    className="px-2 py-1"
                                                >
                                                    <AdminInputField
                                                        label=""
                                                        value={
                                                            row.values[
                                                                columnIndex
                                                            ] ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            updateRowValue(
                                                                rowIndex,
                                                                columnIndex,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-20"
                                                    />
                                                </td>
                                            ),
                                        )}
                                        <td className="px-2 py-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeRow(rowIndex)
                                                }
                                                aria-label={t(
                                                    'sizeGuides.removeRow',
                                                )}
                                                className="text-admin-secondary hover:text-red-600"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={addRow}
                    >
                        {t('sizeGuides.addRow')}
                    </AdminButton>
                </div>

                <AdminButton type="submit" disabled={form.processing}>
                    {t('sizeGuides.saveTable')}
                </AdminButton>
            </AdminFormSection>
        </form>
    );
}
