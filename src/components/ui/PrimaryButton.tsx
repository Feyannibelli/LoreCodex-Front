import React from 'react';
import Button, { ButtonProps } from '../Button';

interface PrimaryButtonProps extends ButtonProps {
    fullWidth?: boolean;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
    ({ className, fullWidth, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant="default"
                className={`${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
                {...props}
            />
        );
    }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
