import React from 'react';
import { cn } from '../../lib/utils';

interface SettingsSectionCardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({
    title,
    description,
    children,
    className
}) => {
    return (
        <div className={cn(
            "rounded-2xl border border-white/5 bg-card p-6 md:p-8 shadow-lg shadow-black/20",
            className
        )}>
            {(title || description) && (
                <div className="mb-6 space-y-1">
                    {title && (
                        <h2 className="text-xl font-semibold text-foreground">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
};

export default SettingsSectionCard;
