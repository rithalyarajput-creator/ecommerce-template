import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiTruck, FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import '../Login/Login.css';
import './Register.css';

const Register = () => {
    const [searchParams] = useSearchParams();
    const defaultType = searchParams.get('type') === 'seller' ? 'seller' : '';
    const [userType, setUserType] = useState(defaultType); // '' | 'customer' | 'seller'
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userType) { toast.error('Please select Customer or Seller'); return; }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.phone);
            toast.success('Account created!');
            if (userType === 'seller') {
                navigate('/become-seller');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    // ── Type selection screen ──────────────────────────────────────────────
    if (!userType) {
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

                    <h2 className="login-welcome-title">Create Account</h2>
                    <p className="login-welcome-desc">Are you a Customer or Seller?</p>

                    <div className="login-role-cards">
                        <button className="role-card customer" onClick={() => setUserType('customer')}>
                            <div className="role-card-icon"><FiShoppingBag /></div>
                            <div className="role-card-text">
                                <strong>Customer</strong>
                                <span>Shop jewellery, track orders, save wishlist</span>
                            </div>
                        </button>

                        <button className="role-card seller" onClick={() => setUserType('seller')}>
                            <div className="role-card-icon"><FiTruck /></div>
                            <div className="role-card-text">
                                <strong>Seller</strong>
                                <span>List products, manage orders, grow business</span>
                            </div>
                        </button>
                    </div>

                    <div className="login-welcome-footer">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Registration Form ──────────────────────────────────────────────────
    const isCustomer = userType === 'customer';
    return (
        <div className={`login-welcome-bg ${isCustomer ? 'customer-bg' : 'seller-bg'}`}>
            <div className="login-form-card">
                <button className="login-back-btn" onClick={() => setUserType('')}>← Back</button>

                <div className={`login-form-icon ${isCustomer ? 'blue' : 'purple'}`}>
                    {isCustomer ? <FiShoppingBag /> : <FiTruck />}
                </div>

                <h2>{isCustomer ? 'Customer Registration' : 'Seller Registration'}</h2>
                <p className="login-form-sub">
                    {isCustomer ? 'Create your shopping account' : 'Create your seller account'}
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FiUser className="input-icon" />
                        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} required minLength={6} />
                    </div>
                    <div className="input-group">
                        <FiPhone className="input-icon" />
                        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
                    </div>

                    <button
                        type="submit"
                        className={`login-submit-btn ${isCustomer ? 'btn-blue' : 'btn-purple'}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : `Register as ${isCustomer ? 'Customer' : 'Seller'}`}
                    </button>
                </form>

                <div className="login-form-links">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
