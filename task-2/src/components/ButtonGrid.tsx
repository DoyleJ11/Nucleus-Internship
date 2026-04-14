import { Button } from "./Button";

interface ButtonGridProps {
    onAppend: (value: string) => void;
    onClear: () => void;
    onDelete: () => void;
    onCalculate: () => void;
}

const buttonRows = [
    [{ label: 'C', action: 'clear', variant: 'action' }, { label: '(', value: '(', variant: 'number' }, { label: ')', value: ')', variant: 'number' }, { label: 'DEL', action: 'delete', variant: 'action' }],
    [{ label: '7', value: '7', variant: 'number' }, { label: '8', value: '8', variant: 'number' }, { label: '9', value: '9', variant: 'number' }, { label: '/', value: '/', variant: 'operator' }],
    [{ label: '4', value: '4', variant: 'number' }, { label: '5', value: '5', variant: 'number' }, { label: '6', value: '6', variant: 'number' }, { label: '*', value: '*', variant: 'operator' }],
    [{ label: '1', value: '1', variant: 'number' }, { label: '2', value: '2', variant: 'number' }, { label: '3', value: '3', variant: 'number' }, { label: '-', value: '-', variant: 'operator' }],
    [{ label: '0', value: '0', variant: 'number' }, { label: '.', value: '.', variant: 'number' }, { label: '=', action: 'calculate', variant: 'action' }, { label: '+', value: '+', variant: 'operator' }],
]

export function ButtonGrid({ onAppend, onClear, onDelete, onCalculate }: ButtonGridProps) {
    function handleClick(button: (typeof buttonRows)[number][number]) {
        if ('value' in button && button.value !== undefined) {
            onAppend(button.value);
        } else if (button.action === 'clear') {
            onClear();
        } else if (button.action === 'delete') {
            onDelete();
        } else if (button.action === 'calculate') {
            onCalculate();
        }
    }

    return (
        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-800 rounded-b-xl">
            {buttonRows.map((row) =>
                row.map((button) => (
                    <Button
                        key={button.label}
                        label={button.label}
                        variant={button.variant as 'number' | 'operator' | 'action'}
                        onClick={() => handleClick(button)}
                    />
                ))
            )}
        </div>
    );
}