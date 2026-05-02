import React, { useState, useEffect } from 'react';
import { FiHome, FiPackage, FiShoppingBag, FiDollarSign, FiPlus, FiEdit, FiTrash2, FiEye, FiX, FiUser, FiTruck, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
import API, { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './SellerDashboard.css';

const money = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const SellerDashboard = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [subSubcategories, setSubSubcategories] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [profile, setProfile] = useState({});

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const emptyProd = { name: '', brand: '', description: '', price: '', sale_price: '', stock: '', featured: false, category_id: '', subcategory_id: '', sub_subcategory_id: '', meesho_link: '', flipkart_link: '', amazon_link: '' };
    const [form, setForm] = useState(emptyProd);
    const [mainImage, setMainImage] = useState(null);
    const [extraImages, setExtraImages] = useState([]);

    const fetchStats = async () => {
        try { const { data } = await API.get('/api/seller.php?action=dashboard'); setStats(data); setProfile(data.profile || {}); } catch (e) { console.error(e); }
    };
    const fetchProducts = async () => {
        try { const { data } = await API.get('/api/seller.php?action=my-products&limit=100'); setProducts(data.products || []); } catch (e) { console.error(e); }
    };
    const fetchOrders = async () => {
        try { const { data } = await API.get('/api/seller.php?action=my-orders'); setOrders(data || []); } catch (e) { console.error(e); }
    };
    const fetchCategories = async () => {
        try { const { data } = await API.get('/api/categories.php?action=list'); setCategories(data); } catch (e) { console.error(e); }
    };
    const fetchSubcategories = async (catId) => {
        if (!catId) return setSubcategories([]);
        try { const { data } = await API.get(`/api/subcategories.php?action=list&category_id=${catId}`); setSubcategories(data); } catch (e) { console.error(e); }
    };
    const fetchSubSub = async (subId) => {
        if (!subId) return setSubSubcategories([]);
        try { const { data } = await API.get(`/api/subcategories.php?action=sub-sub&subcategory_id=${subId}`); setSubSubcategories(data); } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (tab === 'dashboard') fetchStats();
        if (tab === 'products') { fetchProducts(); fetchCategories(); }
        if (tab === 'orders') fetchOrders();
    }, [tab]);

    const getImgUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/60';
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.keys(form).forEach(k => fd.append(k, form[k]));
        if (mainImage) fd.append('image', mainImage);
        if (extraImages.length) extraImages.forEach(img => fd.append('images[]', img));
        try {
            if (editId) {
                await API.post(`/api/products.php?action=update&id=${editId}`, fd);
                toast.success('Product updated!');
            } else {
                await API.post('/api/seller.php?action=add-product', fd);
                toast.success('Product added!');
            }
            setShowForm(false); setEditId(null); setForm(emptyProd); setMainImage(null); setExtraImages([]);
            fetchProducts();
        } catch (err) { toast.error('Error saving product'); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await API.delete(`/api/seller.php?action=delete-product&id=${id}`);
            toast.success('Deleted!'); fetchProducts();
        } catch (err) { toast.error('Error deleting'); }
    };

    const editProduct = (p) => {
        setForm({
            name: p.name, brand: p.brand || '', description: p.description || '',
            price: p.price, sale_price: p.sale_price || '', stock: p.stock,
            featured: p.featured === '1' || p.featured === 1, category_id: p.category_id || '',
            subcategory_id: p.subcategory_id || '', sub_subcategory_id: p.sub_subcategory_id || '',
            meesho_link: p.meesho_link || '', flipkart_link: p.flipkart_link || '', amazon_link: p.amazon_link || ''
        });
        setEditId(p.id); setShowForm(true);
        if (p.category_id) fetchSubcategories(p.category_id);
        if (p.subcategory_id) fetchSubSub(p.subcategory_id);
    };

    return (
        <div className="seller-page">
            <aside className="seller-sidebar">
                <div className="seller-brand">
                    <div className="seller-shop-name">{profile.shop_name || user?.name}</div>
                    <span className="seller-badge">Seller</span>
                </div>
                <nav className="seller-nav">
                    <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}><FiHome /> Dashboard</button>
                    <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}><FiPackage /> My Products</button>
                    <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><FiShoppingBag /> My Orders</button>
                    <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}><FiUser /> Shop Profile</button>
                </nav>
            </aside>

            <main className="seller-main">
                <header className="seller-header">
                    <h1>{tab === 'dashboard' ? 'Seller Dashboard' : tab === 'products' ? 'My Products' : tab === 'orders' ? 'My Orders' : 'Shop Profile'}</h1>
                    <span className="seller-header-name">👋 {user?.name}</span>
                </header>

                {/* ── DASHBOARD ── */}
                {tab === 'dashboard' && (
                    <div className="seller-content">
                        <div className="seller-stats-grid">
                            <div className="seller-stat blue"><FiPackage /><div><h3>{stats.totalProducts || 0}</h3><p>My Products</p></div></div>
                            <div className="seller-stat green"><FiDollarSign /><div><h3>{money(stats.totalRevenue)}</h3><p>Total Revenue</p></div></div>
                            <div className="seller-stat orange"><FiShoppingBag /><div><h3>{stats.totalOrders || 0}</h3><p>Total Orders</p></div></div>
                            <div className="seller-stat red"><FiClock /><div><h3>{stats.pendingOrders || 0}</h3><p>Pending Orders</p></div></div>
                        </div>

                        <div className="seller-card">
                            <h3 className="seller-card-title">Recent Orders</h3>
                            {stats.recentOrders?.length > 0 ? (
                                <table className="seller-table">
                                    <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {stats.recentOrders.map(o => (
                                            <tr key={o.id}>
                                                <td><strong>#{o.id}</strong></td>
                                                <td>{o.customer_name}</td>
                                                <td><strong>{money(o.total_amount)}</strong></td>
                                                <td><span className={`s-status ${o.order_status}`}>{o.order_status}</span></td>
                                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="empty-msg">No orders yet. List products to start selling!</p>}
                        </div>

                        <div className="seller-quick-actions">
                            <button className="seller-qa-btn" onClick={() => { setTab('products'); setShowForm(true); }}>
                                <FiPlus /> Add New Product
                            </button>
                            <button className="seller-qa-btn outline" onClick={() => setTab('orders')}>
                                <FiShoppingBag /> View Orders
                            </button>
                        </div>
                    </div>
                )}

                {/* ── PRODUCTS ── */}
                {tab === 'products' && (
                    <div className="seller-content">
                        <div className="seller-tab-header">
                            <p>{products.length} products listed</p>
                            <button className="seller-btn-add" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyProd); }}>
                                <FiPlus /> {showForm ? 'Cancel' : 'Add Product'}
                            </button>
                        </div>

                        {showForm && (
                            <div className="seller-card">
                                <h3 className="seller-card-title">{editId ? 'Edit Product' : 'Add New Product'}</h3>
                                <form className="seller-form" onSubmit={handleSubmit}>
                                    <div className="sform-row">
                                        <div className="sform-group"><label>Product Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Gold Kundan Necklace" /></div>
                                        <div className="sform-group"><label>Brand</label><input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Amshine" /></div>
                                    </div>
                                    <div className="sform-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your product..." /></div>
                                    <div className="sform-row">
                                        <div className="sform-group"><label>Price (₹) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
                                        <div className="sform-group"><label>Sale Price (₹)</label><input type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} /></div>
                                        <div className="sform-group"><label>Stock *</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></div>
                                    </div>
                                    <div className="sform-row">
                                        <div className="sform-group"><label>Category</label>
                                            <select value={form.category_id} onChange={e => { setForm({ ...form, category_id: e.target.value, subcategory_id: '', sub_subcategory_id: '' }); fetchSubcategories(e.target.value); }}>
                                                <option value="">Select</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select></div>
                                        <div className="sform-group"><label>Subcategory</label>
                                            <select value={form.subcategory_id} onChange={e => { setForm({ ...form, subcategory_id: e.target.value, sub_subcategory_id: '' }); fetchSubSub(e.target.value); }}>
                                                <option value="">Select</option>
                                                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select></div>
                                        <div className="sform-group"><label>Sub-subcategory</label>
                                            <select value={form.sub_subcategory_id} onChange={e => setForm({ ...form, sub_subcategory_id: e.target.value })}>
                                                <option value="">Select</option>
                                                {subSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select></div>
                                    </div>
                                    <div className="sform-row">
                                        <div className="sform-group"><label>Main Image</label><input type="file" accept="image/*" onChange={e => setMainImage(e.target.files[0])} /></div>
                                        <div className="sform-group"><label>Extra Images</label><input type="file" accept="image/*" multiple onChange={e => setExtraImages(Array.from(e.target.files))} /></div>
                                    </div>
                                    <div className="sform-group checkbox-group"><label><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Mark as Featured</label></div>
                                    <h4 className="sform-section-title">External Shopping Links (Optional)</h4>
                                    <div className="sform-row">
                                        <div className="sform-group"><label>🛒 Meesho Link</label><input type="url" value={form.meesho_link} onChange={e => setForm({ ...form, meesho_link: e.target.value })} placeholder="https://meesho.com/..." /></div>
                                        <div className="sform-group"><label>🛍️ Flipkart Link</label><input type="url" value={form.flipkart_link} onChange={e => setForm({ ...form, flipkart_link: e.target.value })} placeholder="https://flipkart.com/..." /></div>
                                    </div>
                                    <div className="sform-group"><label>📦 Amazon Link</label><input type="url" value={form.amazon_link} onChange={e => setForm({ ...form, amazon_link: e.target.value })} placeholder="https://amazon.in/..." /></div>
                                    <button type="submit" className="seller-btn-submit">{editId ? 'Update Product' : 'Add Product'}</button>
                                </form>
                            </div>
                        )}

                        <div className="seller-card">
                            <table className="seller-table">
                                <thead><tr><th>Image</th><th>Product</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {products.length === 0 && <tr><td colSpan="6" className="empty-msg">No products yet. Add your first product!</td></tr>}
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td><img src={getImgUrl(p.image)} alt="" className="s-table-img" /></td>
                                            <td><strong>{p.name}</strong>{p.brand && <div><small>{p.brand}</small></div>}</td>
                                            <td><strong>{money(p.sale_price || p.price)}</strong>{p.sale_price && <div><small style={{textDecoration:'line-through',color:'#999'}}>{money(p.price)}</small></div>}</td>
                                            <td><span className={`s-stock ${p.stock > 10 ? 'good' : p.stock > 0 ? 'low' : 'out'}`}>{p.stock}</span></td>
                                            <td>{p.category_name || '-'}</td>
                                            <td>
                                                <button className="s-btn edit" onClick={() => editProduct(p)}><FiEdit /></button>
                                                <button className="s-btn delete" onClick={() => deleteProduct(p.id)}><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ORDERS ── */}
                {tab === 'orders' && (
                    <div className="seller-content">
                        <div className="seller-card">
                            <table className="seller-table">
                                <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {orders.length === 0 && <tr><td colSpan="7" className="empty-msg">No orders yet</td></tr>}
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td><strong>#{o.id}</strong></td>
                                            <td>
                                                <div className="s-user-cell">
                                                    <strong>{o.customer_name}</strong>
                                                    <small>{o.customer_email}</small>
                                                </div>
                                            </td>
                                            <td>{o.items?.length || 0} item(s)</td>
                                            <td><strong>{money(o.total_amount)}</strong></td>
                                            <td><span className={`s-status ${o.order_status}`}>{o.order_status}</span></td>
                                            <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                            <td><button className="s-btn view" onClick={() => setSelectedOrder(o)}><FiEye /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedOrder && (
                            <div className="seller-modal-overlay" onClick={() => setSelectedOrder(null)}>
                                <div className="seller-modal" onClick={e => e.stopPropagation()}>
                                    <div className="seller-modal-header">
                                        <h3>Order #{selectedOrder.id}</h3>
                                        <button onClick={() => setSelectedOrder(null)}><FiX /></button>
                                    </div>
                                    <div className="seller-modal-body">
                                        <div className="s-order-grid">
                                            <div><h4>Customer</h4><p><strong>{selectedOrder.customer_name}</strong><br/>{selectedOrder.customer_email}<br/>📞 {selectedOrder.customer_phone}</p></div>
                                            <div><h4>Shipping</h4><p>{selectedOrder.shipping_address}<br/>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p></div>
                                            <div><h4>Payment</h4><p><span className={`s-status ${selectedOrder.payment_status}`}>{selectedOrder.payment_method?.toUpperCase()} • {selectedOrder.payment_status}</span></p></div>
                                            <div><h4>Status</h4><p><span className={`s-status ${selectedOrder.order_status}`}>{selectedOrder.order_status}</span></p></div>
                                        </div>
                                        <h4 style={{marginTop:'16px',marginBottom:'10px'}}>Your Items in This Order</h4>
                                        <table className="seller-table">
                                            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                                            <tbody>
                                                {(selectedOrder.items || []).map(i => (
                                                    <tr key={i.id}>
                                                        <td><div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                                                            <img src={getImgUrl(i.image)} alt="" style={{width:'36px',height:'36px',objectFit:'contain',borderRadius:'4px'}} />
                                                            {i.name}
                                                        </div></td>
                                                        <td>{i.quantity}</td>
                                                        <td>{money(i.price)}</td>
                                                        <td>{money(parseFloat(i.price) * parseInt(i.quantity))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── PROFILE ── */}
                {tab === 'profile' && (
                    <div className="seller-content">
                        <div className="seller-card">
                            <h3 className="seller-card-title">Shop Profile</h3>
                            <div className="s-profile-grid">
                                <div className="s-profile-item"><label>Shop Name</label><p>{profile.shop_name || '-'}</p></div>
                                <div className="s-profile-item"><label>Status</label><p><span className={`s-status ${profile.status === 'approved' ? 'delivered' : 'pending'}`}>{profile.status || 'pending'}</span></p></div>
                                <div className="s-profile-item"><label>Phone</label><p>{profile.phone || '-'}</p></div>
                                <div className="s-profile-item"><label>WhatsApp</label><p>{profile.whatsapp || '-'}</p></div>
                                <div className="s-profile-item"><label>GST Number</label><p>{profile.gst_number || '-'}</p></div>
                                <div className="s-profile-item"><label>City</label><p>{profile.city || '-'}</p></div>
                                <div className="s-profile-item"><label>State</label><p>{profile.state || '-'}</p></div>
                                <div className="s-profile-item"><label>Joined</label><p>{profile.joined_at ? new Date(profile.joined_at).toLocaleDateString() : '-'}</p></div>
                            </div>
                            {profile.shop_description && (
                                <div style={{marginTop:'16px'}}><label style={{fontWeight:600,fontSize:'0.85rem',color:'#424242'}}>Shop Description</label><p style={{marginTop:'6px',color:'#555',lineHeight:1.6}}>{profile.shop_description}</p></div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SellerDashboard;
