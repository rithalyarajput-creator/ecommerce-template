import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/AuthModal/AuthModal';

const API_BASE = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  trash:   'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6',
  tag:     'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01',
  check:   'M20 6L9 17l-5-5',
  arrow:   'M5 12h14M12 5l7 7-7 7',
  back:    'M19 12H5M12 19l-7-7 7-7',
  gift:    'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',
  info:    'M12 16v-4M12 8h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z',
  x:       'M18 6L6 18M6 6l12 12',
  truck:   'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  lock:    'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  cod:     'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  online:  'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  percent: 'M19 5L5 19M9 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM20 17.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [form, setForm] = useState({ address: '', pincode: '', city: '', state: '' });
  const [formErr, setFormErr] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const shipping = cartTotal >= 5000 ? 0 : 99;
  const discount = couponData?.discount || 0;
  const total = cartTotal + shipping - discount;
  const getCatName = (cat) => typeof cat === 'object' ? cat?.name || '' : cat || '';

  useEffect(() => {
    fetch(`${API_BASE}/coupons`).then(r => r.json()).then(data => {
      const list = data?.data || data?.coupons || [];
      const now = new Date(); setAvailableCoupons(list.filter(c => c.isActive !== false && (!c.expiryDate || new Date(c.expiryDate) > now)));
    }).catch(() => {});
  }, []);

  const validate = () => {
    const err = {};
    if (!form.address.trim()) err.address = 'Address required';
    if (!form.pincode.trim() || form.pincode.length < 6) err.pincode = 'Valid pincode required';
    if (!form.city.trim()) err.city = 'City required';
    setFormErr(err);
    return Object.keys(err).length === 0;
  };

  const applyCoupon = async (code) => {
    const applyCode = (code || couponCode).trim();
    if (!applyCode) return;
    setCouponLoading(true); setCouponError(''); setCouponData(null);
    try {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyCode.toUpperCase(), orderAmount: cartTotal }),
      });
      const data = await res.json();
      if (data?.success) { setCouponData(data.data); setCouponCode(applyCode.toUpperCase()); }
      else { setCouponError(data?.message || 'Invalid coupon'); }
    } catch { setCouponError('Failed to apply coupon'); }
    finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponData(null); setCouponCode(''); setCouponError(''); };

  const doPlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map(item => ({ product: item.id, quantity: item.quantity })),
          shippingAddress: { street: form.address, city: form.city, pincode: form.pincode, state: form.state || 'India', country: 'India' },
          paymentMethod, couponCode: couponData?.code || null, discount,
        }),
      });
      const data = await res.json();
      if (data?.success) { clearCart(); setOrderPlaced('#' + (data?.data?._id || Date.now()).toString().slice(-8).toUpperCase()); }
      else alert(data?.message || 'Order failed. Please try again.');
    } catch { alert('Server error. Please try again.'); }
    setPlacing(false);
  };

  const handlePlaceOrder = () => { if (!user) setShowAuth(true); else doPlaceOrder(); };
  const onAuthSuccess = () => { setShowAuth(false); setTimeout(() => doPlaceOrder(), 300); };

  if (orderPlaced) return (
    <div>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Icon d={ICONS.check} size={32} />
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 600, color: '#1C0A00', marginBottom: 8 }}>Order Placed!</h2>
          <p style={{ color: '#6B7280', marginBottom: 6 }}>Order ID: <strong style={{ color: '#1C0A00' }}>{orderPlaced}</strong></p>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Payment: <strong>{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong></p>
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6B1A2A', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Continue Shopping <Icon d={ICONS.arrow} size={14} />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (cart.length === 0) return (
    <div>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <svg style={{ opacity: 0.25, marginBottom: 16 }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6B1A2A" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#1C0A00', marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ color: '#9CA3AF', marginBottom: 24 }}>Let us find something beautiful for you!</p>
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#6B1A2A', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
            Start Shopping <Icon d={ICONS.arrow} size={14} />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={onAuthSuccess} />
      <style>{`
        .cart-pg{max-width:1180px;margin:0 auto;padding:32px 24px 80px;font-family:'Jost','Segoe UI',sans-serif}
        .cart-pg h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:600;color:#1C0A00;margin:0 0 28px;display:flex;align-items:center;gap:12px}
        .cart-badge{background:#6B1A2A;color:#fff;border-radius:999px;padding:2px 10px;font-size:14px;font-weight:700;font-family:'Jost',sans-serif}
        .cart-grid{display:grid;grid-template-columns:1fr 380px;gap:28px;align-items:start}
        @media(max-width:900px){.cart-grid{grid-template-columns:1fr}}
        .cart-items-box{background:#fff;border:1px solid #EDE4D4;border-radius:16px;overflow:hidden}
        .ci{display:flex;gap:16px;padding:20px 24px;border-bottom:1px solid #F5EDD8;transition:background .15s}
        .ci:last-child{border-bottom:none}
        .ci:hover{background:#FDFAF5}
        .ci-img{width:88px;height:88px;object-fit:cover;border-radius:10px;cursor:pointer;flex-shrink:0;border:1px solid #EDE4D4}
        .ci-body{flex:1;min-width:0}
        .ci-cat{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B8860B;margin-bottom:4px}
        .ci-title{font-size:14px;font-weight:600;color:#1C0A00;line-height:1.4;margin-bottom:6px;cursor:pointer}
        .ci-title:hover{color:#6B1A2A}
        .ci-prices{display:flex;align-items:center;gap:8px;margin-bottom:12px}
        .ci-price{font-size:16px;font-weight:700;color:#6B1A2A}
        .ci-compare{font-size:13px;color:#9CA3AF;text-decoration:line-through}
        .ci-footer{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
        .ci-qty{display:flex;align-items:center;border:1.5px solid #EDE4D4;border-radius:8px;overflow:hidden}
        .ci-qty button{width:32px;height:32px;background:#FDFAF5;border:none;cursor:pointer;font-size:16px;color:#6B1A2A;font-weight:700;transition:background .15s}
        .ci-qty button:hover:not(:disabled){background:#F5EDD8}
        .ci-qty button:disabled{opacity:.35;cursor:not-allowed}
        .ci-qty span{width:36px;text-align:center;font-size:14px;font-weight:600;color:#1C0A00;border-left:1.5px solid #EDE4D4;border-right:1.5px solid #EDE4D4;line-height:32px}
        .ci-subtotal{font-size:14px;font-weight:700;color:#1C0A00;margin-left:auto}
        .ci-remove{display:flex;align-items:center;gap:5px;background:none;border:none;color:#9CA3AF;font-size:12px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all .15s;font-family:inherit}
        .ci-remove:hover{background:#FEF2F2;color:#DC2626}
        .cart-clear{display:flex;justify-content:flex-end;padding:12px 24px;border-top:1px solid #F5EDD8}
        .cart-clear-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:#9CA3AF;font-size:12px;cursor:pointer;font-family:inherit;padding:6px 10px;border-radius:6px;transition:all .15s}
        .cart-clear-btn:hover{background:#FEF2F2;color:#DC2626}
        .cs-box{background:#fff;border:1px solid #EDE4D4;border-radius:16px;padding:24px;position:sticky;top:100px}
        .cs-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:#1C0A00;margin:0 0 20px;padding-bottom:16px;border-bottom:1px solid #F5EDD8}
        .cs-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px;color:#6B7280}
        .cs-divider{height:1px;background:#F5EDD8;margin:14px 0}
        .cs-total-row{display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#1C0A00;margin-bottom:20px}
        /* Coupon */
        .coupon-section{background:#FDFAF5;border:1px solid #EDE4D4;border-radius:12px;padding:16px;margin-bottom:16px}
        .coupon-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B8860B;display:flex;align-items:center;gap:6px;margin-bottom:12px}
        .coupon-input-row{display:flex;gap:8px;margin-bottom:10px}
        .coupon-input{flex:1;border:1.5px solid #EDE4D4;border-radius:8px;padding:10px 14px;font-size:13px;font-family:inherit;outline:none;text-transform:uppercase;letter-spacing:1px;color:#1C0A00;background:#fff;transition:border .2s}
        .coupon-input:focus{border-color:#B8860B}
        .coupon-apply-btn{padding:10px 18px;background:#6B1A2A;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:background .2s;white-space:nowrap}
        .coupon-apply-btn:hover:not(:disabled){background:#8B2A3A}
        .coupon-apply-btn:disabled{opacity:.6;cursor:not-allowed}
        .coupon-success{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
        .coupon-error{font-size:12px;color:#DC2626;margin-bottom:8px;display:flex;align-items:center;gap:4px}
        /* Available coupons */
        .avail-title{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6B7280;margin-bottom:8px;display:flex;align-items:center;gap:5px}
        .avail-list{display:flex;flex-direction:column;gap:7px}
        .avail-card{border:1.5px dashed #D4B896;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all .2s;background:#fff;position:relative;overflow:hidden}
        .avail-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:#B8860B;border-radius:4px 0 0 4px}
        .avail-card:hover{border-color:#B8860B;background:#FEF9EE;transform:translateY(-1px);box-shadow:0 3px 12px rgba(184,134,11,0.12)}
        .avail-code{font-size:12px;font-weight:800;color:#6B1A2A;letter-spacing:1px;font-family:monospace;background:#FEF3C7;padding:3px 8px;border-radius:5px;flex-shrink:0}
        .avail-info{flex:1;min-width:0}
        .avail-discount{font-size:13px;font-weight:700;color:#1C0A00}
        .avail-min{font-size:11px;color:#9CA3AF;margin-top:1px}
        .avail-apply-btn{font-size:11px;font-weight:700;color:#B8860B;white-space:nowrap;background:#FEF3C7;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:inherit}
        /* Payment */
        .pay-section{margin-bottom:16px}
        .pay-title{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9CA3AF;margin:0 0 10px;display:block}
        .pay-options{display:flex;flex-direction:column;gap:8px}
        .pay-option{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid #EDE4D4;border-radius:10px;cursor:pointer;transition:all .2s}
        .pay-option.selected{border-color:#6B1A2A;background:#FDF6EF}
        .pay-option:hover:not(.selected){border-color:#D4B896;background:#FDFAF5}
        .pay-radio{width:16px;height:16px;border-radius:50%;border:2px solid #D4B896;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
        .pay-option.selected .pay-radio{border-color:#6B1A2A}
        .pay-radio-dot{width:8px;height:8px;border-radius:50%;background:#6B1A2A;display:none}
        .pay-option.selected .pay-radio-dot{display:block}
        .pay-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .pay-name{font-size:13px;font-weight:600;color:#1C0A00}
        .pay-desc{font-size:11px;color:#9CA3AF;margin-top:1px}
        /* Address */
        .addr-title{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9CA3AF;margin:0 0 14px;display:block}
        .addr-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
        .addr-field{display:flex;flex-direction:column;gap:4px}
        .addr-field.full{grid-column:1/-1}
        .addr-label{font-size:11px;font-weight:600;color:#6B7280;letter-spacing:.5px;text-transform:uppercase}
        .addr-input{border:1.5px solid #EDE4D4;border-radius:8px;padding:9px 12px;font-size:13px;font-family:inherit;outline:none;color:#1C0A00;transition:border .2s;background:#FDFAF5}
        .addr-input:focus{border-color:#B8860B;background:#fff}
        .addr-input.err{border-color:#EF4444}
        .addr-err{font-size:11px;color:#EF4444}
        .place-btn{width:100%;padding:14px;background:#6B1A2A;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s;margin-bottom:12px}
        .place-btn:hover:not(:disabled){background:#8B2A3A}
        .place-btn:disabled{opacity:.7;cursor:not-allowed}
        .cont-link{display:flex;align-items:center;justify-content:center;gap:6px;color:#9CA3AF;font-size:13px;text-decoration:none}
        .cont-link:hover{color:#6B1A2A}
        .ship-note{font-size:12px;color:#B8860B;background:#FEF9C3;padding:8px 12px;border-radius:8px;margin:8px 0;display:flex;align-items:center;gap:6px}
      `}</style>

      <div className="cart-pg">
        <nav style={{ display:'flex', gap:8, alignItems:'center', fontSize:13, color:'#9CA3AF', marginBottom:20 }}>
          <Link to="/" style={{ color:'#9CA3AF', textDecoration:'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color:'#1C0A00', fontWeight:600 }}>Cart</span>
        </nav>
        <h1>Shopping Cart <span className="cart-badge">{cart.reduce((s,i)=>s+i.quantity,0)}</span></h1>

        <div className="cart-grid">
          {/* Left: Items */}
          <div>
            <div className="cart-items-box">
              {cart.map(item => (
                <div key={item.id} className="ci">
                  <img src={item.image} alt={item.title} className="ci-img"
                    onClick={() => navigate(`/products/${item.id}`)}
                    onError={e => { e.target.src='https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=200'; }} />
                  <div className="ci-body">
                    {item.category && <div className="ci-cat">{getCatName(item.category)}</div>}
                    <div className="ci-title" onClick={() => navigate(`/products/${item.id}`)}>{item.title}</div>
                    <div className="ci-prices">
                      <span className="ci-price">&#8377;{item.price?.toLocaleString()}</span>
                      {item.comparePrice > item.price && <span className="ci-compare">&#8377;{item.comparePrice?.toLocaleString()}</span>}
                    </div>
                    <div className="ci-footer">
                      <div className="ci-qty">
                        <button onClick={() => updateQuantity(item.id, item.quantity-1)} disabled={item.quantity<=1}>&#8722;</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity+1)} disabled={item.quantity>=10}>&#43;</button>
                      </div>
                      <span className="ci-subtotal">&#8377;{(item.price*item.quantity).toLocaleString()}</span>
                      <button className="ci-remove" onClick={() => removeFromCart(item.id)}>
                        <Icon d={ICONS.trash} size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="cart-clear">
                <button className="cart-clear-btn" onClick={clearCart}>
                  <Icon d={ICONS.trash} size={13} /> Clear cart
                </button>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="cs-box">
            <h2 className="cs-title">Order Summary</h2>
            <div className="cs-row">
              <span>Subtotal ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
              <span style={{ color:'#1C0A00', fontWeight:600 }}>&#8377;{cartTotal.toLocaleString()}</span>
            </div>
            <div className="cs-row">
              <span>Shipping</span>
              <span style={{ color: shipping===0 ? '#16A34A' : '#1C0A00', fontWeight:600 }}>
                {shipping===0 ? 'FREE' : `\u20B9${shipping}`}
              </span>
            </div>
            {couponData && (
              <div className="cs-row" style={{ color:'#16A34A', fontWeight:600 }}>
                <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <Icon d={ICONS.tag} size={13} /> Coupon ({couponData.code})
                </span>
                <span>&#8722; &#8377;{discount.toLocaleString()}</span>
              </div>
            )}
            {cartTotal < 5000 && (
              <div className="ship-note">
                <Icon d={ICONS.truck} size={13} />
                Add &#8377;{(5000-cartTotal).toLocaleString()} more for free shipping!
              </div>
            )}
            <div className="cs-divider" />
            <div className="cs-total-row">
              <span>Total</span>
              <span style={{ color:'#6B1A2A' }}>&#8377;{total.toLocaleString()}</span>
            </div>

            {/* ── Coupon Section ── */}
            <div className="coupon-section">
              <div className="coupon-label"><Icon d={ICONS.tag} size={13} /> Apply Coupon</div>

              {couponData ? (
                <div className="coupon-success">
                  <div>
                    <div style={{ fontWeight:700, color:'#16A34A', fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
                      <Icon d={ICONS.check} size={14} /> {couponData.code} applied!
                    </div>
                    <div style={{ fontSize:12, color:'#16A34A', marginTop:2 }}>You save &#8377;{discount.toLocaleString()}</div>
                  </div>
                  <button onClick={removeCoupon} style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', padding:4, borderRadius:6 }}>
                    <Icon d={ICONS.x} size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="coupon-input-row">
                    <input value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder="ENTER CODE" className="coupon-input"
                      onKeyDown={e => e.key==='Enter' && applyCoupon()} />
                    <button onClick={() => applyCoupon()} disabled={couponLoading||!couponCode.trim()} className="coupon-apply-btn">
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <div className="coupon-error"><Icon d={ICONS.info} size={12} /> {couponError}</div>}
                </>
              )}

              {/* Available Coupons — always visible */}
              {availableCoupons.length > 0 && !couponData && (
                <div style={{ marginTop: couponData ? 0 : 4 }}>
                  <div className="avail-title">
                    <Icon d={ICONS.gift} size={12} /> Available Offers
                  </div>
                  <div className="avail-list">
                    {availableCoupons.map(c => (
                      <div key={c._id} className="avail-card" onClick={() => { setCouponCode(c.code); applyCoupon(c.code); }}>
                        <span className="avail-code">{c.code}</span>
                        <div className="avail-info">
                          <div className="avail-discount">
                            {c.discountType==='percentage' ? `${c.discountValue}% off` : `\u20B9${c.discountValue} off`}
                          </div>
                          {c.minOrderAmount > 0 && <div className="avail-min">Min order \u20B9{c.minOrderAmount}</div>}
                        </div>
                        <button className="avail-apply-btn">Apply</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Payment Method ── */}
            <div className="pay-section">
              <span className="pay-title">Payment Method</span>
              <div className="pay-options">
                {[
                  { value:'COD', name:'Cash on Delivery', desc:'Pay when your order arrives', icon: ICONS.cod, bg:'#F0FDF4', iconColor:'#16A34A' },
                  { value:'ONLINE', name:'Online Payment', desc:'UPI, Card, Net Banking', icon: ICONS.online, bg:'#EFF6FF', iconColor:'#3B82F6' },
                ].map(opt => (
                  <div key={opt.value} className={`pay-option${paymentMethod===opt.value?' selected':''}`} onClick={() => setPaymentMethod(opt.value)}>
                    <div className="pay-radio"><div className="pay-radio-dot" /></div>
                    <div className="pay-icon" style={{ background: opt.bg }}>
                      <Icon d={opt.icon} size={16} />
                    </div>
                    <div>
                      <div className="pay-name">{opt.name}</div>
                      <div className="pay-desc">{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Address ── */}
            <span className="addr-title">Delivery Address</span>
            <div className="addr-grid">
              <div className="addr-field full">
                <label className="addr-label">Address *</label>
                <input placeholder="House / Street / Area" value={form.address}
                  onChange={e => setForm(v=>({...v,address:e.target.value}))}
                  className={`addr-input${formErr.address?' err':''}`} />
                {formErr.address && <span className="addr-err">{formErr.address}</span>}
              </div>
              <div className="addr-field">
                <label className="addr-label">Pincode *</label>
                <input placeholder="6-digit pincode" value={form.pincode}
                  onChange={e => setForm(v=>({...v,pincode:e.target.value}))}
                  className={`addr-input${formErr.pincode?' err':''}`} />
                {formErr.pincode && <span className="addr-err">{formErr.pincode}</span>}
              </div>
              <div className="addr-field">
                <label className="addr-label">City *</label>
                <input placeholder="City" value={form.city}
                  onChange={e => setForm(v=>({...v,city:e.target.value}))}
                  className={`addr-input${formErr.city?' err':''}`} />
                {formErr.city && <span className="addr-err">{formErr.city}</span>}
              </div>
              <div className="addr-field full">
                <label className="addr-label">State</label>
                <input placeholder="State" value={form.state}
                  onChange={e => setForm(v=>({...v,state:e.target.value}))}
                  className="addr-input" />
              </div>
            </div>

            <button className="place-btn" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : (
                <>
                  {!user && <Icon d={ICONS.lock} size={15} />}
                  {user ? `Place Order \u2014 \u20B9${total.toLocaleString()}` : 'Login & Place Order'}
                  {!placing && <Icon d={ICONS.arrow} size={15} />}
                </>
              )}
            </button>
            <Link to="/products" className="cont-link">
              <Icon d={ICONS.back} size={13} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Cart;