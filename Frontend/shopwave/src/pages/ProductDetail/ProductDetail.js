import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { API_BASE, getImageUrl } from '../../data/products';

const Stars = ({ rating }) => (
  <div className="pd-stars">
    {[1,2,3,4,5].map(i=>(
      <span key={i} style={{color:i<=Math.round(rating)?'var(--gold)':'#ddd',fontSize:'16px'}}>★</span>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [thumb, setThumb] = useState(0);
  const infoRef = useRef(null);

  useEffect(()=>{
    window.scrollTo(0,0);
    setQty(1); setJustAdded(false); setThumb(0);
    fetchProduct();
  },[id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      const data = await res.json();
      const p = data?.data || data?.product || data;
      if(p && p._id){ setProduct(p); fetchSimilar(); }
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  const fetchSimilar = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?limit=8`);
      const data = await res.json();
      const arr = data?.data?.products || data?.products || data?.data || [];
      setSimilar(arr.filter(p=>p._id!==id).slice(0,8).map(p=>({
        ...p, id:p._id, image:getImageUrl(p.images), inStock:p.stock>0,
        rating:p.rating||4,
        category: typeof p.category==='object' ? p.category?.name : (p.category||''),
      })));
    } catch(e){ console.error(e); }
  };

  if(loading) return <div style={{textAlign:'center',padding:'120px 40px',fontFamily:'Jost',color:'var(--text-muted)'}}>Loading...</div>;
  if(!product) return (
    <div style={{textAlign:'center',padding:'120px 40px'}}>
      <h2 style={{fontFamily:'Cormorant Garamond,serif',fontWeight:300,fontSize:32,marginBottom:16}}>Product not found</h2>
      <button onClick={()=>navigate('/products')} className="btn-fill"><span>Browse Products</span></button>
    </div>
  );

  const images = product.images?.length>0 ? product.images.map(img=>getImageUrl([img])) : ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80'];
  const inStock = product.stock>0;
  const discount = product.comparePrice>product.price ? Math.round(((product.comparePrice-product.price)/product.comparePrice)*100) : 0;
  const catName = typeof product.category==='object' ? product.category?.name : (product.category||'');
  const price = product.price || 0;

  const marketLinks = [
    product.flipkartLink && {name:'Flipkart', color:'#2874F0', bg:'#EBF3FF', letter:'F', url:product.flipkartLink},
    product.meeshoLink   && {name:'Meesho',   color:'#F43397', bg:'#FDE8F5', letter:'M', url:product.meeshoLink},
    product.amazonLink   && {name:'Amazon',   color:'#FF9900', bg:'#FFF4E0', letter:'a', url:product.amazonLink},
  ].filter(Boolean);

  const onAdd = () => {
    if(!inStock) return;
    addToCart({...product, id:product._id, image:getImageUrl(product.images), inStock, category:catName}, qty);
    setJustAdded(true);
    setTimeout(()=>setJustAdded(false), 2000);
  };

  const onBuyNow = () => {
    if(!inStock) return;
    addToCart({...product, id:product._id, image:getImageUrl(product.images), inStock, category:catName}, qty);
    navigate('/cart');
  };

  return (
    <div>
      <div className="pd-page">
        <nav className="pd-breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/products">Products</Link><span>/</span>
          {catName&&<><Link to={`/products?category=${encodeURIComponent(catName)}`}>{catName}</Link><span>/</span></>}
          <span>{product.title?.split(' ').slice(0,4).join(' ')}...</span>
        </nav>

        {/* Main Grid - Left: Images, Right: Info */}
        <div className="pd-grid">

          {/* LEFT: Images — scroll with page */}
          <div className="pd-images">
            <div className="pd-main-img">
              <img src={images[thumb]} alt={product.title}/>
              {discount>0&&<div className="pd-disc-tag">-{discount}%</div>}
            </div>
            {images.length>1&&(
              <div className="pd-thumbs">
                {images.map((src,i)=>(
                  <div key={i} className={`pd-thumb${thumb===i?' on':''}`} onClick={()=>setThumb(i)}>
                    <img src={src} alt={`View ${i+1}`}/>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT: Info — sticky */}
          <div className="pd-info" ref={infoRef}>
            <div className="pd-badges">
              {catName&&<span className="pd-cat-badge">{catName}</span>}
              {!inStock&&<span className="pd-oos-badge">Out of Stock</span>}
            </div>
            <h1 className="pd-title">{product.title}</h1>
            <div className="pd-rating-row">
              <Stars rating={product.rating||4}/>
              <span className="pd-rav">{product.rating||4}</span>
              <span className="pd-rct">({(product.reviewCount||0)} reviews)</span>
              {inStock
                ? <span className="pd-instock">✓ In Stock</span>
                : <span className="pd-outstock">Out of Stock</span>
              }
            </div>

            <div className="pd-price-block">
              <span className="pd-sale-price">₹{(price*qty).toLocaleString()}</span>
              {product.comparePrice>price&&<>
                <span className="pd-compare-price">₹{(product.comparePrice*qty).toLocaleString()}</span>
                <span className="pd-savings">Save ₹{((product.comparePrice-price)*qty).toLocaleString()}</span>
              </>}
            </div>

            {inStock&&(
              <div className="pd-qty">
                <div className="pd-qty-label">Quantity</div>
                <div className="pd-qty-ctrl">
                  <button onClick={()=>setQty(q=>Math.max(1,q-1))} disabled={qty<=1}>−</button>
                  <span>{qty}</span>
                  <button onClick={()=>setQty(q=>Math.min(product.stock,q+1))} disabled={qty>=product.stock}>+</button>
                </div>
              </div>
            )}

            <div className="pd-cta">
              <button className={`pd-atc${justAdded?' added':''}`} onClick={onAdd} disabled={!inStock}>
                {justAdded ? '✓ Added to Cart!' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="pd-buynow" onClick={onBuyNow} disabled={!inStock}>
                {inStock ? 'Buy Now' : 'Unavailable'}
              </button>
            </div>

            {/* Marketplace — only if admin added links */}
            {marketLinks.length > 0 && (
              <div className="pd-market-box">
                <div className="pd-market-label">Also available on</div>
                <div className="pd-market-row">
                  {marketLinks.map(m=>(
                    <a key={m.name} href={m.url} className="pd-market-link"
                      target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}>
                      <span className="pd-ml-icon" style={{background:m.bg,color:m.color}}>{m.letter}</span>
                      <span>{m.name}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Description — always last */}
            {product.description && (
              <div className="pd-desc-section">
                <h3 className="pd-desc-title">Description</h3>
                {product.description.includes('<')
                  ? <div className="pd-desc-body" dangerouslySetInnerHTML={{__html: product.description}}/>
                  : <div className="pd-desc-body">{product.description}</div>
                }
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similar.length>0&&(
          <div className="pd-similar">
            <h2 className="pd-sim-title">Similar <em>Products</em></h2>
            <div className="pd-sim-scroll">
              {similar.map(p=>(
                <div key={p.id} className="pd-sim-card">
                  <ProductCard product={p}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};
export default ProductDetail;