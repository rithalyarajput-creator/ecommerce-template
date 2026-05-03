import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus, FiExternalLink, FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLoginPopup } from '../../context/LoginPopupContext';
import API, { API_URL } from '../../utils/api';
import { toast } from 'react-toastify';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [showEnquire, setShowEnquire] = useState(false);
    const [enquireForm, setEnquireForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submittingEnquire, setSubmittingEnquire] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [selectedVariations, setSelectedVariations] = useState({});
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { showLoginPopup } = useLoginPopup();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setSelectedVariations({});
            setSelectedImage(0);
            setActiveTab('description');
            try {
                const { data } = await API.get(`/api/products.php?action=detail&id=${id}`);
                setProduct(data);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                try {
                    const { data: sim } = await API.get(`/api/products.php?action=similar&product_id=${id}&limit=8`);
                    setSimilarProducts(sim || []);
                } catch (e) { setSimilarProducts([]); }
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (!product) return <div className="loading">Product not found</div>;

    const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

    const getImgUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/500';
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

    // Group variations by attribute name
    const variationGroups = (product.variations || []).reduce((acc, v) => {
        if (!acc[v.attribute_name]) acc[v.attribute_name] = [];
        acc[v.attribute_name].push(v);
        return acc;
    }, {});

    // Find the selected variation object matching ALL selected attributes
    const selectedVar = Object.keys(selectedVariations).length > 0
        ? (product.variations || []).find(v =>
            selectedVariations[v.attribute_name] === v.attribute_value
          )
        : null;

    const displayPrice = selectedVar?.price ? parseFloat(selectedVar.price) : (product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price));
    const displayOriginal = selectedVar?.price ? null : (product.sale_price ? parseFloat(product.price) : null);
    const displayDiscount = displayOriginal ? Math.round(((parseFloat(product.price) - displayPrice) / parseFloat(product.price)) * 100) : discount;

    const selectVariation = (attrName, v) => {
        setSelectedVariations(prev => ({ ...prev, [attrName]: v.attribute_value }));
        if (v.image) setSelectedImage(-1);
    };

    const getMainImage = () => {
        if (selectedVar?.image) return getImgUrl(selectedVar.image);
        if (images.length > 0 && selectedImage >= 0) return getImgUrl(images[selectedImage]);
        return getImgUrl(images[0]);
    };

    const addWishlist = async () => {
        if (!user) { showLoginPopup(() => addWishlist()); return; }
        await API.post('/api/wishlist.php?action=add', { product_id: product.id });
        toast.success('Added to wishlist!');
    };

    const submitEnquiry = async (e) => {
        e.preventDefault();
        if (!enquireForm.name || (!enquireForm.email && !enquireForm.phone)) {
            toast.error('Please enter your name and email or phone'); return;
        }
        setSubmittingEnquire(true);
        try {
            await API.post('/api/leads.php?action=create', { ...enquireForm, source: 'product', product_id: product.id });
            toast.success('Enquiry sent! We will contact you soon.');
            setShowEnquire(false);
            setEnquireForm({ name: '', email: '', phone: '', message: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Error sending enquiry'); }
        setSubmittingEnquire(false);
    };

    const externalLinks = [
        { name: 'Meesho', url: product.meesho_link, logo: '/meesho.png', bg: '#fce4ec' },
        { name: 'Flipkart', url: product.flipkart_link, logo: '/flipkart.png', bg: '#e3f2fd' },
        { name: 'Amazon', url: product.amazon_link, logo: '/amazon.png', bg: '#fff8e1' }
    ].filter(l => l.url && l.url.trim() !== '');

    const reviewCount = product.reviews?.length || 0;
    const avgRating = reviewCount > 0 ? (product.reviews.reduce((s, r) => s + parseInt(r.rating), 0) / reviewCount).toFixed(1) : product.rating;
    const starCounts = [5,4,3,2,1].map(s => ({ star: s, count: (product.reviews || []).filter(r => parseInt(r.rating) === s).length }));

    return (
        <div className="product-detail">
            <div className="detail-container">
                {/* ── Gallery ── */}
                <div className="detail-gallery">
                    <div className="main-image">
                        <img src={getMainImage()} alt={product.name} />
                    </div>
                    <div className="thumbnails">
                        {images.map((img, i) => (
                            <div key={i} className={`thumb ${selectedImage === i && !selectedVar?.image ? 'active' : ''}`}
                                onClick={() => { setSelectedImage(i); setSelectedVariations({}); }}>
                                <img src={getImgUrl(img)} alt={`${product.name} ${i + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Info ── */}
                <div className="detail-info">
                    <div className="breadcrumb">
                        {product.category_name}{product.subcategory_name && ` > ${product.subcategory_name}`}{product.sub_subcategory_name && ` > ${product.sub_subcategory_name}`}
                    </div>
                    {product.brand && <p className="detail-brand">{product.brand}</p>}
                    <h1>{product.name}</h1>

                    <div className="detail-rating">
                        <span className="rating-box"><FiStar className="star-filled" /> {avgRating}</span>
                        <span>{reviewCount} Ratings & Reviews</span>
                    </div>

                    <div className="detail-price">
                        <span className="price">₹{displayPrice.toLocaleString('en-IN')}</span>
                        {displayOriginal && <span className="original">₹{displayOriginal.toLocaleString('en-IN')}</span>}
                        {displayDiscount > 0 && displayOriginal && <span className="discount">{displayDiscount}% off</span>}
                    </div>

                    <div className="stock-info">
                        {selectedVar
                            ? (selectedVar.stock > 0 ? <span className="in-stock">✓ In Stock ({selectedVar.stock} available)</span> : <span className="out-stock">✗ Out of Stock</span>)
                            : (product.stock > 0 ? <span className="in-stock">✓ In Stock ({product.stock} available)</span> : <span className="out-stock">✗ Out of Stock</span>)
                        }
                    </div>

                    {/* ── Variations ── */}
                    {Object.keys(variationGroups).length > 0 && (
                        <div className="variations-selector">
                            {Object.entries(variationGroups).map(([attrName, items]) => (
                                <div key={attrName} className="variation-attr">
                                    <p className="variation-attr-label">
                                        {attrName}: <strong>{selectedVariations[attrName] || <span style={{color:'#999',fontWeight:400}}>Select</span>}</strong>
                                    </p>
                                    <div className="variation-options">
                                        {items.map(v => (
                                            <button
                                                key={v.id}
                                                className={`var-option-btn ${selectedVariations[attrName] === v.attribute_value ? 'selected' : ''} ${parseInt(v.stock) === 0 ? 'out-of-stock' : ''}`}
                                                onClick={() => selectVariation(attrName, v)}
                                                title={parseInt(v.stock) === 0 ? 'Out of stock' : v.attribute_value}
                                            >
                                                {v.image
                                                    ? <img src={getImgUrl(v.image)} alt={v.attribute_value} className="var-option-img" />
                                                    : <span className="var-option-text">{v.attribute_value}</span>
                                                }
                                                {!v.image && v.price && <small>₹{parseFloat(v.price).toLocaleString('en-IN')}</small>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="quantity-selector">
                        <label>Quantity:</label>
                        <div className="qty-controls">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(selectedVar?.stock || product.stock, quantity + 1))}><FiPlus /></button>
                        </div>
                    </div>

                    <div className="detail-actions">
                        <button className="btn-add-cart" onClick={() => user ? addToCart(product.id, quantity) : showLoginPopup(() => addToCart(product.id, quantity))} disabled={(selectedVar ? selectedVar.stock : product.stock) === 0}>
                            <FiShoppingCart /> Add to Cart
                        </button>
                        <button className="btn-wishlist" onClick={addWishlist}><FiHeart /> Wishlist</button>
                        <button className="btn-enquire" onClick={() => setShowEnquire(true)}><FiMessageCircle /> Enquire</button>
                    </div>

                    {externalLinks.length > 0 && (
                        <div className="external-links">
                            <h4>Also Available On:</h4>
                            <div className="link-buttons">
                                {externalLinks.map(link => (
                                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="external-btn-logo" style={{ background: link.bg }}>
                                        <img src={link.logo} alt={link.name} className="platform-logo" />
                                        <FiExternalLink className="ext-icon" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tabs: Description / Additional Info / Reviews ── */}
            <div className="detail-tabs-section">
                <div className="detail-tabs">
                    <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
                    <button className={activeTab === 'additional' ? 'active' : ''} onClick={() => setActiveTab('additional')}>Additional Information</button>
                    <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
                        Reviews {reviewCount > 0 && <span className="tab-count">{reviewCount}</span>}
                    </button>
                </div>

                <div className="detail-tab-content">
                    {activeTab === 'description' && (
                        <div className="tab-description">
                            {product.description
                                ? <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                : <p style={{color:'#999'}}>No description available.</p>
                            }
                        </div>
                    )}

                    {activeTab === 'additional' && (
                        <div className="tab-additional">
                            <table className="additional-table">
                                <tbody>
                                    {product.brand && <tr><td>Brand</td><td>{product.brand}</td></tr>}
                                    {product.category_name && <tr><td>Category</td><td>{product.category_name}</td></tr>}
                                    {product.subcategory_name && <tr><td>Sub Category</td><td>{product.subcategory_name}</td></tr>}
                                    {product.sub_subcategory_name && <tr><td>Type</td><td>{product.sub_subcategory_name}</td></tr>}
                                    {product.sku && <tr><td>SKU</td><td>{product.sku}</td></tr>}
                                    <tr><td>Stock</td><td>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</td></tr>
                                    {(product.variations || []).length > 0 && (
                                        Object.entries(variationGroups).map(([attr, items]) => (
                                            <tr key={attr}><td>{attr}</td><td>{items.map(i => i.attribute_value).join(', ')}</td></tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="tab-reviews">
                            {reviewCount > 0 ? (
                                <>
                                    <div className="reviews-summary">
                                        <div className="reviews-avg">
                                            <span className="avg-number">{avgRating}</span>
                                            <div className="avg-stars">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</div>
                                            <span className="avg-label">out of 5</span>
                                        </div>
                                        <div className="reviews-bars">
                                            {starCounts.map(({ star, count }) => (
                                                <div key={star} className="star-bar-row">
                                                    <span>{star} Star</span>
                                                    <div className="star-bar"><div className="star-bar-fill" style={{ width: reviewCount ? `${(count / reviewCount) * 100}%` : '0%' }} /></div>
                                                    <span>{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="reviews-list">
                                        {product.reviews.map(r => (
                                            <div key={r.id} className="review-card">
                                                <div className="review-header">
                                                    <div className="review-avatar">{r.user_name?.[0]?.toUpperCase()}</div>
                                                    <div>
                                                        <strong>{r.user_name}</strong>
                                                        <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                                    </div>
                                                    <span className="review-date">{new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                                                </div>
                                                <p>{r.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p style={{color:'#999', textAlign:'center', padding:'40px 0'}}>No reviews yet. Be the first to review!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Similar Products ── */}
            {similarProducts.length > 0 && (
                <div className="similar-products-section">
                    <h2>Similar Products You May Like</h2>
                    <div className="similar-products-grid">
                        {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}

            {/* ── Enquire Modal ── */}
            {showEnquire && (
                <div className="enquire-overlay" onClick={() => setShowEnquire(false)}>
                    <div className="enquire-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="enquire-header">
                            <div><h3>Enquire about this product</h3><small>{product.name}</small></div>
                            <button className="enquire-close" onClick={() => setShowEnquire(false)}><FiX /></button>
                        </div>
                        <form onSubmit={submitEnquiry} className="enquire-form">
                            <input type="text" placeholder="Your Name *" value={enquireForm.name} onChange={(e) => setEnquireForm({ ...enquireForm, name: e.target.value })} required />
                            <input type="email" placeholder="Email" value={enquireForm.email} onChange={(e) => setEnquireForm({ ...enquireForm, email: e.target.value })} />
                            <input type="tel" placeholder="Phone Number" value={enquireForm.phone} onChange={(e) => setEnquireForm({ ...enquireForm, phone: e.target.value })} />
                            <textarea placeholder="Your message..." rows="4" value={enquireForm.message} onChange={(e) => setEnquireForm({ ...enquireForm, message: e.target.value })} />
                            <button type="submit" disabled={submittingEnquire}><FiSend /> {submittingEnquire ? 'Sending...' : 'Send Enquiry'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
