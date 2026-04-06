import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shippingDetails, setShippingDetails] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        address: '',
        city: '',
        phone: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('Khalti');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return navigate('/gallery');
        }

        if (!shippingDetails.address || !shippingDetails.city || !shippingDetails.phone) {
            alert('Please fill in all shipping details.');
            return;
        }

        setIsProcessing(true);

        try {
            const token = localStorage.getItem('token');
            
            // Create order using backend API
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    artworks: cartItems.filter(item => item !== null).map(item => item._id || item.id),
                    totalAmount: cartTotal,
                    deliveryDetails: {
                        name:    shippingDetails.fullName,
                        address: shippingDetails.address,
                        city:    shippingDetails.city,
                        phone:   shippingDetails.phone,
                    },
                    paymentMethod
                })
            });

            if (response.ok) {
                const order = await response.json();
                console.log("Order created successfully:", order);
                alert(`Payment Successful via ${paymentMethod}!\n\nThank you ${shippingDetails.fullName} for your order.\nYour artwork will be shipped to: ${shippingDetails.address}, ${shippingDetails.city}`);
                clearCart();
                navigate('/profile'); // Redirect to profile to see orders
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'Failed to create order'}`);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Error processing payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (user?.role === 'admin') {
        return (
            <div className="page-content container checkout-page">
                <h2 style={{ textAlign: 'center', marginTop: '4rem', color: '#666' }}>Admin accounts cannot make purchases.</h2>
                <button onClick={() => navigate('/admin')} className="place-order-btn" style={{width: '200px', margin: '2rem auto', display: 'block'}}>Go to Admin Console</button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="page-content container checkout-page">
                <h2>Your cart is empty.</h2>
                <button onClick={() => navigate('/gallery')} className="place-order-btn" style={{width: '200px'}}>Return Home</button>
            </div>
        );
    }

    return (
        <div className="page-content container checkout-page">
            <h1 className="section-title">Checkout</h1>
            <p className="section-subtitle">Complete your purchase</p>

            <div className="checkout-grid">
                <div className="checkout-form-container glass-card">
                    <form className="checkout-form" onSubmit={handlePlaceOrder}>
                        <h2>Shipping Information</h2>
                        
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="fullName" value={shippingDetails.fullName} onChange={handleInputChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={shippingDetails.email} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={shippingDetails.phone} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label>Street Address</label>
                            <input type="text" name="address" value={shippingDetails.address} onChange={handleInputChange} placeholder="E.g., 123 Heritage Marg" required />
                        </div>
                        
                        <div className="form-group">
                            <label>City / District</label>
                            <input type="text" name="city" value={shippingDetails.city} onChange={handleInputChange} placeholder="E.g., Kathmandu" required />
                        </div>

                        <h2 style={{marginTop: '2rem'}}>Payment Method</h2>
                        <div className="payment-methods">
                            <div 
                                className={`payment-method ${paymentMethod === 'Khalti' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('Khalti')}
                            >
                                <h3>Khalti</h3>
                                <p style={{fontSize: '0.8rem', opacity: 0.7}}>Pay Online via Wallet</p>
                            </div>
                            <div 
                                className={`payment-method ${paymentMethod === 'COD' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('COD')}
                            >
                                <h3>Cash on Delivery</h3>
                                <p style={{fontSize: '0.8rem', opacity: 0.7}}>Pay when you receive</p>
                            </div>
                        </div>

                        <button type="submit" className="place-order-btn" disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : paymentMethod === 'COD' ? `Place Order — NPR ${cartTotal.toLocaleString('en-IN')}` : `Pay via Khalti — NPR ${cartTotal.toLocaleString('en-IN')}`}
                        </button>
                    </form>
                </div>

                <div className="order-summary-checkout glass-card">
                    <h2>Order Summary</h2>
                    <div className="summary-items">
                        {cartItems.map((item) => {
                            if (!item) return null;
                            const itemPrice = typeof item.price === 'number'
                                ? item.price.toLocaleString('en-IN')
                                : item.price;
                            return (
                                <div key={item._id || item.id} className="summary-item">
                                    <img
                                        src={item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23222"%2F%3E%3C%2Fsvg%3E'}
                                        alt={item.title}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23222"%2F%3E%3C%2Fsvg%3E'; }}
                                    />
                                    <div className="summary-item-details">
                                        <h4>{item.title}</h4>
                                        <p>NPR {itemPrice}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="summary-totals">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>NPR {cartTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>NPR 1,000</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>NPR {(cartTotal + 1000).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
