import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className = '',
    type = 'button',
    to = null
}) => {
    const classes = `btn btn-${variant} btn-${size} ${className}`;

    if (to) {
        return (
            <Link to={to} className={classes}>
                <span className="btn-content">{children}</span>
                <span className="btn-glare"></span>
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
        >
            <span className="btn-content">{children}</span>
            <span className="btn-glare"></span>
        </button>
    );
};

export default Button;
