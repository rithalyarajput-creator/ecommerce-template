import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) { navigate(`/products?search=${search}`); setSearch(''); }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-top">Top</span><span className="logo-m">M</span><span className="logo-top">Top</span>
                </Link>

                <form className="navbar-search" onSubmit={handleSearch}>
                    <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="submit"><FiSearch /></button>
                </form>

                <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
                    {user ? (
                        <>
                            <Link to="/wishlist" onClick={() => setMenuOpen(false)}><FiHeart /> Wishlist</Link>
                            <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
                                <FiShoppingCart /> Cart
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                            <div className="user-menu">
                                <button className="user-btn"><FiUser /> {user.name}</button>
                                <div className="dropdown">
                                    <Link to="/profile">My Profile</Link>
                                    <Link to="/orders">My Orders</Link>
                                    {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
                                    <button onClick={logout}>Logout</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="btn-login">Login</Link>
                            <Link to="/register" className="btn-register">Register</Link>
                        </div>
                    )}
                </div>

                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
