type ButtonVariant = 'number' | 'operator' | 'action';

interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
    className?: string;     // For slight one off UI changes like col-span-2 on the = btn
}

const variantStyles: Record<ButtonVariant, string> = {
    number: 'bg-gray-700 hover:bg-gray-600 text-white',
    operator: 'bg-amber-500 hover:bg-amber-400 text-white',
    action: 'bg-gray-500 hover:bg-gray-400 text-white',
};

const BASE_STYLES = 'h-14 rounded-lg text-xl font-semibold cursor-pointer select-none active:scale-95 transition-transform';

export function Button({ label, onClick, variant = 'number', className = '' }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`${BASE_STYLES} ${variantStyles[variant]} ${className}`}
        >
            {label}
        </button>
    );
}