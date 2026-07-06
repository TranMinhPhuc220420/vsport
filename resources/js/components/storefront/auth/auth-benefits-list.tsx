import { Check } from 'lucide-react';

type AuthBenefitsListProps = {
    benefits: string[];
};

function AuthBenefitsList({ benefits }: AuthBenefitsListProps) {
    if (benefits.length === 0) {
        return null;
    }

    return (
        <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
                <li
                    key={benefit}
                    className="flex items-start gap-3 text-body-strong text-canvas"
                >
                    <Check
                        className="mt-0.5 size-5 shrink-0 text-canvas"
                        aria-hidden
                    />
                    <span>{benefit}</span>
                </li>
            ))}
        </ul>
    );
}

export { AuthBenefitsList };
