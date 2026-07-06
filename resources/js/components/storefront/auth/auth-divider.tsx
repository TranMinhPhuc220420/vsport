type AuthDividerProps = {
    label: string;
};

function AuthDivider({ label }: AuthDividerProps) {
    return (
        <div className="relative my-6">
            <div
                className="absolute inset-0 flex items-center"
                aria-hidden
            >
                <div className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-canvas px-3 text-caption-sm text-mute">
                    {label}
                </span>
            </div>
        </div>
    );
}

export { AuthDivider };
