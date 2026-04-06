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
const IC = {
  trash:  'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6',
  tag:    'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01',
  check:  'M20 6L9 17l-5-5',
  arrow:  'M5 12h14M12 5l7 7-7 7',
  back:   'M19 12H5M12 19l-7-7 7-7',
  info:   'M12 16v-4M12 8h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z',
  x:      'M18 6L6 18M6 6l12 12',
  truck:  'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  lock:   'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  cod:    'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  online: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  gift:   'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '', city: '', state: '' });
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

  useEffect(() => {
    fetch(`${API_BASE}/coupons/active`)
      .then(r => r.json())
      .then(d => setAvailableCoupons(d?.data || []))
      .catch(() => {});
  }, []);

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name required';
    if (!form.phone.trim() || form.phone.length < 10) err.phone = 'Valid phone required';
    if (!form.address.trim()) err.address = 'Address required';
    if (!form.pincode.trim() || form.pincode.length < 6) err.pincode = 'Valid pincode required';
    if (!form.city.trim()) err.city = 'City required';
    setFormErr(err);
    return Object.keys(err).length === 0;
  };

  const applyCoupon = async (code) => {
    const applyCode = (code || couponCode).trim().toUpperCase();
    if (!applyCode) return;
    setCouponLoading(true); setCouponError(''); setCouponData(null);
    try {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyCode, orderAmount: cartTotal }),
      });
      const data = await res.json();
      if (data?.success) { setCouponData(data.data); setCouponCode(applyCode); }
      else setCouponError(data?.message || 'Invalid coupon');
    } catch { setCouponError('Failed to apply coupon'); }
    finally { setCouponLoading(false); }
  };

  const doPlaceOrder = async () => {
    if (!validate()) { document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' }); return; }
    setPlacing(true);
    try {
      const currentToken = token || localStorage.getItem('amshine_token');
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
        body: JSON.stringify({
          items: cart.map(item => ({ product: item._id || item.id, quantity: item.quantity })),
          shippingAddress: { name: form.name, phone: form.phone, address: form.address, city: form.city, pincode: form.pincode, state: form.state || 'India' },
          paymentMethod,
          couponCode: couponData?.code || null,
          discount,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        clearCart();
        setOrderPlaced('#' + (data?.data?._id || Date.now()).toString().slice(-8).toUpperCase());
      } else {
        alert(data?.message || 'Order failed. Please try again.');
      }
    } catch { alert('Server error. Please try again.'); }
    finally { setPlacing(false); }
  };

  const handlePlaceOrder = () => { if (!user) setShowAuth(true); else doPlaceOrder(); };
  const onAuthSuccess = () => { setShowAuth(false); setTimeout(() => doPlaceOrder(), 400); };

  // ── Order Placed ──
  if (orderPlaced) return (
    <div>
      <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:440 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:600, color:'var(--maroon)', marginBottom:8 }}>Order Placed!</h2>
          <p style={{ color:'#6B7280', marginBottom:6, fontSize:15 }}>Order ID: <strong style={{ color:'var(--text-dark)' }}>{orderPlaced}</strong></p>
          <p style={{ color:'#6B7280', fontSize:14, marginBottom:8 }}>Payment: <strong>{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong></p>
          <p style={{ color:'#6B7280', fontSize:13, marginBottom:32 }}>We will contact you shortly to confirm your delivery.</p>
          <Link to="/products" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 32px', background:'var(--maroon)', color:'#fff', borderRadius:8, textDecoration:'none', fontWeight:600, fontSize:14 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── Empty Cart ──
  if (cart.length === 0) return (
    <div>
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ textAlign:'center' }}>
          <svg style={{ opacity:.25, marginBottom:16 }} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, color:'var(--text-dark)', marginBottom:8 }}>Your cart is empty</h2>
          <p style={{ color:'#9CA3AF', marginBottom:24 }}>Let us find something beautiful for you!</p>
          <Link to="/products" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', background:'var(--maroon)', color:'#fff', borderRadius:8, textDecoration:'none', fontWeight:600 }}>
            Start Shopping
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
        .cp{max-width:860px;margin:0 auto;padding:80px 24px 80px;font-family:'Jost',sans-serif;}
        .cp-title{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:600;color:var(--maroon);margin:0 0 32px;display:flex;align-items:center;gap:12px;}
        .cp-badge{background:var(--maroon);color:#fff;border-radius:999px;padding:2px 12px;font-size:14px;font-weight:700;font-family:'Jost',sans-serif;}
        /* Cart items */
        .cp-items{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:24px;}
        .cp-item{display:grid;grid-template-columns:80px 1fr auto;gap:16px;padding:20px 24px;border-bottom:1px solid #F5EDD8;align-items:center;}
        .cp-item:last-child{border-bottom:none;}
        .cp-img{width:80px;height:80px;object-fit:cover;border-radius:10px;cursor:pointer;border:1px solid var(--border);}
        .cp-info{min-width:0;}
        .cp-cat{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;font-weight:600;}
        .cp-name{font-size:14px;font-weight:600;color:var(--text-dark);cursor:pointer;margin-bottom:6px;line-height:1.4;}
        .cp-name:hover{color:var(--maroon);}
        .cp-price{font-size:15px;font-weight:700;color:var(--maroon);}
        .cp-was{font-size:12px;color:#9CA3AF;text-decoration:line-through;margin-left:6px;}
        .cp-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;}
        .cp-qty{display:flex;align-items:center;border:1.5px solid var(--border);border-radius:8px;overflow:hidden;}
        .cp-qty button{width:30px;height:30px;background:#FDFAF5;border:none;cursor:pointer;font-size:16px;font-weight:700;color:var(--maroon);transition:background .15s;}
        .cp-qty button:hover:not(:disabled){background:var(--cream2);}
        .cp-qty button:disabled{opacity:.35;cursor:not-allowed;}
        .cp-qty span{width:34px;text-align:center;font-size:14px;font-weight:600;border-left:1.5px solid var(--border);border-right:1.5px solid var(--border);line-height:30px;}
        .cp-subtotal{font-size:14px;font-weight:700;color:var(--text-dark);}
        .cp-rm{background:none;border:none;color:#ccc;cursor:pointer;padding:2px;border-radius:4px;transition:color .15s;display:flex;align-items:center;}
        .cp-rm:hover{color:#EF4444;}
        .cp-clearrow{display:flex;justify-content:flex-end;padding:10px 24px;border-top:1px solid #F5EDD8;}
        .cp-clearbtn{display:flex;align-items:center;gap:5px;background:none;border:none;color:#9CA3AF;font-size:12px;cursor:pointer;font-family:inherit;padding:5px 8px;border-radius:6px;transition:all .15s;}
        .cp-clearbtn:hover{background:#FEF2F2;color:#DC2626;}
        /* Summary bar */
        .cp-sumbar{background:var(--cream);border:1px solid var(--border);border-radius:12px;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:24px;}
        .cp-sumbar-item{text-align:center;}
        .cp-sumbar-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin-bottom:3px;}
        .cp-sumbar-val{font-size:16px;font-weight:700;color:var(--text-dark);}
        .cp-sumbar-val.green{color:#16a34a;}
        .cp-sumbar-val.maroon{color:var(--maroon);}
        /* Checkout form */
        .cp-checkout{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;}
        .cp-section{padding:24px 28px;border-bottom:1px solid #F5EDD8;}
        .cp-section:last-child{border-bottom:none;}
        .cp-sec-title{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--text-muted);margin:0 0 16px;}
        /* Coupon */
        .cp-coupon-row{display:flex;gap:10px;margin-bottom:10px;}
        .cp-cin{flex:1;border:1.5px solid var(--border);border-radius:8px;padding:10px 14px;font-size:13px;font-family:inherit;outline:none;text-transform:uppercase;letter-spacing:1px;color:var(--text-dark);background:#fff;transition:border .2s;}
        .cp-cin:focus{border-color:var(--gold);}
        .cp-capply{padding:10px 20px;background:var(--maroon);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:background .2s;}
        .cp-capply:hover:not(:disabled){background:var(--maroon-light);}
        .cp-capply:disabled{opacity:.6;cursor:not-allowed;}
        .cp-csuccess{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;}
        .cp-cerr{font-size:12px;color:#DC2626;margin-top:4px;}
        .avcard{border:1.5px dashed #D4B896;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all .2s;background:#fff;margin-top:8px;position:relative;overflow:hidden;}
        .avcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--gold);border-radius:4px 0 0 4px;}
        .avcard:hover{border-color:var(--gold);background:#FEF9EE;}
        .avcode{font-size:12px;font-weight:800;color:var(--maroon);letter-spacing:1px;font-family:monospace;background:#FEF3C7;padding:3px 8px;border-radius:5px;flex-shrink:0;}
        /* Payment */
        .cp-pay-opts{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(max-width:480px){.cp-pay-opts{grid-template-columns:1fr;}}
        .cp-pay-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:all .2s;}
        .cp-pay-opt.sel{border-color:var(--maroon);background:#FDF6EF;}
        .cp-pay-opt:hover:not(.sel){border-color:#D4B896;}
        .cp-pay-dot{width:16px;height:16px;border-radius:50%;border:2px solid #D4B896;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .cp-pay-opt.sel .cp-pay-dot{border-color:var(--maroon);}
        .cp-pay-inner{width:8px;height:8px;border-radius:50%;background:var(--maroon);display:none;}
        .cp-pay-opt.sel .cp-pay-inner{display:block;}
        /* Address grid */
        .cp-addr-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(max-width:540px){.cp-addr-grid{grid-template-columns:1fr;}}
        .cp-field{display:flex;flex-direction:column;gap:5px;}
        .cp-field.full{grid-column:1/-1;}
        .cp-flabel{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);}
        .cp-finput{border:1.5px solid var(--border);border-radius:8px;padding:10px 14px;font-size:14px;font-family:inherit;outline:none;color:var(--text-dark);background:#FDFAF5;transition:border .2s;}
        .cp-finput:focus{border-color:var(--gold);background:#fff;}
        .cp-finput.err{border-color:#EF4444;}
        .cp-ferr{font-size:11px;color:#EF4444;}
        /* Total & Place Order */
        .cp-total-row{display:flex;justify-content:space-between;font-size:22px;font-weight:700;color:var(--text-dark);margin-bottom:20px;align-items:center;}
        .cp-total-row span:last-child{color:var(--maroon);font-family:'Cormorant Garamond',serif;font-size:28px;}
        .cp-place-btn{width:100%;padding:16px;background:var(--maroon);color:var(--gold-pale);border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s;letter-spacing:1px;}
        .cp-place-btn:hover:not(:disabled){background:var(--maroon-light);}
        .cp-place-btn:disabled{opacity:.7;cursor:not-allowed;}
        @media(max-width:600px){
          .cp{padding:70px 14px 60px;}
          .cp-item{grid-template-columns:68px 1fr;gap:12px;}
          .cp-right{flex-direction:row;align-items:center;grid-column:1/-1;}
          .cp-section{padding:18px 16px;}
          .cp-sumbar{justify-content:space-around;}
        }
      `}</style>

      <div className="cp">
        {/* Breadcrumb */}
        <nav style={{ fontSize:13, color:'#9CA3AF', marginBottom:20 }}>
          <Link to="/" style={{ color:'#9CA3AF', textDecoration:'none' }}>Home</Link>
          <span style={{ margin:'0 8px' }}>/</span>
          <span style={{ color:'var(--text-dark)', fontWeight:600 }}>Cart</span>
        </nav>

        <h1 className="cp-title">
          Shopping Cart <span className="cp-badge">{cart.reduce((s,i)=>s+i.quantity,0)}</span>
        </h1>

        {/* ── Cart Items ── */}
        <div className="cp-items">
          {cart.map(item => (
            <div key={item.id} className="cp-item">
              <img src={item.image} alt={item.title} className="cp-img"
                onClick={() => navigate(`/products/${item._id || item.id}`)}
                onError={e => { e.target.src='https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=200'; }} />
              <div className="cp-info">
                {item.category && <div className="cp-cat">{typeof item.category === 'object' ? item.category?.name : item.category}</div>}
                <div className="cp-name" onClick={() => navigate(`/products/${item._id || item.id}`)}>{item.title}</div>
                <div>
                  <span className="cp-price">₹{item.price?.toLocaleString()}</span>
                  {item.comparePrice > item.price && <span className="cp-was">₹{item.comparePrice?.toLocaleString()}</span>}
                </div>
              </div>
              <div className="cp-right">
                <div className="cp-qty">
                  <button onClick={() => updateQuantity(item.id, item.quantity-1)} disabled={item.quantity<=1}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity+1)} disabled={item.quantity>=10}>+</button>
                </div>
                <span className="cp-subtotal">₹{(item.price*item.quantity).toLocaleString()}</span>
                <button className="cp-rm" onClick={() => removeFromCart(item.id)} title="Remove">
                  <Icon d={IC.x} size={16} />
                </button>
              </div>
            </div>
          ))}
          <div className="cp-clearrow">
            <button className="cp-clearbtn" onClick={clearCart}><Icon d={IC.trash} size={13} /> Clear Cart</button>
          </div>
        </div>

        {/* ── Order Summary Bar ── */}
        <div className="cp-sumbar">
          <div className="cp-sumbar-item">
            <div className="cp-sumbar-label">Subtotal</div>
            <div className="cp-sumbar-val">₹{cartTotal.toLocaleString()}</div>
          </div>
          <div className="cp-sumbar-item">
            <div className="cp-sumbar-label">Shipping</div>
            <div className={`cp-sumbar-val ${shipping===0?'green':''}`}>{shipping===0 ? 'FREE' : `₹${shipping}`}</div>
          </div>
          {couponData && (
            <div className="cp-sumbar-item">
              <div className="cp-sumbar-label">Discount</div>
              <div className="cp-sumbar-val green">−₹{discount.toLocaleString()}</div>
            </div>
          )}
          <div className="cp-sumbar-item">
            <div className="cp-sumbar-label">Total</div>
            <div className="cp-sumbar-val maroon" style={{ fontSize:20 }}>₹{total.toLocaleString()}</div>
          </div>
          {cartTotal < 5000 && (
            <div style={{ fontSize:12, color:'var(--gold)', background:'#FEF9C3', padding:'6px 14px', borderRadius:8, display:'flex', alignItems:'center', gap:6 }}>
              <Icon d={IC.truck} size={13}/> Add ₹{(5000-cartTotal).toLocaleString()} more for FREE shipping!
            </div>
          )}
        </div>

        {/* ── Checkout Form ── */}
        <div className="cp-checkout" id="checkout-form">

          {/* Coupon */}
          <div className="cp-section">
            <div className="cp-sec-title">🎁 Apply Coupon</div>
            {couponData ? (
              <div className="cp-csuccess">
                <div style={{ fontWeight:700, color:'#16a34a', fontSize:14 }}>✓ {couponData.code} — You save ₹{discount.toLocaleString()}</div>
                <button onClick={() => { setCouponData(null); setCouponCode(''); setCouponError(''); }}
                  style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', padding:4 }}>
                  <Icon d={IC.x} size={16}/>
                </button>
              </div>
            ) : (
              <>
                <div className="cp-coupon-row">
                  <input value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    placeholder="ENTER COUPON CODE" className="cp-cin"
                    onKeyDown={e => e.key==='Enter' && applyCoupon()} />
                  <button onClick={() => applyCoupon()} disabled={couponLoading||!couponCode.trim()} className="cp-capply">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <div className="cp-cerr">⚠ {couponError}</div>}
              </>
            )}
            {availableCoupons.length > 0 && !couponData && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', fontWeight:700, marginBottom:4 }}>Available Offers</div>
                {availableCoupons.map(c => (
                  <div key={c._id} className="avcard" onClick={() => { setCouponCode(c.code); applyCoupon(c.code); }}>
                    <span className="avcode">{c.code}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--text-dark)' }}>
                        {c.type==='percentage' ? `${c.value}% off` : `₹${c.value} off`}
                        {c.description && ` — ${c.description}`}
                      </div>
                      {c.minOrder > 0 && <div style={{ fontSize:11, color:'#9CA3AF' }}>Min order ₹{c.minOrder}</div>}
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--gold)', background:'#FEF3C7', border:'none', padding:'4px 10px', borderRadius:6, cursor:'pointer' }}>Apply</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="cp-section">
            <div className="cp-sec-title">💳 Payment Method</div>
            <div className="cp-pay-opts">
              {[
                { v:'COD',    label:'Cash on Delivery', desc:'Pay when delivered', bg:'#F0FDF4', ic:IC.cod },
                { v:'ONLINE', label:'Online Payment',   desc:'UPI / Card / Net Banking', bg:'#EFF6FF', ic:IC.online },
              ].map(opt => (
                <div key={opt.v} className={`cp-pay-opt${paymentMethod===opt.v?' sel':''}`} onClick={() => setPaymentMethod(opt.v)}>
                  <div className="cp-pay-dot"><div className="cp-pay-inner"/></div>
                  <div style={{ width:34, height:34, borderRadius:8, background:opt.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon d={opt.ic} size={16}/>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-dark)' }}>{opt.label}</div>
                    <div style={{ fontSize:11, color:'#9CA3AF' }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="cp-section">
            <div className="cp-sec-title">📦 Delivery Address</div>
            <div className="cp-addr-grid">
              <div className="cp-field">
                <label className="cp-flabel">Full Name *</label>
                <input value={form.name} onChange={e => setForm(v=>({...v,name:e.target.value}))}
                  placeholder="Your full name" className={`cp-finput${formErr.name?' err':''}`}/>
                {formErr.name && <span className="cp-ferr">{formErr.name}</span>}
              </div>
              <div className="cp-field">
                <label className="cp-flabel">Phone *</label>
                <input value={form.phone} onChange={e => setForm(v=>({...v,phone:e.target.value}))}
                  placeholder="10-digit mobile number" className={`cp-finput${formErr.phone?' err':''}`}/>
                {formErr.phone && <span className="cp-ferr">{formErr.phone}</span>}
              </div>
              <div className="cp-field full">
                <label className="cp-flabel">Address *</label>
                <input value={form.address} onChange={e => setForm(v=>({...v,address:e.target.value}))}
                  placeholder="House / Street / Area" className={`cp-finput${formErr.address?' err':''}`}/>
                {formErr.address && <span className="cp-ferr">{formErr.address}</span>}
              </div>
              <div className="cp-field">
                <label className="cp-flabel">Pincode *</label>
                <input value={form.pincode} onChange={e => setForm(v=>({...v,pincode:e.target.value}))}
                  placeholder="6-digit pincode" maxLength={6} className={`cp-finput${formErr.pincode?' err':''}`}/>
                {formErr.pincode && <span className="cp-ferr">{formErr.pincode}</span>}
              </div>
              <div className="cp-field">
                <label className="cp-flabel">City *</label>
                <input value={form.city} onChange={e => setForm(v=>({...v,city:e.target.value}))}
                  placeholder="City" className={`cp-finput${formErr.city?' err':''}`}/>
                {formErr.city && <span className="cp-ferr">{formErr.city}</span>}
              </div>
              <div className="cp-field">
                <label className="cp-flabel">State</label>
                <input value={form.state} onChange={e => setForm(v=>({...v,state:e.target.value}))}
                  placeholder="State" className="cp-finput"/>
              </div>
            </div>
          </div>

          {/* Place Order */}
          <div className="cp-section">
            <div className="cp-total-row">
              <span>Total Amount</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className="cp-place-btn" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : (
                <>
                  {!user && <Icon d={IC.lock} size={16}/>}
                  {user ? `Place Order — ₹${total.toLocaleString()}` : 'Login & Place Order'}
                  {!placing && <Icon d={IC.arrow} size={16}/>}
                </>
              )}
            </button>
            <div style={{ textAlign:'center', marginTop:14 }}>
              <Link to="/products" style={{ color:'#9CA3AF', fontSize:13, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                <Icon d={IC.back} size={13}/> Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
