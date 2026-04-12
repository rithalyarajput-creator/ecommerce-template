import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Footer.css';

const Footer = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || (!form.email && !form.phone)) {
            toast.error('Please enter your name and email or phone');
            return;
        }
        setSubmitting(true);
        try {
            await API.post('/api/leads.php?action=create', { ...form, source: 'footer' });
            toast.success('Thank you! We will contact you soon.');
            setForm({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        }
        setSubmitting(false);
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3><span className="logo-top">Top</span><span className="logo-m">M</span><span className="logo-top">Top</span></h3>
                    <p style={{display:'block'}}>Your one-stop destination for quality products at amazing prices.</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/orders">My Orders</Link>
                </div>
                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <p><FiMail /> support@topmtop.com</p>
                    <p><FiPhone /> +91 9876543210</p>
                    <p><FiMapPin /> New Delhi, India</p>
                </div>
                <div className="footer-section footer-lead">
                    <h4>Get in Touch</h4>
                    <form onSubmit={handleSubmit} className="lead-form">
                        <input type="text" placeholder="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <textarea placeholder="How can we help you?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="2" />
                        <button type="submit" disabled={submitting}><FiSend /> {submitting ? 'Sending...' : 'Send Message'}</button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom"><p>&copy; 2024 TopMTop. All rights reserved.</p></div>
        </footer>
    );
};

export default Footer;
