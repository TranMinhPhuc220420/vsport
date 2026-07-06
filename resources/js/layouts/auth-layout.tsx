import AuthLayoutTemplate from '@/layouts/auth/auth-storefront-layout';

export default function AuthLayout({
    title = '',
    description = '',
    editorialHeadline,
    editorialImage,
    editorialBenefits,
    children,
}: {
    title?: string;
    description?: string;
    editorialHeadline?: string;
    editorialImage?: string | null;
    editorialBenefits?: string[];
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
            editorialHeadline={editorialHeadline}
            editorialImage={editorialImage}
            editorialBenefits={editorialBenefits}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
