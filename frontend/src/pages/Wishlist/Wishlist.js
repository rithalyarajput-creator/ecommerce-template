import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import API, { API_URL } from '../../utils/api';
import './Wishlist.css';

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const fetch = async () => {
        try { const { data } = await API.get('/api/wishlist.php?action=list'); setItems(data); }
        catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const removeItem = async (productId) => {
        await API.delete(`/api/wishlist.php?action=remove&product_id=${productId}`);
        fetch();
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="wishlist-page">
            <h2>My Wishlist</h2>
            {items.length === 0 ? <p className="empty">Your wishlist is empty.</p> : (
                <div className="wishlist-grid">
                    {items.map(item => (
                        <div key={item.id} className="wishlist-card">
                            <Link to={`/product/${item.product_id}`}>
                                <img src={item.image ? `${API_URL}${item.image}` : 'https://via.placeholder.com/250'} alt={item.name} />
                                <h3>{item.name}</h3>
                                <p className="price">&#8377;{item.sale_price || item.price}</p>
                            </Link>
                            <div className="wishlist-actions">
                                <button onClick={() => { addToCart(item.product_id); removeItem(item.product_id); }}><FiShoppingCart /> Add to Cart</button>
                                <button className="btn-remove" onClick={() => removeItem(item.product_id)}><FiTrash2 /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
