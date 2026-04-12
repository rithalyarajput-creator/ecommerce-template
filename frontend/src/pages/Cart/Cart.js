import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../utils/api';
import './Cart.css';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, getTotal } = useCart();

    if (cartItems.length === 0) return (
        <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart to continue shopping.</p>
            <Link to="/products" className="btn-shop">Continue Shopping</Link>
        </div>
    );

    return (
        <div className="cart-page">
            <h2>Shopping Cart ({cartItems.length} items)</h2>
            <div className="cart-layout">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : 'https://via.placeholder.com/100'} alt={item.name} />
                            <div className="item-info">
                                <Link to={`/product/${item.product_id}`}><h3>{item.name}</h3></Link>
                                <p className="item-price">&#8377;{item.sale_price || item.price}</p>
                            </div>
                            <div className="item-quantity">
                                <button onClick={() => updateQuantity(item.id, parseInt(item.quantity) - 1)}><FiMinus /></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, parseInt(item.quantity) + 1)}><FiPlus /></button>
                            </div>
                            <p className="item-total">&#8377;{((item.sale_price || item.price) * item.quantity).toFixed(2)}</p>
                            <button className="btn-remove" onClick={() => removeFromCart(item.id)}><FiTrash2 /></button>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row"><span>Subtotal</span><span>&#8377;{getTotal().toFixed(2)}</span></div>
                    <div className="summary-row"><span>Shipping</span><span className="free">FREE</span></div>
                    <div className="summary-total"><span>Total</span><span>&#8377;{getTotal().toFixed(2)}</span></div>
                    <Link to="/checkout" className="btn-checkout">Proceed to Checkout</Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
