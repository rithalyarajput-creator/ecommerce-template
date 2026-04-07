import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const BACKEND = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'https://amshine-backend.onrender.com';

const getImgUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BACKEND}${img}`;
};

const FALLBACK_COLORS = [
  '#4A1020','#1A3A6A','#8B2A3A','#2A4A1A','#3A1A4A',
  '#4A3A1A','#2A1A4A','#1A4A3A','#5A2A1A','#1A2A5A',
  '#4A1A3A','#2A4A2A','#3A2A4A','#4A4A1A','#1A3A3A',
];

const DEFAULT_CATS = [
  { name: 'Necklaces',     emoji: '📿', color: '#4A1020' },
  { name: 'Earrings',      emoji: '💎', color: '#1A3A6A' },
  { name: 'Rings',         emoji: '💍', color: '#8B2A3A' },
  { name: 'Bracelets',     emoji: '✨', color: '#2A4A1A' },
  { name: 'Bangles',       emoji: '🔮', color: '#3A1A4A' },
  { name: 'Jewelry Sets',  emoji: '👑', color: '#4A3A1A' },
  { name: 'Bridal Jewelry',emoji: '👸', color: '#2A1A4A' },
  { name: 'Mangalsutra',   emoji: '❤️', color: '#1A4A3A' },
];

const CategorySection = ({ categories = [] }) => {
  const sliderRef = useRef(null);

  const cats = categories.length > 0
    ? categories.map((c, i) => ({
        name: c.name,
        image: getImgUrl(c.image),
        emoji: c.emoji || '💍',
        slug: c.name,
        color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }))
    : DEFAULT_CATS.map(c => ({ ...c, slug: c.name }));

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <section className="cat-sec section" style={{paddingTop:'40px'}}>
      <div className="sec-head" style={{ flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:'52px' }}>
        <div className="sec-eyebrow">Browse</div>
        <h2 className="sec-title">All <em>Categories</em></h2>
      </div>

      {/* Slider wrapper */}
      <div style={{ position:'relative' }}>

        {/* Left Arrow */}
        {cats.length > 5 && (
          <button onClick={() => scroll(-1)} style={{
            position:'absolute', left:'-20px', top:'50%', transform:'translateY(-60%)',
            zIndex:10, background:'#fff', border:'1px solid var(--border)',
            width:'44px', height:'44px', borderRadius:'50%', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 16px rgba(107,26,42,.12)', color:'var(--maroon)',
            transition:'all .3s',
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background='var(--maroon)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color='var(--maroon)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}

        {/* Scrollable Row */}
        <div ref={sliderRef} style={{
          display:'flex', gap:'32px', overflowX:'auto', scrollSnapType:'x mandatory',
          scrollbarWidth:'none', msOverflowStyle:'none', padding:'8px 4px 16px',
        }}>
          <style>{`.cat-slider::-webkit-scrollbar{display:none;}`}</style>
          {cats.map((cat, i) => (
            <Link
              key={i}
              to={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="cat-circle-item"
              style={{ flexShrink:0, scrollSnapAlign:'start', minWidth:'160px', alignItems:'center' }}
            >
              <div className="cat-circle-wrap">
                <div
                  className="cat-circle-img"
                  style={cat.image
                    ? { backgroundImage:`url(${cat.image})`, backgroundSize:'cover', backgroundPosition:'center' }
                    : { background: cat.color }
                  }
                >
                  {!cat.image && <span className="cat-circle-emoji">{cat.emoji}</span>}
                  <div className="cat-circle-overlay"/>
                </div>
              </div>
              <span className="cat-circle-name">{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        {cats.length > 5 && (
          <button onClick={() => scroll(1)} style={{
            position:'absolute', right:'-20px', top:'50%', transform:'translateY(-60%)',
            zIndex:10, background:'#fff', border:'1px solid var(--border)',
            width:'44px', height:'44px', borderRadius:'50%', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 16px rgba(107,26,42,.12)', color:'var(--maroon)',
            transition:'all .3s',
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background='var(--maroon)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color='var(--maroon)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
