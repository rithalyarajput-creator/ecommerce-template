import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import API from '../../utils/api';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || '';

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const params = { action: 'list', page, limit: 12 };
                if (category) params.category = category;
                if (subcategory) params.subcategory = subcategory;
                if (search) params.search = search;
                if (sort) params.sort = sort;
                const { data } = await API.get('/api/products.php', { params });
                setProducts(data.products);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, [page, category, subcategory, search, sort]);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const { data } = await API.get('/api/categories.php?action=list');
                setCategories(data);
                // Auto-expand category if it's currently filtered
                if (category) {
                    setExpandedCategories({ [category]: true });
                    fetchSubcategories(category);
                } else {
                    // Expand the first one by default
                    if (data.length > 0) {
                        setExpandedCategories({ [data[0].id]: true });
                        fetchSubcategories(data[0].id);
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchCats();
    }, []);

    const fetchSubcategories = async (catId) => {
        if (subcategoriesByCategory[catId]) return;
        try {
            const { data } = await API.get(`/api/subcategories.php?action=list&category_id=${catId}`);
            setSubcategoriesByCategory(prev => ({ ...prev, [catId]: data }));
        } catch (err) { console.error(err); }
    };

    const toggleCategory = (catId) => {
        const isExpanded = expandedCategories[catId];
        setExpandedCategories(prev => ({ ...prev, [catId]: !isExpanded }));
        if (!isExpanded) fetchSubcategories(catId);
    };

    const selectCategory = (catId) => {
        const params = new URLSearchParams(searchParams);
        if (catId) params.set('category', catId);
        else params.delete('category');
        params.delete('subcategory');
        params.set('page', '1');
        setSearchParams(params);
        if (catId) {
            setExpandedCategories({ [catId]: true });
            fetchSubcategories(catId);
        }
    };

    const selectSubcategory = (subId, catId) => {
        const params = new URLSearchParams(searchParams);
        params.set('category', catId);
        params.set('subcategory', subId);
        params.set('page', '1');
        setSearchParams(params);
    };

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value); else params.delete(key);
        params.set('page', '1');
        setSearchParams(params);
    };

    const getHeaderText = () => {
        if (search) return `Search: "${search}"`;
        if (subcategory) {
            for (const catId in subcategoriesByCategory) {
                const sub = subcategoriesByCategory[catId]?.find(s => String(s.id) === subcategory);
                if (sub) return sub.name;
            }
        }
        if (category) {
            const cat = categories.find(c => String(c.id) === category);
            if (cat) return cat.name;
        }
        return 'All Products';
    };

    return (
        <div className="products-page">
            <div className="products-container">
                <aside className="filters-sidebar">
                    <h3>Filters</h3>

                    <div className="filter-group">
                        <h4>Category</h4>
                        <button className={!category && !subcategory ? 'active' : ''} onClick={() => selectCategory('')}>
                            All Categories
                        </button>
                        {categories.map(cat => (
                            <div key={cat.id} className="category-item">
                                <button
                                    className={`category-toggle ${category === String(cat.id) && !subcategory ? 'active' : ''}`}
                                    onClick={() => toggleCategory(cat.id)}
                                >
                                    <span onClick={(e) => { e.stopPropagation(); selectCategory(cat.id); }}>{cat.name}</span>
                                    {expandedCategories[cat.id] ? <FiChevronDown /> : <FiChevronRight />}
                                </button>
                                {expandedCategories[cat.id] && subcategoriesByCategory[cat.id] && (
                                    <div className="subcategory-list">
                                        {subcategoriesByCategory[cat.id].map(sub => (
                                            <button
                                                key={sub.id}
                                                className={`subcategory-btn ${subcategory === String(sub.id) ? 'active' : ''}`}
                                                onClick={() => selectSubcategory(sub.id, cat.id)}
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                    <div className="products-header">
                        <h2>{getHeaderText()}</h2>
                        <span className="product-count">{total} products</span>
                    </div>
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
