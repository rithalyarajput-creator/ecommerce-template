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

    return (
        <div className="product-card">
            {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
            <Link to={`/product/${product.id}`}>
                <div className="product-image">
                    <img src={product.image ? `${API_URL}${product.image}` : 'https://via.placeholder.com/250'} alt={product.name} />
                </div>
                <div className="product-info">
                    <p className="product-category">{product.category_name}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-rating">
                        <FiStar className="star-icon" />
                        <span>{product.rating || 0}</span>
                        <span className="review-count">({product.num_reviews || 0})</span>
                    </div>
                    <div className="product-price">
                        {product.sale_price ? (
                            <>
                                <span className="current-price">&#8377;{product.sale_price}</span>
                                <span className="original-price">&#8377;{product.price}</span>
                            </>
                        ) : (
                            <span className="current-price">&#8377;{product.price}</span>
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
