import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiTruck, FiArrowRight, FiMail, FiLock } from 'react-icons/fi';
import './Login.css';

// Admin secret: click brand logo 5 times to reveal admin login
const ADMIN_SECRET_CLICKS = 5;

const Login = () => {
    const [step, setStep] = useState('welcome'); // 'welcome' | 'customer' | 'seller' | 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [logoClicks, setLogoClicks] = useState(0);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogoClick = () => {
        const newCount = logoClicks + 1;
        setLogoClicks(newCount);
        if (newCount >= ADMIN_SECRET_CLICKS) {
            setStep('admin');
            setLogoClicks(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            const role = data?.user?.role;

            // Admin can only login via secret admin step
            if (role === 'admin' && step !== 'admin') {
                toast.error('Invalid credentials');
                setLoading(false);
                return;
            }
            // Seller trying to login as customer — redirect to seller panel
            if (role === 'seller' && step === 'customer') {
                toast.success('Welcome back, Seller!');
                navigate('/seller');
                setLoading(false);
                return;
            }

            toast.success('Login successful!');
            if (role === 'admin') navigate('/admin');
            else if (role === 'seller') navigate('/seller');
            else navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
        }
        setLoading(false);
    };

    // ── Welcome Screen ──────────────────────────────────────────────────────
    if (step === 'welcome') {
        return (
            <div className="login-welcome-bg">
                <div className="login-welcome-card">
                    <div className="login-brand">
                        <div className="login-brand-logo" onClick={handleLogoClick} style={{ cursor: 'default', userSelect: 'none' }}>
                            <span className="brand-top">Top</span>
                            <span className="brand-m">M</span>
                            <span className="brand-top">Top</span>
                        </div>
                        <p className="login-brand-sub">Amshine Jewellery Store</p>
                        {logoClicks > 0 && logoClicks < ADMIN_SECRET_CLICKS && (
                            <p style={{ fontSize: '0.7rem', color: '#ccc', marginTop: '2px' }}>
                                {ADMIN_SECRET_CLICKS - logoClicks} more...
                            </p>
                        )}
                    </div>

                    <h2 className="login-welcome-title">Welcome Back!</h2>
                    <p className="login-welcome-desc">Choose how you'd like to sign in</p>

                    <div className="login-role-cards">
                        <button className="role-card customer" onClick={() => setStep('customer')}>
                            <div className="role-card-icon"><FiShoppingBag /></div>
                            <div className="role-card-text">
                                <strong>Customer</strong>
                                <span>Shop jewellery, track orders, manage wishlist</span>
                            </div>
                            <FiArrowRight className="role-card-arrow" />
                        </button>

                        <button className="role-card seller" onClick={() => setStep('seller')}>
                            <div className="role-card-icon"><FiTruck /></div>
                            <div className="role-card-text">
                                <strong>Seller</strong>
                                <span>Manage your products, orders & shop</span>
                            </div>
                            <FiArrowRight className="role-card-arrow" />
                        </button>
                    </div>

                    <div className="login-welcome-footer">
                        <p>New here? <Link to="/register">Create account</Link></p>
                        <p>Want to sell? <Link to="/become-seller">Become a Seller →</Link></p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Admin Secret Login ──────────────────────────────────────────────────
    if (step === 'admin') {
        return (
            <div className="login-welcome-bg" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                <div className="login-form-card">
                    <button className="login-back-btn" onClick={() => setStep('welcome')}>← Back</button>
                    <div className="login-form-icon" style={{ background: '#1a1a2e', color: '#e94560' }}>
                        🔐
                    </div>
                    <h2 style={{ color: '#1a1a2e' }}>Admin Access</h2>
                    <p className="login-form-sub">Restricted — authorized personnel only</p>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <FiMail className="input-icon" />
                            <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <FiLock className="input-icon" />
                            <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="login-submit-btn" style={{ background: '#1a1a2e' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Access Admin Panel'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Customer / Seller Login Form ────────────────────────────────────────
    const isCustomer = step === 'customer';
    return (
        <div className={`login-welcome-bg ${isCustomer ? 'customer-bg' : 'seller-bg'}`}>
            <div className="login-form-card">
                <button className="login-back-btn" onClick={() => setStep('welcome')}>← Back</button>

                <div className={`login-form-icon ${isCustomer ? 'blue' : 'purple'}`}>
                    {isCustomer ? <FiShoppingBag /> : <FiTruck />}
                </div>

                <h2>{isCustomer ? 'Customer Sign In' : 'Seller Sign In'}</h2>
                <p className="login-form-sub">
                    {isCustomer ? 'Welcome back! Shop your favourite jewellery' : 'Access your seller dashboard'}
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button
                        type="submit"
                        className={`login-submit-btn ${isCustomer ? 'btn-blue' : 'btn-purple'}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : `Sign In`}
                    </button>
                </form>

                <div className="login-form-links">
                    <p>Don't have an account? <Link to="/register">{isCustomer ? 'Register as Customer' : 'Register as Seller'}</Link></p>
                    {!isCustomer && <p>Not a seller yet? <Link to="/become-seller">Apply Now →</Link></p>}
                </div>
            </div>
        </div>
    );
};

export default Login;
