import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/api';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();

    const discount = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (user) addToCart(product.id);
        else alert('Please login to add items to cart');
    };

    const getImageUrl = () => {
        if (!product.image) return 'https://via.placeholder.com/300';
        if (product.image.startsWith('http')) return product.image;
        return `${API_URL}${product.image}`;
    };

    return (
        <div className="product-card">
            {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
            <Link to={`/product/${product.id}`}>
                <div className="product-image">
                    <img src={getImageUrl()} alt={product.name} />
                </div>
                <div className="product-info">
                    {product.brand && <p className="product-category">{product.brand}</p>}
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-rating">
                        <span className="rating-badge"><FiStar className="star-icon" /> {product.rating || 0}</span>
                        <span className="review-count">({product.num_reviews || 0})</span>
                    </div>
                    <div className="product-price">
                        {product.sale_price ? (
                            <>
                                <span className="current-price">₹{parseFloat(product.sale_price).toLocaleString('en-IN')}</span>
                                <span className="original-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                                <span className="discount-text">{discount}% off</span>
                            </>
                        ) : (
                            <span className="current-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                        )}
                    </div>
                </div>
            </Link>
            <div className="product-actions">
                <button className="btn-add-cart" onClick={handleAddToCart}>
                    <FiShoppingCart /> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
