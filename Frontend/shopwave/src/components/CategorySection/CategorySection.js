import React from 'react';
import { Link } from 'react-router-dom';
// CSS in index.css

const FALLBACK_COLORS = ['#4A1020','#1A3A6A','#8B2A3A','#2A4A1A','#3A1A4A','#4A3A1A','#2A1A4A','#1A4A3A','#5A2A1A','#1A2A5A','#4A1A3A','#2A4A2A','#3A2A4A','#4A4A1A','#1A3A3A'];

const CategorySection = ({ categories = [] }) => {
  const cats = categories.length > 0
    ? categories.map((c, i) => ({
        name: c.name,
        image: c.image || null,
        emoji: c.emoji || '💍',
        slug: c.name,
        color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }))
    : [
        { name: 'Necklaces',    emoji: '📿', color: '#4A1020' },
        { name: 'Earrings',     emoji: '💎', color: '#1A3A6A' },
        { name: 'Rings',        emoji: '💍', color: '#8B2A3A' },
        { name: 'Bracelets',    emoji: '✨', color: '#2A4A1A' },
        { name: 'Bangles',      emoji: '🔮', color: '#3A1A4A' },
        { name: 'Jewelry Sets', emoji: '👑', color: '#4A3A1A' },
        { name: 'Bridal Jewelry', emoji: '👸', color: '#2A1A4A' },
        { name: 'Mangalsutra',  emoji: '❤️', color: '#1A4A3A' },
      ].map(c => ({ ...c, slug: c.name }));

  return (
    <section className="cat-sec section">
      <div className="sec-head" style={{ flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:'52px' }}>
        <div className="sec-eyebrow">Browse</div>
        <h2 className="sec-title">All <em>Categories</em></h2>
      </div>

      <div className="cat-circles">
        {cats.map((cat, i) => (
          <Link
            key={i}
            to={`/products?category=${encodeURIComponent(cat.slug)}`}
            className="cat-circle-item"
          >
            <div className="cat-circle-wrap">
              <div
                className="cat-circle-img"
                style={cat.image
                  ? { backgroundImage:`url(${cat.image})`, backgroundSize:'cover', backgroundPosition:'center' }
                  : { background: cat.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }
                }
              >
                {!cat.image && (
                  <span className="cat-circle-emoji">{cat.emoji || '💍'}</span>
                )}
                <div className="cat-circle-overlay"/>
              </div>
            </div>
            <span className="cat-circle-name">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
