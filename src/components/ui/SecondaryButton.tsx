import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean;
}

const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
    ({ className, disabled, fullWidth, ...props }, ref) => {
        const baseClasses =
            'inline-flex items-center justify-center rounded-2xl border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10';

        const widthClass = fullWidth ? 'w-full justify-center' : '';

        return (
            <button
                ref={ref}
                disabled={disabled}
                className={`${baseClasses} ${widthClass} ${className ?? ''}`}
                {...props}
            />
        );
    }
);

SecondaryButton.displayName = 'SecondaryButton';

export default SecondaryButton;
