import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiTag, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import API, { API_URL } from '../../utils/api';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, getTotal } = useCart();
    const [couponCode, setCouponCode] = useState(() => sessionStorage.getItem('coupon_code') || '');
    const [coupon, setCoupon] = useState(() => {
        const raw = sessionStorage.getItem('coupon_applied');
        return raw ? JSON.parse(raw) : null;
    });
    const [publicCoupons, setPublicCoupons] = useState([]);
    const [applying, setApplying] = useState(false);

    const subtotal = getTotal();
    const discount = coupon ? parseFloat(coupon.discount_amount) : 0;
    const total = Math.max(0, subtotal - discount);

    useEffect(() => {
        API.get('/api/coupons.php?action=public').then(({ data }) => setPublicCoupons(data)).catch(() => {});
    }, []);

    // Re-validate coupon whenever subtotal changes (qty update)
    useEffect(() => {
        if (coupon && subtotal > 0) {
            API.post('/api/coupons.php?action=validate', { code: coupon.code, subtotal })
                .then(({ data }) => {
                    setCoupon(data);
                    sessionStorage.setItem('coupon_applied', JSON.stringify(data));
                })
                .catch(() => { removeCoupon(); });
        }
        // eslint-disable-next-line
    }, [subtotal]);

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
            sessionStorage.removeItem('coupon_code');
        }
        setApplying(false);
    };

    const removeCoupon = () => {
        setCoupon(null);
        setCouponCode('');
        sessionStorage.removeItem('coupon_applied');
        sessionStorage.removeItem('coupon_code');
    };

    if (cartItems.length === 0) return (
        <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart to continue shopping.</p>
            <Link to="/products" className="btn-shop">Continue Shopping</Link>
        </div>
    );

    return (
        <div className="cart-page">
            <h2>Shopping Cart ({cartItems.length} items)</h2>
            <div className="cart-layout">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : 'https://via.placeholder.com/100'} alt={item.name} />
                            <div className="item-info">
                                <Link to={`/product/${item.product_id}`}><h3>{item.name}</h3></Link>
                                <p className="item-price">&#8377;{item.sale_price || item.price}</p>
                            </div>
                            <div className="item-quantity">
                                <button onClick={() => updateQuantity(item.id, parseInt(item.quantity) - 1)}><FiMinus /></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, parseInt(item.quantity) + 1)}><FiPlus /></button>
                            </div>
                            <p className="item-total">&#8377;{((item.sale_price || item.price) * item.quantity).toFixed(2)}</p>
                            <button className="btn-remove" onClick={() => removeFromCart(item.id)}><FiTrash2 /></button>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h3>Order Summary</h3>

                    <div className="coupon-box">
                        <label><FiTag /> Have a coupon?</label>
                        {coupon ? (
                            <div className="coupon-applied">
                                <div>
                                    <strong>{coupon.code}</strong>
                                    <small>{coupon.description || `Saved ₹${coupon.discount_amount}`}</small>
                                </div>
                                <button className="btn-remove-coupon" onClick={removeCoupon} title="Remove"><FiX /></button>
                            </div>
                        ) : (
                            <div className="coupon-input">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                />
                                <button onClick={applyCoupon} disabled={applying || !couponCode.trim()}>{applying ? '...' : 'Apply'}</button>
                            </div>
                        )}

                        {publicCoupons.length > 0 && !coupon && (
                            <div className="coupon-suggestions">
                                <small>Available offers:</small>
                                {publicCoupons.slice(0, 3).map(c => (
                                    <button key={c.code} className="coupon-chip" onClick={() => { setCouponCode(c.code); }}>
                                        <strong>{c.code}</strong>
                                        <span>{c.description || (c.discount_type === 'percent' ? `${c.discount_value}% off` : `₹${c.discount_value} off`)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="summary-row"><span>Subtotal</span><span>&#8377;{subtotal.toFixed(2)}</span></div>
                    {discount > 0 && (
                        <div className="summary-row" style={{ color: '#388e3c' }}>
                            <span>Discount ({coupon.code})</span>
                            <span>- &#8377;{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="summary-row"><span>Shipping</span><span className="free">FREE</span></div>
                    <div className="summary-total"><span>Total</span><span>&#8377;{total.toFixed(2)}</span></div>
                    <Link to="/checkout" className="btn-checkout">Proceed to Checkout</Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
