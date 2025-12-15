import React from 'react';
import { cn } from '../../lib/utils';

interface SettingsFormFieldProps {
    label: string;
    description?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

const SettingsFormField: React.FC<SettingsFormFieldProps> = ({
    label,
    description,
    error,
    required,
    children,
    className
}) => {
    return (
        <div className={cn("space-y-2", className)}>
            <label className="block">
                <span className="text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="ml-1 text-primary">*</span>}
                </span>
                {description && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                        {description}
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

export default SettingsFormField;
