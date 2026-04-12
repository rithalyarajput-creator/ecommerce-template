import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => (
    <section className="hero">
        <div className="hero-content">
            <h1>Welcome to <span className="hero-brand">Top<span className="hero-m">M</span>Top</span></h1>
            <p>Discover amazing products at unbeatable prices. Quality you can trust, delivered to your doorstep.</p>
            <div className="hero-buttons">
                <Link to="/products" className="btn-shop">Shop Now</Link>
                <Link to="/products?sort=newest" className="btn-new">New Arrivals</Link>
            </div>
        </div>
        <div className="hero-features">
            <div className="feature"><span className="feature-icon">🚚</span><span>Free Delivery</span></div>
            <div className="feature"><span className="feature-icon">🔒</span><span>Secure Payment</span></div>
            <div className="feature"><span className="feature-icon">↩️</span><span>Easy Returns</span></div>
            <div className="feature"><span className="feature-icon">💬</span><span>24/7 Support</span></div>
        </div>
    </section>
);

export default Hero;
