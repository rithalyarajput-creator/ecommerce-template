import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiTruck, FiPackage, FiDollarSign, FiTrendingUp, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import './BecomeSeller.css';

const BecomeSeller = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(user ? 'form' : 'intro');
    const [loading, setLoading] = useState(false);

    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });

    const emptyForm = { shop_name: '', shop_description: '', phone: user?.phone || '', whatsapp: '', address: '', city: '', state: '', pincode: '', gst_number: '' };
    const [form, setForm] = useState(emptyForm);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (authMode === 'login') {
                await login(authForm.email, authForm.password);
            } else {
                const { register } = require('../../context/AuthContext');
                await API.post('/api/auth.php?action=register', authForm);
                await login(authForm.email, authForm.password);
            }
            toast.success('Signed in!');
            setStep('form');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Auth failed');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.shop_name.trim()) { toast.error('Shop name required'); return; }
        setLoading(true);
        try {
            await API.post('/api/seller.php?action=become-seller', form);
            toast.success('Seller account approved! Redirecting to dashboard...');
            setTimeout(() => navigate('/seller'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error applying');
        }
        setLoading(false);
    };

    if (step === 'intro') {
        return (
            <div className="become-seller-page">
                <div className="bs-hero">
                    <div className="bs-hero-content">
                        <h1>Sell on <span>TopMTop</span></h1>
                        <p>Reach millions of customers across India. List your jewellery, manage orders, and grow your business.</p>
                        <button className="bs-cta-btn" onClick={() => setStep('auth')}>
                            Start Selling <FiArrowRight />
                        </button>
                        <p className="bs-already"><Link to="/login">Already a seller? Sign in →</Link></p>
                    </div>
                </div>

                <div className="bs-benefits">
                    <h2>Why sell on TopMTop?</h2>
                    <div className="bs-benefits-grid">
                        <div className="bs-benefit-card">
                            <div className="bs-benefit-icon blue"><FiTrendingUp /></div>
                            <h3>Grow Your Business</h3>
                            <p>Reach thousands of jewellery buyers across India</p>
                        </div>
                        <div className="bs-benefit-card">
                            <div className="bs-benefit-icon green"><FiDollarSign /></div>
                            <h3>Zero Listing Fee</h3>
                            <p>List unlimited products for free. Pay only when you sell.</p>
                        </div>
                        <div className="bs-benefit-card">
                            <div className="bs-benefit-icon orange"><FiPackage /></div>
                            <h3>Easy Management</h3>
                            <p>Simple dashboard to manage products, orders & payments</p>
                        </div>
                        <div className="bs-benefit-card">
                            <div className="bs-benefit-icon purple"><FiTruck /></div>
                            <h3>Shipping Support</h3>
                            <p>We help you with logistics and delivery tracking</p>
                        </div>
                    </div>
                </div>

                <div className="bs-steps-section">
                    <h2>How it works</h2>
                    <div className="bs-steps">
                        <div className="bs-step"><div className="bs-step-num">1</div><strong>Create Account</strong><span>Register or sign in</span></div>
                        <div className="bs-step-arrow"><FiArrowRight /></div>
                        <div className="bs-step"><div className="bs-step-num">2</div><strong>Setup Shop</strong><span>Fill shop details</span></div>
                        <div className="bs-step-arrow"><FiArrowRight /></div>
                        <div className="bs-step"><div className="bs-step-num">3</div><strong>List Products</strong><span>Add your jewellery</span></div>
                        <div className="bs-step-arrow"><FiArrowRight /></div>
                        <div className="bs-step"><div className="bs-step-num green">4</div><strong>Start Selling</strong><span>Receive orders!</span></div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'auth') {
        return (
            <div className="become-seller-page auth-step">
                <div className="bs-auth-card">
                    <h2>{authMode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2>
                    <div className="bs-auth-tabs">
                        <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Sign In</button>
                        <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Register</button>
                    </div>
                    <form onSubmit={handleAuth} className="bs-form">
                        {authMode === 'register' && (
                            <input placeholder="Full Name *" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
                        )}
                        <input type="email" placeholder="Email *" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
                        <input type="password" placeholder="Password *" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required minLength={6} />
                        {authMode === 'register' && (
                            <input placeholder="Phone" value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} />
                        )}
                        <button type="submit" className="bs-submit-btn" disabled={loading}>
                            {loading ? 'Please wait...' : 'Continue →'}
                        </button>
                    </form>
                    <button className="bs-back-link" onClick={() => setStep('intro')}>← Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="become-seller-page form-step">
            <div className="bs-form-container">
                <div className="bs-form-header">
                    <FiTruck className="bs-form-icon" />
                    <h2>Setup Your Shop</h2>
                    <p>Hi {user?.name}! Tell us about your business</p>
                </div>

                <form onSubmit={handleSubmit} className="bs-form grid-form">
                    <div className="bs-section">
                        <h3>Shop Information</h3>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Shop Name *</label>
                                <input placeholder="e.g., Amshine Jewellery" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input placeholder="+91 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Shop Description</label>
                            <textarea placeholder="What do you sell? Tell buyers about your shop..." value={form.shop_description} onChange={(e) => setForm({ ...form, shop_description: e.target.value })} rows={3} />
                        </div>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label>WhatsApp Number</label>
                                <input placeholder="For customer contact" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>GST Number (Optional)</label>
                                <input placeholder="GST registration" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="bs-section">
                        <h3>Business Address</h3>
                        <div className="form-group">
                            <label>Address</label>
                            <input placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        </div>
                        <div className="form-row-3">
                            <div className="form-group">
                                <label>City</label>
                                <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="bs-agreement">
                        <FiCheckCircle className="bs-check" />
                        <p>By registering, you agree to TopMTop's Seller Terms & Conditions. Your account will be approved instantly.</p>
                    </div>

                    <button type="submit" className="bs-submit-btn large" disabled={loading}>
                        {loading ? 'Setting up...' : 'Create Seller Account →'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BecomeSeller;
