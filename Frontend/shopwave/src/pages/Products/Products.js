import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './Products.module.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import Footer from '../../components/Footer/Footer';
import { API_BASE, getImageUrl } from '../../data/products';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(110000);
  const [sortBy, setSortBy] = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategories([cat]);
    window.scrollTo(0, 0);
    Promise.all([
      fetch(`${API_BASE}/products?limit=100`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/categories`).then(r => r.json()).catch(() => ({})),
    ]).then(([pd, cd]) => {
      const prods = pd?.data?.products || pd?.products || pd?.data || [];
      const cats = cd?.categories || cd?.data || [];
      setAllProducts(Array.isArray(prods) ? prods : []);
      setAllCategories(Array.isArray(cats) ? cats : []);
    }).finally(() => setLoading(false));
  }, []);

  const normalize = p => ({
    ...p, id: p._id,
    image: getImageUrl(p.images),
    inStock: p.stock > 0,
    rating: p.rating || 4.0,
    reviewCount: p.reviewCount || 0,
    discount: p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0,
    categories: Array.isArray(p.category) ? p.category : (p.category ? [p.category?.name || p.category] : ['General']),
    category: Array.isArray(p.category) ? (p.category[0] || 'General') : (p.category?.name || p.category || 'General'),
  });

  const searchQuery = searchParams.get('search') || '';

  const filtered = useMemo(() => {
    let r = allProducts.map(normalize);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(p => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (selectedCategories.length > 0) r = r.filter(p => (p.categories || [p.category]).some(c => selectedCategories.includes(c)));
    r = r.filter(p => p.price <= maxPrice);
    switch (sortBy) {
      case 'price_asc': r.sort((a,b) => a.price - b.price); break;
      case 'price_desc': r.sort((a,b) => b.price - a.price); break;
      case 'newest': r.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'popular': r.sort((a,b) => (b.reviewCount||0) - (a.reviewCount||0)); break;
      default: break;
    }
    return r;
  }, [allProducts, searchQuery, selectedCategories, maxPrice, sortBy]);

  const catCounts = useMemo(() => {
    const c = {};
    allProducts.forEach(p => { const cats = Array.isArray(p.category) ? p.category : [p.category?.name || p.category || 'General']; cats.forEach(n => { c[n] = (c[n]||0)+1; }); });
    return c;
  }, [allProducts]);

  const toggleCat = (cat) => setSelectedCategories(p => p.includes(cat) ? p.filter(c => c!==cat) : [...p, cat]);
  const clearFilters = () => { setSelectedCategories([]); setMaxPrice(110000); setSortBy('popular'); };
  const hasFilters = selectedCategories.length > 0 || maxPrice < 110000;
  const fillPercent = `${(maxPrice / 110000) * 100}%`;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link><span>/</span>
          <span>{searchQuery ? `Search: "${searchQuery}"` : 'All Products'}</span>
        </div>
        <h1 className={styles.pageTitle}>
          {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
        </h1>
      </div>

      <div className={styles.page}>
        {mobileFilterOpen && <div className={styles.filterOverlay} onClick={() => setMobileFilterOpen(false)} />}

        <aside className={`${styles.sidebar}${mobileFilterOpen ? ` ${styles.sidebarOpen}` : ''}`}>
          <div className={styles.sidebarCard}>
            <div className={styles.filterTitle}>
              Filters
              {hasFilters && <button className={styles.clearBtn} onClick={clearFilters}>Clear All</button>}
            </div>
            <div className={styles.filterSec}>
              <div className={styles.filterSecTitle}>Category</div>
              <div className={styles.checkList}>
                {allCategories.map(cat => (
                  <label key={cat._id} className={styles.checkItem}>
                    <input type="checkbox" checked={selectedCategories.includes(cat.name)} onChange={() => toggleCat(cat.name)} />
                    <span className={styles.checkLabel}>
                      {cat.name}<span className={styles.checkCount}>{catCounts[cat.name] || 0}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.filterSec}>
              <div className={styles.filterSecTitle}>Max Price</div>
              <div className={styles.priceDisplay}>
                <span>₹0</span><span>₹{maxPrice.toLocaleString()}</span>
              </div>
              <input type="range" min="500" max="110000" step="500"
                value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                className={styles.rangeSlider} style={{'--fill': fillPercent}} />
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
              <button className={styles.mobileFilterBtn} onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
                </svg>
                Filters
              </button>
              <span className={styles.resultsCount}><strong>{filtered.length}</strong> products</span>
            </div>
            <div className={styles.sortWrap}>
              <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className={styles.activeTags}>
              {selectedCategories.map(c => (
                <span key={c} className={styles.tag}>{c}<button onClick={() => toggleCat(c)}>x</button></span>
              ))}
              {maxPrice < 110000 && <span className={styles.tag}>Under Rs.{maxPrice.toLocaleString()}<button onClick={() => setMaxPrice(110000)}>x</button></span>}
            </div>
          )}

          {loading ? (
            <div style={{textAlign:'center',padding:'80px'}}>
              <div className="loading-spinner" style={{margin:'0 auto'}} />
            </div>
          ) : filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{textAlign:'center',padding:'80px'}}>
              <div style={{fontSize:52,marginBottom:16}}>🔍</div>
              <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:28,marginBottom:8}}>No products found</div>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:24}}>Try adjusting your filters or search</p>
              <button onClick={clearFilters} className="btn-fill"><span>Clear Filters</span></button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
