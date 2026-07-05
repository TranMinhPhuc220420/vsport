import { useTranslation } from 'react-i18next';

import { RichTextRenderer } from '@/components/rich-text-renderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SizeGuide } from '@/types/catalog';

type SizeGuideDisclosureProps = {
    sizeGuide: SizeGuide;
};

function SizeGuideDisclosure({ sizeGuide }: SizeGuideDisclosureProps) {
    const { t } = useTranslation('storefront');

    const hasMeasureContent = Boolean(
        sizeGuide.measureContentHtml || sizeGuide.measureImageUrl,
    );

    return (
        <Tabs defaultValue="conversion">
            <TabsList>
                <TabsTrigger value="conversion">
                    {t('pdp.sizeGuideConversionTab')}
                </TabsTrigger>
                {hasMeasureContent ? (
                    <TabsTrigger value="measure">
                        {t('pdp.sizeGuideMeasureTab')}
                    </TabsTrigger>
                ) : null}
            </TabsList>

            <TabsContent value="conversion">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-caption-md">
                        <thead>
                            <tr className="border-b border-hairline">
                                {sizeGuide.columns.map((column) => (
                                    <th
                                        key={column}
                                        className="py-2 pr-4 font-bold text-ink"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sizeGuide.rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-hairline last:border-0"
                                >
                                    {row.values.map((value, index) => (
                                        <td
                                            key={`${row.id}-${index}`}
                                            className="py-2 pr-4 text-mute"
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TabsContent>

            {hasMeasureContent ? (
                <TabsContent value="measure" className="space-y-4">
                    <RichTextRenderer
                        html={sizeGuide.measureContentHtml}
                        className="text-body-md text-ink"
                    />
                    {sizeGuide.measureImageUrl ? (
                        <img
                            src={sizeGuide.measureImageUrl}
                            alt={sizeGuide.measureImageAlt ?? ''}
                            className="w-full rounded-md"
                        />
                    ) : null}
                </TabsContent>
            ) : null}
        </Tabs>
    );
}

export { SizeGuideDisclosure };
