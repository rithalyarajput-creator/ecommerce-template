import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Hero.css';

const banners = [
    { id: 1, title: 'Big Billion Days', subtitle: 'Up to 80% OFF', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=400&fit=crop', cta: 'Shop Now', link: '/products' },
    { id: 2, title: 'Electronics Sale', subtitle: 'Starting from ₹499', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&h=400&fit=crop', cta: 'Explore', link: '/products?category=1' },
    { id: 3, title: 'Fashion Festival', subtitle: 'Min. 50% OFF', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=400&fit=crop', cta: 'Shop Fashion', link: '/products?category=2' }
];

const Hero = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 4000);
        return () => clearInterval(interval);
    }, []);

    const next = () => setCurrent((c) => (c + 1) % banners.length);
    const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

    return (
        <section className="hero">
            <div className="hero-slider">
                {banners.map((b, i) => (
                    <div key={b.id} className={`hero-slide ${i === current ? 'active' : ''}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.5), transparent), url(${b.image})` }}>
                        <div className="hero-content">
                            <h1>{b.title}</h1>
                            <p>{b.subtitle}</p>
                            <Link to={b.link} className="hero-cta">{b.cta}</Link>
                        </div>
                    </div>
                ))}
                <button className="hero-nav prev" onClick={prev}><FiChevronLeft /></button>
                <button className="hero-nav next" onClick={next}><FiChevronRight /></button>
                <div className="hero-dots">
                    {banners.map((_, i) => (
                        <span key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
