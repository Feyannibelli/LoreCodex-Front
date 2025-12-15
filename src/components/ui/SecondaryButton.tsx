import React from 'react';
import Button, { ButtonProps } from '../Button';

interface SecondaryButtonProps extends ButtonProps {
    fullWidth?: boolean;
}

const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
    ({ className, fullWidth, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant="secondary"
                className={`${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
                {...props}
            />
        );
    }
);

SecondaryButton.displayName = 'SecondaryButton';

export default SecondaryButton;
