import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import API from '../../utils/api';
import './Home.css';

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featRes, prodRes, catRes] = await Promise.all([
                    API.get('/api/products.php?action=featured'),
                    API.get('/api/products.php?action=list&limit=24'),
                    API.get('/api/categories.php?action=list')
                ]);
                setFeatured(featRes.data);
                setProducts(prodRes.data.products || []);
                setCategories(catRes.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchData();
    }, []);

    const topDeals = products.filter(p => p.sale_price).slice(0, 8);
    const newArrivals = [...products].sort((a, b) => b.id - a.id).slice(0, 8);

    return (
        <div className="home">
            <Hero />

            {/* Category Pills */}
            <section className="category-bar">
                <div className="category-bar-container">
                    {categories.map(cat => (
                        <Link to={`/products?category=${cat.id}`} key={cat.id} className="cat-pill">
                            <div className="cat-pill-image" style={{ backgroundImage: `url(${cat.image})` }} />
                            <span>{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Offer Banners */}
            <section className="offer-banners">
                <div className="banner-card" style={{ backgroundImage: 'linear-gradient(135deg, #2874f0 0%, #0062cc 100%)' }}>
                    <div>
                        <h3>Up to 70% OFF</h3>
                        <p>On Electronics</p>
                        <Link to="/products?category=1">Shop Now →</Link>
                    </div>
                </div>
                <div className="banner-card" style={{ backgroundImage: 'linear-gradient(135deg, #ff9f00 0%, #fb641b 100%)' }}>
                    <div>
                        <h3>New Arrivals</h3>
                        <p>Fashion Collection</p>
                        <Link to="/products?category=2">Explore →</Link>
                    </div>
                </div>
                <div className="banner-card" style={{ backgroundImage: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)' }}>
                    <div>
                        <h3>Min 50% OFF</h3>
                        <p>Home Appliances</p>
                        <Link to="/products?category=8">Buy Now →</Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {featured.length > 0 && (
                <section className="products-section">
                    <div className="section-header">
                        <h2>Featured Products</h2>
                        <Link to="/products" className="view-all-link">VIEW ALL →</Link>
                    </div>
                    <div className="products-grid">
                        {featured.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Top Deals */}
            {topDeals.length > 0 && (
                <section className="products-section deals-section">
                    <div className="section-header">
                        <h2>🔥 Top Deals</h2>
                        <Link to="/products" className="view-all-link">VIEW ALL →</Link>
                    </div>
                    <div className="products-grid">
                        {topDeals.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
                <section className="products-section">
                    <div className="section-header">
                        <h2>✨ New Arrivals</h2>
                        <Link to="/products?sort=newest" className="view-all-link">VIEW ALL →</Link>
                    </div>
                    <div className="products-grid">
                        {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Browse Categories */}
            <section className="browse-section">
                <h2>Shop by Category</h2>
                <div className="categories-grid">
                    {categories.map(cat => (
                        <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-card">
                            <div className="category-img" style={{ backgroundImage: `url(${cat.image})` }} />
                            <h3>{cat.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Trust Badges */}
            <section className="trust-section">
                <div className="trust-grid">
                    <div className="trust-item"><span>🚚</span><div><h4>Free Delivery</h4><p>Orders above ₹499</p></div></div>
                    <div className="trust-item"><span>🔒</span><div><h4>Secure Payment</h4><p>100% protected</p></div></div>
                    <div className="trust-item"><span>↩️</span><div><h4>Easy Returns</h4><p>7-day return policy</p></div></div>
                    <div className="trust-item"><span>💬</span><div><h4>24/7 Support</h4><p>We're here to help</p></div></div>
                </div>
            </section>

            {loading && <div className="loading">Loading products...</div>}
        </div>
    );
};

export default Home;
