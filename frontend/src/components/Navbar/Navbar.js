import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiSearch, FiTruck } from 'react-icons/fi';
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

    const isSeller = user?.role === 'seller';
    const isAdmin  = user?.role === 'admin';

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-top">Top</span><span className="logo-m">M</span><span className="logo-top">Top</span>
                </Link>

                <form className="navbar-search" onSubmit={handleSearch}>
                    <input type="text" placeholder="Search jewellery..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="submit"><FiSearch /></button>
                </form>

                <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>

                    {user ? (
                        <>
                            {isSeller ? (
                                <Link to="/seller" className="seller-nav-link" onClick={() => setMenuOpen(false)}>
                                    <FiTruck /> Seller Panel
                                </Link>
                            ) : (
                                <>
                                    <Link to="/wishlist" onClick={() => setMenuOpen(false)}><FiHeart /> Wishlist</Link>
                                    <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
                                        <FiShoppingCart /> Cart
                                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                    </Link>
                                </>
                            )}
                            <div className="user-menu">
                                <button className="user-btn">
                                    <FiUser /> {user.name}
                                    {isSeller && <span className="nav-role-badge seller">Seller</span>}
                                    {isAdmin  && <span className="nav-role-badge admin">Admin</span>}
                                </button>
                                <div className="dropdown">
                                    {!isSeller && !isAdmin && <Link to="/profile">My Profile</Link>}
                                    {!isSeller && !isAdmin && <Link to="/orders">My Orders</Link>}
                                    {isSeller  && <Link to="/seller">Seller Dashboard</Link>}
                                    {isAdmin   && <Link to="/admin">Admin Panel</Link>}
                                    <button onClick={logout}>Logout</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-links">
                            <Link to="/become-seller" className="btn-sell" onClick={() => setMenuOpen(false)}>
                                Become a Seller
                            </Link>
                            <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
                                Sign In
                            </Link>
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
