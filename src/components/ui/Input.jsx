import React from 'react';
import './Input.css';

const Input = ({ label, type = 'text', placeholder, id, ...props }) => {
    return (
        <div className="input-group">
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input
                id={id}
                type={type}
                className="input-field"
                placeholder={placeholder}
                {...props}
            />
            <div className="input-line"></div>
        </div>
    );
};

export default Input;
