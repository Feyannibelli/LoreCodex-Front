import React from 'react';
import '../css/Modal.css';
import Button from './Button';

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
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-content">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <Button onClick={onClose} className="cancel-button">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} className="confirm-button">
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;