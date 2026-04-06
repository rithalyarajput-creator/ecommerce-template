import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const BACKEND = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api','') : 'https://amshine-backend.onrender.com';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  if (!product) return null;

  const id = product._id || product.id;
  // Fix: category can be object or string
  const catName = typeof product.category === 'object'
    ? product.category?.name || ''
    : product.category || '';
  const inStock = product.inStock !== undefined ? product.inStock : (product.stock > 0);
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : (product.discount || 0);

  const getImg = (imgs) => {
    if (!imgs || !imgs.length) return null;
    const i = imgs[0];
    if (typeof i === 'string' && i.startsWith('http')) return i;
    if (typeof i === 'string') return `${BACKEND}${i}`;
    return null;
  };

  const img1 = product.image || getImg(product.images) || 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80';
  const img2 = product.images?.length > 1 ? getImg([product.images[1]]) : img1;

  const onAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!inStock) return;
    addToCart({ ...product, id, image: img1, inStock, category: catName });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const onWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    setWished(w => !w);
  };

  return (
    <div className="pc" onClick={() => navigate(`/products/${id}`)}>
      <div className="pc-img">
        <div className="pc-i1">
          <img src={img1} alt={product.title} loading="lazy"
            onError={e=>{e.target.src='https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80';}}/>
        </div>
        <div className="pc-i2">
          <img src={img2} alt={product.title} loading="lazy" onError={e=>{e.target.src=img1;}}/>
        </div>

        {!inStock
          ? <div className="pc-badge pc-sold">Sold Out</div>
          : discount > 0
            ? <div className="pc-badge pc-sale">-{discount}%</div>
            : <div className="pc-badge pc-new">New</div>
        }

        <button className={`pc-wish${wished?' on':''}`} onClick={onWish} aria-label="Wishlist">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished?'var(--maroon)':'none'} stroke={wished?'var(--maroon)':'currentColor'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <div className="pc-actions">
          <button className="pc-atc" onClick={onAdd} disabled={!inStock}>
            {justAdded
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added!</>
              : inStock
                ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Add to Cart</>
                : 'Sold Out'
            }
          </button>
        </div>
      </div>

      <div className="pc-info">
        <div className="pc-stars">
          {[1,2,3,4,5].map(i=>(
            <span key={i} style={{color:i<=Math.round(product.rating||4)?'var(--gold)':'#ddd',fontSize:'12px'}}>★</span>
          ))}
          <span className="pc-rc">({product.reviewCount||0})</span>
        </div>
        {catName && <div className="pc-cat">{catName}</div>}
        <div className="pc-name">{product.title}</div>
        <div className="pc-price">
          <span className="pc-now">₹{product.price?.toLocaleString()}</span>
          {product.comparePrice > product.price && (<>
            <span className="pc-was">₹{product.comparePrice?.toLocaleString()}</span>
            {discount>0&&<span className="pc-off">{discount}% off</span>}
          </>)}
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
