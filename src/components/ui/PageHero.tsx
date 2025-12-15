import React from 'react';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    description?: string;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, description, actions, children }) => (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm" style={{ background: 'var(--page-gradient)' }}>
        <div className="px-8 py-10 space-y-6">
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{subtitle ?? 'LoreCodex'}</p>
                <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
                {description && <p className="text-base text-slate-600">{description}</p>}
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
