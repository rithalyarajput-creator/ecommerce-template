import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import API from '../../utils/api';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || '';

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const params = { action: 'list', page, limit: 12 };
                if (category) params.category = category;
                if (search) params.search = search;
                if (sort) params.sort = sort;
                const { data } = await API.get('/api/products.php', { params });
                setProducts(data.products);
                setTotalPages(data.totalPages);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        const fetchCats = async () => {
            try { const { data } = await API.get('/api/categories.php?action=list'); setCategories(data); }
            catch (err) { console.error(err); }
        };
        fetch();
        fetchCats();
    }, [page, category, search, sort]);

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value); else params.delete(key);
        params.set('page', '1');
        setSearchParams(params);
    };

    return (
        <div className="products-page">
            <div className="products-container">
                <aside className="filters-sidebar">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <h4>Category</h4>
                        <button className={!category ? 'active' : ''} onClick={() => updateFilter('category', '')}>All Categories</button>
                        {categories.map(cat => (
                            <button key={cat.id} className={category === String(cat.id) ? 'active' : ''} onClick={() => updateFilter('category', cat.id)}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <div className="filter-group">
                        <h4>Sort By</h4>
                        <button className={sort === 'newest' ? 'active' : ''} onClick={() => updateFilter('sort', 'newest')}>Newest</button>
                        <button className={sort === 'price_low' ? 'active' : ''} onClick={() => updateFilter('sort', 'price_low')}>Price: Low to High</button>
                        <button className={sort === 'price_high' ? 'active' : ''} onClick={() => updateFilter('sort', 'price_high')}>Price: High to Low</button>
                        <button className={sort === 'rating' ? 'active' : ''} onClick={() => updateFilter('sort', 'rating')}>Top Rated</button>
                    </div>
                </aside>
                <main className="products-main">
                    <div className="products-header"><h2>{search ? `Search: "${search}"` : 'All Products'}</h2></div>
                    {loading ? <div className="loading">Loading...</div> : products.length === 0 ? <div className="no-products">No products found</div> : (
                        <>
                            <div className="products-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
                            {totalPages > 1 && (
                                <div className="pagination">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button key={p} className={page === p ? 'active' : ''} onClick={() => updateFilter('page', p)}>{p}</button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Products;
