import React from 'react';
import { Link } from 'react-router-dom';
// CSS in index.css

// =============================================
// CATEGORY CIRCLES — aap apni images add kar sakte hain
// image: null rakha hai — aap khud URL daalein
// =============================================
const DEFAULT_CATS = [
  { name: 'Earrings',  image: null, slug: 'Earrings'  },
  { name: 'Necklaces', image: null, slug: 'Necklaces' },
  { name: 'Rings',     image: null, slug: 'Rings'     },
  { name: 'Bangles',   image: null, slug: 'Bangles'   },
  { name: 'Bridal',    image: null, slug: 'Bridal'    },
];

const FALLBACK_COLORS = ['#4A1020','#1A3A6A','#8B2A3A','#2A4A1A','#3A1A4A'];
const FALLBACK_EMOJIS = ['💍','📿','💎','✨','👑'];

const CategorySection = ({ categories = [] }) => {
  // Use API categories if available, else defaults
  const cats = categories.length > 0
    ? categories.slice(0, 5).map(c => ({
        name: c.name,
        image: c.image || null,
        slug: c.name,
      }))
    : DEFAULT_CATS;

  return (
    <section className="cat-sec section">
      <div className="sec-head" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '52px' }}>
        <div className="sec-eyebrow">Browse</div>
        <h2 className="sec-title">All <em>Categories</em></h2>
      </div>

      <div className="cat-circles">
        {cats.map((cat, i) => (
          <Link
            key={cat.slug}
            to={`/products?category=${encodeURIComponent(cat.slug)}`}
            className="cat-circle-item"
          >
            <div className="cat-circle-wrap">
              <div
                className="cat-circle-img"
                style={cat.image
                  ? { backgroundImage: `url(${cat.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: FALLBACK_COLORS[i % FALLBACK_COLORS.length] }
                }
              >
                {!cat.image && (
                  <span className="cat-circle-emoji">{FALLBACK_EMOJIS[i]}</span>
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
