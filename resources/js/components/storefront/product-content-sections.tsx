import { PdpDisclosure } from '@/components/storefront/pdp-disclosure';
import { RichTextRenderer } from '@/components/rich-text-renderer';
import type { ProductContentSection } from '@/types/catalog';

type ProductContentSectionsProps = {
    sections?: ProductContentSection[];
};

export function ProductContentSections({
    sections = [],
}: ProductContentSectionsProps) {
    if (sections.length === 0) {
        return null;
    }

    return (
        <div className="border-t border-hairline">
            {sections.map((section) => (
                <PdpDisclosure key={section.id} title={section.title}>
                    <div className="grid gap-8 desktop:grid-cols-2 desktop:gap-10">
                        <div className="desktop:sticky desktop:top-24 desktop:self-start">
                            {(section.images?.length ?? 0) > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {section.images?.map((image) => (
                                        <img
                                            key={image.id}
                                            src={image.url}
                                            alt={
                                                image.alt ?? section.title
                                            }
                                            className="w-full rounded-lg object-cover"
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className="min-w-0">
                            <RichTextRenderer
                                html={section.contentHtml}
                                fallbackText={section.content}
                                className="text-body-md text-ink"
                            />
                        </div>
                    </div>
                </PdpDisclosure>
            ))}
        </div>
    );
}
