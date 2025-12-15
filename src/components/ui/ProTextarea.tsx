import React from 'react';
import { cn } from '../../lib/utils';

export interface ProTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    containerClassName?: string;
}

const ProTextarea = React.forwardRef<HTMLTextAreaElement, ProTextareaProps>(
    ({ className, label, helperText, containerClassName, id, ...props }, ref) => {
        const generatedId = id || `pro-textarea-${Math.random().toString(36).substr(2, 9)}`;

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

                <textarea
                    id={generatedId}
                    ref={ref}
                    className={cn(
                        "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-200 hover:border-white/20 resize-y",
                        className
                    )}
                    {...props}
                />

                {helperText && (
                    <p className="text-[10px] text-muted-foreground/70 ml-1 leading-tight">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

ProTextarea.displayName = "ProTextarea";

export default ProTextarea;
