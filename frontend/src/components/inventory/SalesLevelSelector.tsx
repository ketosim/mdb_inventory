import React from 'react';

interface SalesLevelOption {
    level: number;
    label: string;
    description: string;
}

const SALES_LEVELS: SalesLevelOption[] = [
    {
        level: 40000,
        label: 'Default',
        description: 'Normal sales level (40k)'
    },
    {
        level: 32000,
        label: 'Low',
        description: 'Quiet period (32k)'
    },
    {
        level: 50000,
        label: 'High',
        description: 'Busy period (50k)'
    }
];

interface Props {
    onSelect: (level: number) => void;
}

const SalesLevelSelector: React.FC<Props> = ({ onSelect }) => {
    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Start Inventory Count</h1>
            <div className="space-y-4">
                {SALES_LEVELS.map((option) => (
                    <button
                        key={option.level}
                        onClick={() => onSelect(option.level)}
                        className="w-full p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
                    >
                        <div className="font-semibold text-lg">{option.label}</div>
                        <div className="text-gray-600">{option.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SalesLevelSelector;