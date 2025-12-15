import React from 'react';
import Button from './Button';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-border p-4">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-muted-foreground leading-relaxed">{message}</p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border bg-secondary/20 p-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;