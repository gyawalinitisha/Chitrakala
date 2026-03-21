import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                const parsed = JSON.parse(storedCart);
                if (Array.isArray(parsed)) {
                    setCartItems(parsed);
                }
            }
        } catch (err) {
            console.error("Failed to parse cart:", err);
            localStorage.removeItem('cart');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        const existing = cartItems.find(i => String(i._id || i.id) === String(item._id || item.id));
        if (existing) {
            showNotification(`"${item.title}" is already in your collection!`, 'info');
            return;
        }

        setCartItems(prev => [...prev, item]);
        showNotification(`"${item.title}" added to your collection!`, 'success');
    };

    const removeFromCart = (itemId) => {
        const item = cartItems.find(i => String(i._id || i.id) === String(itemId));
        if (item) {
            showNotification(`Removed "${item.title}" from your collection.`, 'info');
        }
        setCartItems(prev => prev.filter(i => String(i._id || i.id) !== String(itemId)));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => {
        let price = item.price;
        if (typeof price === 'string') {
            // Remove text and commas, eg: "NPR 45,000" -> 45000
            price = parseFloat(price.replace(/[^0-9.-]+/g, ""));
        }
        return total + (price || 0);
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
