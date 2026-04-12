import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => (
    <footer className="footer">
        <div className="footer-container">
            <div className="footer-section">
                <h3><span className="logo-top">Top</span><span className="logo-m">M</span><span className="logo-top">Top</span></h3>
                <p>Your one-stop destination for quality products at amazing prices.</p>
            </div>
            <div className="footer-section">
                <h4>Quick Links</h4>
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/orders">My Orders</Link>
            </div>
            <div className="footer-section">
                <h4>Categories</h4>
                <Link to="/products?category=1">Electronics</Link>
                <Link to="/products?category=2">Fashion</Link>
                <Link to="/products?category=3">Home & Kitchen</Link>
                <Link to="/products?category=4">Books</Link>
            </div>
            <div className="footer-section">
                <h4>Contact Us</h4>
                <p><FiMail /> support@topmtop.com</p>
                <p><FiPhone /> +91 9876543210</p>
                <p><FiMapPin /> New Delhi, India</p>
            </div>
        </div>
        <div className="footer-bottom"><p>&copy; 2024 TopMTop. All rights reserved.</p></div>
    </footer>
);

export default Footer;
