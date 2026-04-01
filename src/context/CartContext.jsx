import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

// Load cart from localStorage at initialization (before any render or effect)
const loadCartFromStorage = () => {
    try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            const parsed = JSON.parse(storedCart);
            if (Array.isArray(parsed)) {
                return parsed.filter(i => i !== null);
            }
        }
    } catch (err) {
        console.error("Failed to parse cart:", err);
        localStorage.removeItem('cart');
    }
    return [];
};

export const CartProvider = ({ children }) => {
    // Lazy initialization — reads localStorage once, before any effects run
    const [cartItems, setCartItems] = useState(loadCartFromStorage);
    const [notification, setNotification] = useState(null);
    const { user, loading } = useAuth();
    const isInitialMount = useRef(true);

    // Clear cart only on actual logout (not on initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (!loading && !user) {
            setCartItems([]);
            localStorage.removeItem('cart');
        }
    }, [user, loading]);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const addToCart = (item) => {
        if (!item) return;
        const existing = cartItems.find(i => i && String(i._id || i.id) === String(item._id || item.id));
        if (existing) {
            showNotification(`"${item.title}" is already in your collection!`, 'info');
            return;
        }
        setCartItems(prev => [...prev, item]);
        showNotification(`"${item.title}" added to your collection!`, 'success');
    };

    const removeFromCart = (itemId) => {
        const item = cartItems.find(i => i && String(i._id || i.id) === String(itemId));
        if (item) {
            showNotification(`Removed "${item.title}" from your collection.`, 'info');
        }
        setCartItems(prev => prev.filter(i => i && String(i._id || i.id) !== String(itemId)));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => {
        if (!item) return total;
        let price = item.price;
        if (typeof price === 'string') {
            price = parseFloat(price.replace(/[^0-9.-]+/g, ""));
        }
        return total + (Number(price) || 0);
    }, 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        notification
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
