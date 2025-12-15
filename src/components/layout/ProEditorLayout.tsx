import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface ProEditorLayoutProps {
    breadcrumbs: BreadcrumbItem[];
    title: string;
    actions?: React.ReactNode;
    status?: 'saved' | 'unsaved' | 'saving';
    children: React.ReactNode;
    className?: string;
}

const ProEditorLayout: React.FC<ProEditorLayoutProps> = ({
    breadcrumbs,
    title,
    actions,
    status,
    children,
    className
}) => {
    const [isScrolled, setIsScrolled] = useState(false);

    // Track scrolling to show shadow/glass effect on header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Sticky Header */}
            <header className={cn(
                "sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all duration-200",
                isScrolled && "shadow-xl shadow-black/10 border-white/10"
            )}>
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Left: Breadcrumbs & Title */}
                    <div className="flex flex-col gap-0.5">
                        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                            {breadcrumbs.map((item, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                                    {item.href ? (
                                        <Link to={item.href} className="hover:text-primary transition-colors">
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="text-foreground font-medium">{item.label}</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-bold tracking-tight text-foreground/90">
                                {title}
                            </h1>
                            {status && (
                                <span className={cn(
                                    "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm",
                                    status === 'unsaved' && "bg-yellow-500/10 text-yellow-500",
                                    status === 'saved' && "bg-green-500/10 text-green-500",
                                    status === 'saving' && "bg-blue-500/10 text-blue-500 animate-pulse"
                                )}>
                                    {status === 'unsaved' ? 'Unsaved Changes' : status === 'saving' ? 'Saving...' : 'All Saved'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={cn("mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", className)}>
                {children}
            </main>

            {/* Mobile Sticky Action Bar (visible only on small screens) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-xl p-4 md:hidden">
                <div className="flex items-center justify-between gap-4">
                    {status && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {status === 'saving' && <Save className="h-3 w-3 animate-pulse" />}
                            {status === 'unsaved' ? 'Unsaved' : status === 'saving' ? 'Saving...' : 'Saved'}
                        </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto w-full justify-end">
                        {actions}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProEditorLayout;
