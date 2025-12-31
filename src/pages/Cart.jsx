import React from 'react';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import { Trash2 } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();

    const handleCheckout = () => {
        // Placeholder for Khalti integration
        console.log('Initiating Khalti payment for amount:', cartTotal);
        alert(`Checkout initiated! Total: NRP ${cartTotal}\n(Khalti Integration Placeholder)`);
        clearCart(); // Simulate successful payment
    };

    if (cartItems.length === 0) {
        return (
            <div className="page-content container cart-page empty-state">
                <h1>Your Cart</h1>
                <p>Your cart is empty. Start exploring artworks!</p>
                <Button to="/gallery" variant="primary">Browse Gallery</Button>
            </div>
        );
    }

    return (
        <div className="page-content container cart-page">
            <h1 className="cart-title">Your Cart</h1>

            <div className="cart-grid">
                <div className="cart-items">
                    {cartItems.map((item) => (
                        <div key={item.id} className="cart-item glass-card">
                            <img src={item.image} alt={item.title} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3>{item.title}</h3>
                                <p className="text-gold">NRP {item.price}</p>
                            </div>
                            <button
                                className="remove-btn"
                                onClick={() => removeFromCart(item.id)}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary glass-card">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>NRP {cartTotal}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>NRP {cartTotal}</span>
                    </div>

                    <button className="khalti-btn" onClick={handleCheckout}>
                        Pay with Khalti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
