import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTag, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, getTotal } = useCart();
    const navigate = useNavigate();
    const [form, setForm] = useState({ shipping_address: '', city: '', state: '', pincode: '', phone: '', payment_method: 'cod' });
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState(() => sessionStorage.getItem('coupon_code') || '');
    const [coupon, setCoupon] = useState(() => {
        const raw = sessionStorage.getItem('coupon_applied');
        return raw ? JSON.parse(raw) : null;
    });
    const [applying, setApplying] = useState(false);

    const subtotal = getTotal();
    const discount = coupon ? parseFloat(coupon.discount_amount) : 0;
    const total = Math.max(0, subtotal - discount);

    // Re-validate the coupon whenever subtotal changes
    useEffect(() => {
        if (coupon && subtotal > 0) {
            API.post('/api/coupons.php?action=validate', { code: coupon.code, subtotal })
                .then(({ data }) => {
                    setCoupon(data);
                    sessionStorage.setItem('coupon_applied', JSON.stringify(data));
                })
                .catch(() => removeCoupon());
        }
        // eslint-disable-next-line
    }, [subtotal]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setApplying(true);
        try {
            const { data } = await API.post('/api/coupons.php?action=validate', { code: couponCode.trim(), subtotal });
            setCoupon(data);
            sessionStorage.setItem('coupon_applied', JSON.stringify(data));
            sessionStorage.setItem('coupon_code', data.code);
            toast.success(`Coupon applied! You saved ₹${data.discount_amount}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
            setCoupon(null);
            sessionStorage.removeItem('coupon_applied');
        }
        setApplying(false);
    };

    const removeCoupon = () => {
        setCoupon(null);
        setCouponCode('');
        sessionStorage.removeItem('coupon_applied');
        sessionStorage.removeItem('coupon_code');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/api/orders.php?action=create', {
                ...form,
                coupon_code: coupon ? coupon.code : ''
            });
            sessionStorage.removeItem('coupon_applied');
            sessionStorage.removeItem('coupon_code');
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
                    <button type="submit" className="btn-place-order" disabled={loading}>{loading ? 'Placing Order...' : `Place Order • ₹${total.toFixed(2)}`}</button>
                </form>
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    {cartItems.map(item => (
                        <div key={item.id} className="summary-item">
                            <span>{item.name} x {item.quantity}</span>
                            <span>&#8377;{((item.sale_price || item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}

                    <div className="coupon-box">
                        <label><FiTag /> Coupon Code</label>
                        {coupon ? (
                            <div className="coupon-applied">
                                <div><strong>{coupon.code}</strong><small>Saved ₹{parseFloat(coupon.discount_amount).toFixed(2)}</small></div>
                                <button type="button" className="btn-remove-coupon" onClick={removeCoupon}><FiX /></button>
                            </div>
                        ) : (
                            <div className="coupon-input">
                                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" />
                                <button type="button" onClick={applyCoupon} disabled={applying || !couponCode.trim()}>{applying ? '...' : 'Apply'}</button>
                            </div>
                        )}
                    </div>

                    <div className="summary-item"><span>Subtotal</span><span>&#8377;{subtotal.toFixed(2)}</span></div>
                    {discount > 0 && (
                        <div className="summary-item" style={{ color: '#388e3c' }}>
                            <span>Discount ({coupon.code})</span>
                            <span>- &#8377;{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="summary-total"><span>Total</span><span>&#8377;{total.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
