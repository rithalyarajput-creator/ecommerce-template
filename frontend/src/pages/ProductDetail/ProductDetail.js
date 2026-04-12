import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus, FiExternalLink, FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API, { API_URL } from '../../utils/api';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showEnquire, setShowEnquire] = useState(false);
    const [enquireForm, setEnquireForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submittingEnquire, setSubmittingEnquire] = useState(false);
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await API.get(`/api/products.php?action=detail&id=${id}`);
                setProduct(data);
                setSelectedImage(0);
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

    const addWishlist = async () => {
        if (!user) return alert('Please login');
        await API.post('/api/wishlist.php?action=add', { product_id: product.id });
        alert('Added to wishlist!');
    };

    const submitEnquiry = async (e) => {
        e.preventDefault();
        if (!enquireForm.name || (!enquireForm.email && !enquireForm.phone)) {
            toast.error('Please enter your name and email or phone'); return;
        }
        setSubmittingEnquire(true);
        try {
            await API.post('/api/leads.php?action=create', {
                ...enquireForm,
                source: 'product',
                product_id: product.id
            });
            toast.success('Enquiry sent! We will contact you soon.');
            setShowEnquire(false);
            setEnquireForm({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error sending enquiry');
        }
        setSubmittingEnquire(false);
    };

    const externalLinks = [
        { name: 'Meesho', url: product.meesho_link, color: '#ad2c6e', icon: '🛒' },
        { name: 'Flipkart', url: product.flipkart_link, color: '#2874f0', icon: '🛍️' },
        { name: 'Amazon', url: product.amazon_link, color: '#ff9900', icon: '📦' }
    ].filter(l => l.url && l.url.trim() !== '');

    return (
        <div className="product-detail">
            <div className="detail-container">
                <div className="detail-gallery">
                    <div className="main-image">
                        <img src={getImgUrl(images[selectedImage])} alt={product.name} />
                    </div>
                    {images.length > 1 && (
                        <div className="thumbnails">
                            {images.map((img, i) => (
                                <div key={i} className={`thumb ${selectedImage === i ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                                    <img src={getImgUrl(img)} alt={`${product.name} ${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="detail-info">
                    <div className="breadcrumb">
                        {product.category_name} {product.subcategory_name && `> ${product.subcategory_name}`} {product.sub_subcategory_name && `> ${product.sub_subcategory_name}`}
                    </div>
                    {product.brand && <p className="detail-brand">{product.brand}</p>}
                    <h1>{product.name}</h1>

                    <div className="detail-rating">
                        <span className="rating-box"><FiStar className="star-filled" /> {product.rating}</span>
                        <span>{product.num_reviews} Ratings & Reviews</span>
                    </div>

                    <div className="detail-price">
                        {product.sale_price ? (
                            <>
                                <span className="price">₹{parseFloat(product.sale_price).toLocaleString('en-IN')}</span>
                                <span className="original">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                                <span className="discount">{discount}% off</span>
                            </>
                        ) : <span className="price">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>}
                    </div>

                    <div className="stock-info">
                        {product.stock > 0 ? <span className="in-stock">✓ In Stock ({product.stock} available)</span> : <span className="out-stock">✗ Out of Stock</span>}
                    </div>

                    <div className="quantity-selector">
                        <label>Quantity:</label>
                        <div className="qty-controls">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><FiPlus /></button>
                        </div>
                    </div>

                    <div className="detail-actions">
                        <button className="btn-add-cart" onClick={() => user ? addToCart(product.id, quantity) : alert('Please login')} disabled={product.stock === 0}>
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
                                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="external-btn" style={{ background: link.color }}>
                                        <span className="link-icon">{link.icon}</span>
                                        Buy on {link.name}
                                        <FiExternalLink />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="detail-description-section">
                <h2>Product Description</h2>
                <div className="detail-description">
                    {product.description && product.description.split('\n').map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
                </div>
            </div>

            {showEnquire && (
                <div className="enquire-overlay" onClick={() => setShowEnquire(false)}>
                    <div className="enquire-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="enquire-header">
                            <div>
                                <h3>Enquire about this product</h3>
                                <small>{product.name}</small>
                            </div>
                            <button className="enquire-close" onClick={() => setShowEnquire(false)}><FiX /></button>
                        </div>
                        <form onSubmit={submitEnquiry} className="enquire-form">
                            <input type="text" placeholder="Your Name *" value={enquireForm.name} onChange={(e) => setEnquireForm({ ...enquireForm, name: e.target.value })} required />
                            <input type="email" placeholder="Email" value={enquireForm.email} onChange={(e) => setEnquireForm({ ...enquireForm, email: e.target.value })} />
                            <input type="tel" placeholder="Phone Number" value={enquireForm.phone} onChange={(e) => setEnquireForm({ ...enquireForm, phone: e.target.value })} />
                            <textarea placeholder="Your message / question about this product..." rows="4" value={enquireForm.message} onChange={(e) => setEnquireForm({ ...enquireForm, message: e.target.value })} />
                            <button type="submit" disabled={submittingEnquire}><FiSend /> {submittingEnquire ? 'Sending...' : 'Send Enquiry'}</button>
                        </form>
                    </div>
                </div>
            )}

            {product.reviews && product.reviews.length > 0 && (
                <div className="reviews-section">
                    <h2>Customer Reviews ({product.reviews.length})</h2>
                    {product.reviews.map(r => (
                        <div key={r.id} className="review-card">
                            <div className="review-header">
                                <strong>{r.user_name}</strong>
                                <div className="review-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                            </div>
                            <p>{r.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
