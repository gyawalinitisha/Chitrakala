import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Trash2, ShoppingBag, Shield, Lock, CheckCircle } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (user?.role === 'admin') {
        return (
            <div className="page-content container cart-page empty-state">
                <div className="cart-orb-1"></div>
                <div className="cart-orb-2"></div>
                <div className="empty-cart-icon">
                    <Shield size={52} />
                </div>
                <h1>Admin Account</h1>
                <p>Admin accounts cannot make purchases. Use the Admin Console to manage the platform.</p>
                <Button to="/admin" variant="primary">Go to Admin Console</Button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="page-content container cart-page empty-state">
                {/* Background decorations */}
                <div className="cart-orb-1"></div>
                <div className="cart-orb-2"></div>

                <div className="empty-cart-icon">
                    <ShoppingBag size={52} />
                </div>
                <h1>Your Cart is Empty</h1>
                <p>You haven't added any artworks yet. Explore our gallery and find something beautiful!</p>
                <Button to="/gallery" variant="primary">Browse Gallery</Button>
            </div>
        );
    }

    return (
        <div className="page-content container cart-page">
            {/* Background decorations */}
            <div className="cart-orb-1"></div>
            <div className="cart-orb-2"></div>

            {/* Header */}
            <div className="cart-header">
                <span className="cart-header-label">✦ Your Selection</span>
                <h1 className="cart-title">Your Cart</h1>
                <p className="cart-item-count">{cartItems.length} artwork{cartItems.length !== 1 ? 's' : ''} ready to be yours</p>
            </div>

            <div className="cart-divider"></div>

            <div className="cart-grid">
                {/* Items List */}
                <div className="cart-items">
                    {cartItems.map((item) => {
                        if (!item) return null;
                        
                        // Handle artist as string or object
                        const artistName = typeof item.artist === 'string' ? item.artist : item.artist?.name || 'Unknown Artist';
                        // Handle price formatting
                        const displayPrice = typeof item.price === 'number' ? `NPR ${item.price.toLocaleString('en-IN')}` : item.price;
                        // Use _id from API or id from localStorage
                        const itemId = item._id || item.id;
                        
                        return (
                            <div key={itemId} className="cart-item">
                                <img
                                src={item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23222"%2F%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="11" font-family="sans-serif"%3ENo image%3C%2Ftext%3E%3C%2Fsvg%3E'}
                                alt={item.title}
                                className="cart-item-image"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23222"%2F%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="11" font-family="sans-serif"%3ENo image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                            />
                                <div className="cart-item-details">
                                    <h3>{item.title}</h3>
                                    <p className="cart-item-artist">by {artistName}</p>
                                    <p className="cart-item-price">{displayPrice}</p>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(itemId)}
                                    title="Remove from cart"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="cart-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>NPR {(Number(cartTotal) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span style={{ color: '#4ade80' }}>Calculated at checkout</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>NPR {(Number(cartTotal) || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <button className="khalti-btn" onClick={handleCheckout}>
                        Proceed to Checkout →
                    </button>

                    {/* Security Badges */}
                    <div className="cart-secure-badges">
                        <div className="secure-badge">
                            <Shield size={13} />
                            <span>Secure</span>
                        </div>
                        <div className="secure-badge">
                            <Lock size={13} />
                            <span>Encrypted</span>
                        </div>
                        <div className="secure-badge">
                            <CheckCircle size={13} />
                            <span>Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
