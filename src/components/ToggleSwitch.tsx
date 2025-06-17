// src/components/ToggleSwitch.tsx
import React from 'react';

interface ToggleSwitchProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
                                                       id,
                                                       checked,
                                                       onChange,
                                                       disabled = false,
                                                       label,
                                                       description
                                                   }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                {label && (
                    <label htmlFor={id} className="text-lg font-medium text-[#0C0C0C] dark:text-white">
                        {label}
                    </label>
                )}
                {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {description}
                    </p>
                )}
            </div>

            <div className="flex items-center">
                <div className="relative">
                    <input
                        type="checkbox"
                        id={id}
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={disabled}
                        className="sr-only"
                    />
                    <div
                        className={`w-14 h-7 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                            checked
                                ? 'bg-[#f47e00]'
                                : 'bg-gray-300 dark:bg-gray-600'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !disabled && onChange(!checked)}
                    >
                        <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                checked ? 'translate-x-7' : 'translate-x-0.5'
                            } mt-0.5`}
                        />
                    </div>
                </div>
                <span className="ml-3 text-sm font-medium text-[#0C0C0C] dark:text-white">
                    {checked ? 'On' : 'Off'}
                </span>
            </div>
        </div>
    );
};

export default ToggleSwitch;