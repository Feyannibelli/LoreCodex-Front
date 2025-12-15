import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
    ({ className, disabled, fullWidth, ...props }, ref) => {
        const baseClasses =
            'inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed';

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

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
