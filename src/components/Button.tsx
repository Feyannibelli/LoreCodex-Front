import React from 'react'
import '../css/Button.css';


interface ButtonProps {
    onClick?: () => void
    children: React.ReactNode
    type?: 'button' | 'submit' | 'reset'
    className?: string
}

const Button: React.FC<ButtonProps> = ({ onClick, children, type = 'button', className }) => {
    return (
        <button type={type} onClick={onClick} className={`custom-button ${className || ''}`}>
            {children}
        </button>
    )
}

export default Button
