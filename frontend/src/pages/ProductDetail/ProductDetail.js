import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API, { API_URL } from '../../utils/api';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetch = async () => {
            try { const { data } = await API.get(`/api/products.php?action=detail&id=${id}`); setProduct(data); }
            catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (!product) return <div className="loading">Product not found</div>;

    const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

    const addWishlist = async () => {
        if (!user) return alert('Please login');
        await API.post('/api/wishlist.php?action=add', { product_id: product.id });
        alert('Added to wishlist!');
    };

    return (
        <div className="product-detail">
            <div className="detail-container">
                <div className="detail-image">
                    <img src={product.image ? `${API_URL}${product.image}` : 'https://via.placeholder.com/500'} alt={product.name} />
                </div>
                <div className="detail-info">
                    <p className="detail-category">{product.category_name}</p>
                    <h1>{product.name}</h1>
                    <div className="detail-rating">
                        <FiStar className="star-filled" />
                        <span>{product.rating}</span>
                        <span className="review-count">({product.num_reviews} reviews)</span>
                    </div>
                    <div className="detail-price">
                        {product.sale_price ? (
                            <>
                                <span className="price">&#8377;{product.sale_price}</span>
                                <span className="original">&#8377;{product.price}</span>
                                <span className="discount">{discount}% OFF</span>
                            </>
                        ) : <span className="price">&#8377;{product.price}</span>}
                    </div>
                    <p className="detail-description">{product.description}</p>
                    <div className="stock-info">
                        {product.stock > 0 ? <span className="in-stock">In Stock ({product.stock} available)</span> : <span className="out-stock">Out of Stock</span>}
                    </div>
                    <div className="quantity-selector">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><FiPlus /></button>
                    </div>
                    <div className="detail-actions">
                        <button className="btn-add-cart" onClick={() => user ? addToCart(product.id, quantity) : alert('Please login')} disabled={product.stock === 0}>
                            <FiShoppingCart /> Add to Cart
                        </button>
                        <button className="btn-wishlist" onClick={addWishlist}><FiHeart /> Wishlist</button>
                    </div>
                </div>
            </div>
            {product.reviews && product.reviews.length > 0 && (
                <div className="reviews-section">
                    <h2>Customer Reviews</h2>
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
