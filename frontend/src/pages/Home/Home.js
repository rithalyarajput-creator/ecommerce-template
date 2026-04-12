import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import API from '../../utils/api';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    API.get('/api/products.php?action=featured'),
                    API.get('/api/categories.php?action=list')
                ]);
                setFeaturedProducts(prodRes.data);
                setCategories(catRes.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchData();
    }, []);

    const catIcons = { 'Electronics': '📱', 'Fashion': '👗', 'Home & Kitchen': '🏠', 'Books': '📚', 'Sports': '⚽', 'Beauty': '💄' };

    return (
        <div className="home">
            <Hero />
            <section className="section categories-section">
                <div className="section-container">
                    <h2 className="section-title">Shop by Category</h2>
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-card">
                                <div className="category-icon">{catIcons[cat.name] || '🛍️'}</div>
                                <h3>{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            <section className="section featured-section">
                <div className="section-container">
                    <h2 className="section-title">Featured Products</h2>
                    {loading ? <div className="loading">Loading...</div> : (
                        <div className="products-grid">
                            {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    )}
                    <div className="view-all"><Link to="/products" className="btn-view-all">View All Products</Link></div>
                </div>
            </section>
        </div>
    );
};

export default Home;
