import React from 'react';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    description?: string;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, description, actions, children }) => (
    <div className="rounded-3xl border border bg-surface shadow-sm">
        <div className="px-8 py-10 space-y-6">
            <div className="space-y-1">
                {subtitle && (
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                        {subtitle}
                    </p>
                )}
                <h1 className="text-4xl font-bold text-text mt-1">{title}</h1>
                {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
            </div>
            {children}
            {actions && (
                <div className="flex flex-wrap gap-3">
                    {actions}
                </div>
            )}
        </div>
    </div>
);

export default PageHero;
