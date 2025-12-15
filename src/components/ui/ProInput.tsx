import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ProInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    icon?: LucideIcon;
    containerClassName?: string;
}

const ProInput = React.forwardRef<HTMLInputElement, ProInputProps>(
    ({ className, label, helperText, icon: Icon, containerClassName, id, ...props }, ref) => {
        const generatedId = id || `pro-input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={cn("space-y-1.5", containerClassName)}>
                {label && (
                    <label
                        htmlFor={generatedId}
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1"
                    >
                        {label} {props.required && <span className="text-primary">*</span>}
                    </label>
                )}

                <div className="relative group">
                    {Icon && (
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    )}

                    <input
                        id={generatedId}
                        ref={ref}
                        className={cn(
                            "flex h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "transition-all duration-200 hover:border-white/20",
                            Icon && "pl-10",
                            className
                        )}
                        {...props}
                    />
                </div>

                {helperText && (
                    <p className="text-[10px] text-muted-foreground/70 ml-1 leading-tight">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

ProInput.displayName = "ProInput";

export default ProInput;
