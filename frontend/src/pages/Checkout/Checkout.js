import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, getTotal } = useCart();
    const navigate = useNavigate();
    const [form, setForm] = useState({ shipping_address: '', city: '', state: '', pincode: '', phone: '', payment_method: 'cod' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/api/orders.php?action=create', form);
            toast.success('Order placed successfully!');
            navigate('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error placing order');
        }
        setLoading(false);
    };

    if (cartItems.length === 0) { navigate('/cart'); return null; }

    return (
        <div className="checkout-page">
            <h2>Checkout</h2>
            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <h3>Shipping Details</h3>
                    <input name="shipping_address" placeholder="Full Address" value={form.shipping_address} onChange={handleChange} required />
                    <div className="form-row">
                        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
                        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
                    </div>
                    <div className="form-row">
                        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />
                        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
                    </div>
                    <h3>Payment Method</h3>
                    <div className="payment-options">
                        <label><input type="radio" name="payment_method" value="cod" checked={form.payment_method === 'cod'} onChange={handleChange} /> Cash on Delivery</label>
                        <label><input type="radio" name="payment_method" value="online" onChange={handleChange} /> Online Payment</label>
                    </div>
                    <button type="submit" className="btn-place-order" disabled={loading}>{loading ? 'Placing Order...' : 'Place Order'}</button>
                </form>
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    {cartItems.map(item => (
                        <div key={item.id} className="summary-item">
                            <span>{item.name} x {item.quantity}</span>
                            <span>&#8377;{((item.sale_price || item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="summary-total"><span>Total</span><span>&#8377;{getTotal().toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
