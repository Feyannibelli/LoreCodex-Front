import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface SettingsLayoutProps {
    breadcrumbs?: Breadcrumb[];
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    breadcrumbs,
    title,
    description,
    actions,
    children
}) => {
    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <ChevronRight className="h-4 w-4" />}
                                {crumb.href ? (
                                    <Link
                                        to={crumb.href}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-foreground font-medium">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
