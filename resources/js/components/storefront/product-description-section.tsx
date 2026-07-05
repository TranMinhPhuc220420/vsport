import { RichTextRenderer } from '@/components/rich-text-renderer';

type ProductDescriptionSectionProps = {
    descriptionHtml?: string | null;
    description?: string | null;
};

export function ProductDescriptionSection({
    descriptionHtml,
    description,
}: ProductDescriptionSectionProps) {
    if (!descriptionHtml && !description) {
        return null;
    }

    return (
        <RichTextRenderer
            html={descriptionHtml}
            fallbackText={description}
            className="text-body-md text-ink"
        />
    );
}
