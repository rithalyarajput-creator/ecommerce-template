import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
// CSS in index.css

// Tabs — admin se product ko tag karein: mostDemanding:true, highProfit:true
const TABS = [
  { label: 'All',            key: 'all' },
  { label: 'Latest',         key: 'latest' },
  { label: 'Most Demanding', key: 'mostDemanding' },
  { label: 'High Profit',    key: 'highProfit' },
];

const FeaturedProducts = ({ products = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState('all');
  const sliderRef = useRef(null);

  const getTabProducts = () => {
    switch (activeTab) {
      case 'latest':        return products.filter(p => p.isLatest).slice(0, 12);
      case 'mostDemanding': return products.filter(p => p.isMostDemanding).slice(0, 12);
      case 'highProfit':    return products.filter(p => p.isHighProfit).slice(0, 12);
      default:              return products.slice(0, 12);
    }
  };

  const shown = getTabProducts();

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <section className="fp-section section">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow">Handpicked For You</div>
          <h2 className="sec-title">Our <em>Products</em></h2>
        </div>
        <Link to="/products" className="view-all">View All</Link>
      </div>

      {/* Tabs */}
      <div className="fp-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`fp-tab${activeTab === tab.key ? ' on' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Carousel */}
      {loading ? (
        <div className="loading-wrap"><div className="loading-spinner"/></div>
      ) : shown.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💍</div>
          <div className="empty-title">No products in this tab yet</div>
          <p className="empty-text">Add products from Admin Panel</p>
        </div>
      ) : (
        <div className="fp-carousel-wrap">
          <button className="fp-arrow fp-arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="fp-carousel" ref={sliderRef}>
            {shown.map(product => (
              <div key={product._id || product.id} className="fp-card-wrap">
                <ProductCard product={product}/>
              </div>
            ))}
          </div>
          <button className="fp-arrow fp-arrow-right" onClick={() => scroll(1)} aria-label="Scroll right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
