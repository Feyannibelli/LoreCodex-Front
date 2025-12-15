import React from 'react'
import { cn } from '../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300/50 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
        accent: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 focus:ring-destructive",
        outline: "border border-border bg-transparent hover:bg-surface-2 text-text hover:text-text focus:ring-brand-300/50",
        secondary: "bg-surface-2 text-text hover:bg-surface-2/80 active:bg-surface-2/90",
        ghost: "hover:bg-surface-2 text-text focus:ring-brand-300/50",
        link: "text-brand-500 underline-offset-4 hover:underline hover:text-brand-600 focus:ring-brand-300/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
