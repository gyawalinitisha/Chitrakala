import React from 'react';
import { CheckCircle, Info, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Toast.css';

const Toast = () => {
    const { notification } = useCart();

    if (!notification) return null;

    const icon = notification.type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />;

    return (
        <div className={`toast-container ${notification.type}`}>
            <div className="toast-icon">{icon}</div>
            <div className="toast-message">{notification.message}</div>
            <div className="toast-progress-bar">
                <div className="progress-fill" style={{ animation: 'progressDown 3s linear forwards' }} />
            </div>
        </div>
    );
};

export default Toast;
