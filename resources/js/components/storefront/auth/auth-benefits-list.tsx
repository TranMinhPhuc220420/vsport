import { Check } from 'lucide-react';

type AuthBenefitsListProps = {
    benefits: string[];
};

function AuthBenefitsList({ benefits }: AuthBenefitsListProps) {
    if (benefits.length === 0) {
        return null;
    }

    return (
        <ul className="mt-8 space-y-3 rounded-sm border border-canvas/15 bg-ink/25 p-5 backdrop-blur-sm">
            {benefits.map((benefit) => (
                <li
                    key={benefit}
                    className="flex items-start gap-3 text-body-strong text-canvas drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
                >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-canvas/15">
                        <Check
                            className="size-3 text-canvas"
                            aria-hidden
                        />
                    </span>
                    <span>{benefit}</span>
                </li>
            ))}
        </ul>
    );
}

export { AuthBenefitsList };
