import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiTruck, FiArrowRight, FiMail, FiLock } from 'react-icons/fi';
import './Login.css';

const Login = () => {
    const [step, setStep] = useState('welcome'); // 'welcome' | 'customer' | 'seller'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            toast.success('Login successful!');
            const role = data?.user?.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'seller') navigate('/seller');
            else navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
        }
        setLoading(false);
    };

    if (step === 'welcome') {
        return (
            <div className="login-welcome-bg">
                <div className="login-welcome-card">
                    <div className="login-brand">
                        <div className="login-brand-logo">
                            <span className="brand-top">Top</span>
                            <span className="brand-m">M</span>
                            <span className="brand-top">Top</span>
                        </div>
                        <p className="login-brand-sub">Amshine Jewellery Store</p>
                    </div>

                    <h2 className="login-welcome-title">Welcome! Who are you?</h2>
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
                                <span>List products, manage orders, grow business</span>
                            </div>
                            <FiArrowRight className="role-card-arrow" />
                        </button>
                    </div>

                    <div className="login-welcome-footer">
                        <p>New here? <Link to="/register">Create account</Link></p>
                        <p>Want to sell on TopMTop? <Link to="/become-seller">Become a Seller →</Link></p>
                    </div>
                </div>
            </div>
        );
    }

    const isCustomer = step === 'customer';
    return (
        <div className={`login-welcome-bg ${isCustomer ? 'customer-bg' : 'seller-bg'}`}>
            <div className="login-form-card">
                <button className="login-back-btn" onClick={() => setStep('welcome')}>
                    ← Back
                </button>

                <div className={`login-form-icon ${isCustomer ? 'blue' : 'purple'}`}>
                    {isCustomer ? <FiShoppingBag /> : <FiTruck />}
                </div>

                <h2>{isCustomer ? 'Customer Login' : 'Seller Login'}</h2>
                <p className="login-form-sub">
                    {isCustomer ? 'Sign in to shop & track orders' : 'Access your seller dashboard'}
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`login-submit-btn ${isCustomer ? 'btn-blue' : 'btn-purple'}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : `Sign In as ${isCustomer ? 'Customer' : 'Seller'}`}
                    </button>
                </form>

                <div className="login-form-links">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                    {!isCustomer && <p>Not a seller yet? <Link to="/become-seller">Apply Now →</Link></p>}
                </div>
            </div>
        </div>
    );
};

export default Login;
