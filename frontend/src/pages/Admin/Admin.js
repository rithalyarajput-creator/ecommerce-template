import React, { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiPlus, FiTrash2, FiEdit, FiGrid, FiList, FiTag, FiBarChart2, FiHome } from 'react-icons/fi';
import API, { API_URL } from '../../utils/api';
import { toast } from 'react-toastify';
import './Admin.css';

const Admin = () => {
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);

    // Product form
    const [showProdForm, setShowProdForm] = useState(false);
    const [editProdId, setEditProdId] = useState(null);
    const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', sale_price: '', category_id: '', subcategory_id: '', sub_subcategory_id: '', stock: '', featured: false, brand: '', meesho_link: '', flipkart_link: '', amazon_link: '' });
    const [prodImage, setProdImage] = useState(null);
    const [prodExtraImages, setProdExtraImages] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [subSubcategories, setSubSubcategories] = useState([]);

    // Category form
    const [showCatForm, setShowCatForm] = useState(false);
    const [editCatId, setEditCatId] = useState(null);
    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [catImage, setCatImage] = useState(null);

    useEffect(() => {
        if (tab === 'dashboard') fetchDashboard();
        if (tab === 'products') { fetchProducts(); fetchCategories(); }
        if (tab === 'orders') fetchOrders();
        if (tab === 'users') fetchUsers();
        if (tab === 'categories') fetchCategories();
    }, [tab]);

    const fetchDashboard = async () => {
        try { const { data } = await API.get('/api/admin.php?action=dashboard'); setStats(data); } catch (err) { console.error(err); }
    };
    const fetchProducts = async () => {
        try { const { data } = await API.get('/api/products.php?action=list&limit=100'); setProducts(data.products); } catch (err) { console.error(err); }
    };
    const fetchCategories = async () => {
        try { const { data } = await API.get('/api/categories.php?action=list'); setCategories(data); } catch (err) { console.error(err); }
    };
    const fetchSubcategories = async (catId) => {
        if (!catId) return setSubcategories([]);
        try { const { data } = await API.get(`/api/subcategories.php?action=list&category_id=${catId}`); setSubcategories(data); } catch (err) { console.error(err); }
    };
    const fetchSubSubcategories = async (subId) => {
        if (!subId) return setSubSubcategories([]);
        try { const { data } = await API.get(`/api/subcategories.php?action=sub-sub&subcategory_id=${subId}`); setSubSubcategories(data); } catch (err) { console.error(err); }
    };
    const fetchOrders = async () => {
        try { const { data } = await API.get('/api/orders.php?action=all'); setOrders(data); } catch (err) { console.error(err); }
    };
    const fetchUsers = async () => {
        try { const { data } = await API.get('/api/admin.php?action=users'); setUsers(data); } catch (err) { console.error(err); }
    };

    const getImgUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/60';
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(prodForm).forEach(key => formData.append(key, prodForm[key]));
        if (prodImage) formData.append('image', prodImage);
        if (prodExtraImages.length > 0) {
            prodExtraImages.forEach(img => formData.append('images[]', img));
        }

        try {
            if (editProdId) {
                await API.post(`/api/products.php?action=update&id=${editProdId}`, formData);
                toast.success('Product updated!');
            } else {
                await API.post('/api/products.php?action=create', formData);
                toast.success('Product added!');
            }
            setShowProdForm(false);
            setEditProdId(null);
            setProdForm({ name: '', description: '', price: '', sale_price: '', category_id: '', subcategory_id: '', sub_subcategory_id: '', stock: '', featured: false, brand: '', meesho_link: '', flipkart_link: '', amazon_link: '' });
            setProdImage(null);
            setProdExtraImages([]);
            fetchProducts();
        } catch (err) { toast.error('Error saving product'); }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            await API.delete(`/api/products.php?action=delete&id=${id}`);
            toast.success('Product deleted!');
            fetchProducts();
        }
    };

    const editProduct = (p) => {
        setProdForm({
            name: p.name,
            description: p.description || '',
            price: p.price,
            sale_price: p.sale_price || '',
            category_id: p.category_id || '',
            subcategory_id: p.subcategory_id || '',
            sub_subcategory_id: p.sub_subcategory_id || '',
            stock: p.stock,
            featured: p.featured === '1' || p.featured === 1,
            brand: p.brand || '',
            meesho_link: p.meesho_link || '',
            flipkart_link: p.flipkart_link || '',
            amazon_link: p.amazon_link || ''
        });
        setEditProdId(p.id);
        setShowProdForm(true);
        if (p.category_id) fetchSubcategories(p.category_id);
        if (p.subcategory_id) fetchSubSubcategories(p.subcategory_id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', catForm.name);
        formData.append('description', catForm.description);
        if (catImage) formData.append('image', catImage);

        try {
            await API.post('/api/categories.php?action=create', formData);
            toast.success('Category added!');
            setShowCatForm(false);
            setCatForm({ name: '', description: '' });
            setCatImage(null);
            fetchCategories();
        } catch (err) { toast.error('Error'); }
    };

    const deleteCategory = async (id) => {
        if (window.confirm('Delete this category?')) {
            await API.delete(`/api/categories.php?action=delete&id=${id}`);
            toast.success('Category deleted!');
            fetchCategories();
        }
    };

    const updateOrderStatus = async (id, order_status, payment_status) => {
        await API.put(`/api/orders.php?action=update-status&id=${id}`, { order_status, payment_status });
        toast.success('Order updated!');
        fetchOrders();
    };

    const deleteUser = async (id) => {
        if (window.confirm('Delete this user?')) {
            await API.delete(`/api/admin.php?action=delete-user&id=${id}`);
            toast.success('User deleted!');
            fetchUsers();
        }
    };

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h3>TopMTop Admin</h3>
                    <span>Dashboard Panel</span>
                </div>
                <nav className="admin-nav">
                    <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}><FiHome /> Dashboard</button>
                    <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}><FiPackage /> Products</button>
                    <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}><FiTag /> Categories</button>
                    <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><FiShoppingBag /> Orders</button>
                    <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><FiUsers /> Users</button>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h1>
                    <div className="admin-user">
                        <span>Welcome, Admin 👋</span>
                    </div>
                </header>

                {tab === 'dashboard' && (
                    <div className="admin-content">
                        <div className="stats-grid">
                            <div className="stat-card blue">
                                <div className="stat-icon"><FiUsers /></div>
                                <div><h3>{stats.totalUsers || 0}</h3><p>Total Users</p></div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon"><FiPackage /></div>
                                <div><h3>{stats.totalProducts || 0}</h3><p>Total Products</p></div>
                            </div>
                            <div className="stat-card orange">
                                <div className="stat-icon"><FiShoppingBag /></div>
                                <div><h3>{stats.totalOrders || 0}</h3><p>Total Orders</p></div>
                            </div>
                            <div className="stat-card purple">
                                <div className="stat-icon"><FiDollarSign /></div>
                                <div><h3>₹{parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN')}</h3><p>Total Revenue</p></div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3 className="card-title">Recent Orders</h3>
                            {stats.recentOrders?.length > 0 ? (
                                <table className="admin-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {stats.recentOrders.map(o => (
                                            <tr key={o.id}>
                                                <td><strong>#{o.id}</strong></td>
                                                <td>{o.user_name}</td>
                                                <td><strong>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</strong></td>
                                                <td><span className={`status ${o.order_status}`}>{o.order_status}</span></td>
                                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="empty-msg">No orders yet</p>}
                        </div>
                    </div>
                )}

                {tab === 'products' && (
                    <div className="admin-content">
                        <div className="tab-header">
                            <div><p className="tab-subtitle">{products.length} products in store</p></div>
                            <button className="btn-add" onClick={() => { setShowProdForm(!showProdForm); setEditProdId(null); setProdForm({ name: '', description: '', price: '', sale_price: '', category_id: '', subcategory_id: '', sub_subcategory_id: '', stock: '', featured: false, brand: '', meesho_link: '', flipkart_link: '', amazon_link: '' }); setProdImage(null); setProdExtraImages([]); }}>
                                <FiPlus /> {showProdForm ? 'Cancel' : 'Add Product'}
                            </button>
                        </div>

                        {showProdForm && (
                            <div className="dashboard-card">
                                <h3 className="card-title">{editProdId ? 'Edit Product' : 'Add New Product'}</h3>
                                <form className="admin-form" onSubmit={handleProductSubmit}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Product Name *</label>
                                            <input placeholder="e.g., iPhone 15 Pro" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Brand</label>
                                            <input placeholder="e.g., Apple" value={prodForm.brand} onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea placeholder="Product description..." value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price (₹) *</label>
                                            <input type="number" placeholder="Original price" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Sale Price (₹)</label>
                                            <input type="number" placeholder="Discounted price" value={prodForm.sale_price} onChange={(e) => setProdForm({ ...prodForm, sale_price: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select value={prodForm.category_id} onChange={(e) => { setProdForm({ ...prodForm, category_id: e.target.value, subcategory_id: '', sub_subcategory_id: '' }); fetchSubcategories(e.target.value); }}>
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Subcategory</label>
                                            <select value={prodForm.subcategory_id} onChange={(e) => { setProdForm({ ...prodForm, subcategory_id: e.target.value, sub_subcategory_id: '' }); fetchSubSubcategories(e.target.value); }}>
                                                <option value="">Select Subcategory</option>
                                                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Sub-Subcategory</label>
                                            <select value={prodForm.sub_subcategory_id} onChange={(e) => setProdForm({ ...prodForm, sub_subcategory_id: e.target.value })}>
                                                <option value="">Select Sub-Subcategory</option>
                                                {subSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Stock</label>
                                            <input type="number" placeholder="Available quantity" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Main Product Image</label>
                                            <input type="file" accept="image/*" onChange={(e) => setProdImage(e.target.files[0])} />
                                        </div>
                                        <div className="form-group">
                                            <label>Additional Images (multiple)</label>
                                            <input type="file" accept="image/*" multiple onChange={(e) => setProdExtraImages(Array.from(e.target.files))} />
                                        </div>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label><input type="checkbox" checked={prodForm.featured} onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })} /> Mark as Featured Product</label>
                                    </div>
                                    <h4 style={{margin: '12px 0 4px', color: '#212121', fontWeight: 600, fontSize: '0.95rem'}}>External Shopping Links (Optional)</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>🛒 Meesho Link</label>
                                            <input type="url" placeholder="https://meesho.com/..." value={prodForm.meesho_link} onChange={(e) => setProdForm({ ...prodForm, meesho_link: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>🛍️ Flipkart Link</label>
                                            <input type="url" placeholder="https://flipkart.com/..." value={prodForm.flipkart_link} onChange={(e) => setProdForm({ ...prodForm, flipkart_link: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>📦 Amazon Link</label>
                                        <input type="url" placeholder="https://amazon.in/..." value={prodForm.amazon_link} onChange={(e) => setProdForm({ ...prodForm, amazon_link: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn-submit">{editProdId ? 'Update Product' : 'Add Product'}</button>
                                </form>
                            </div>
                        )}

                        <div className="dashboard-card">
                            <table className="admin-table">
                                <thead><tr><th>Image</th><th>Name</th><th>Brand</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td><img src={getImgUrl(p.image)} alt="" className="table-img" /></td>
                                            <td>{p.name}</td>
                                            <td>{p.brand || '-'}</td>
                                            <td><strong>₹{parseFloat(p.sale_price || p.price).toLocaleString('en-IN')}</strong></td>
                                            <td><span className={`stock-badge ${p.stock > 10 ? 'good' : p.stock > 0 ? 'low' : 'out'}`}>{p.stock}</span></td>
                                            <td>{p.category_name}</td>
                                            <td className="actions-cell">
                                                <button className="btn-action edit" onClick={() => editProduct(p)}><FiEdit /></button>
                                                <button className="btn-action delete" onClick={() => deleteProduct(p.id)}><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'categories' && (
                    <div className="admin-content">
                        <div className="tab-header">
                            <div><p className="tab-subtitle">{categories.length} categories total</p></div>
                            <button className="btn-add" onClick={() => setShowCatForm(!showCatForm)}>
                                <FiPlus /> {showCatForm ? 'Cancel' : 'Add Category'}
                            </button>
                        </div>

                        {showCatForm && (
                            <div className="dashboard-card">
                                <h3 className="card-title">Add New Category</h3>
                                <form className="admin-form" onSubmit={handleCategorySubmit}>
                                    <div className="form-group">
                                        <label>Category Name *</label>
                                        <input placeholder="e.g., Electronics" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea placeholder="Category description..." value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Category Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => setCatImage(e.target.files[0])} />
                                    </div>
                                    <button type="submit" className="btn-submit">Add Category</button>
                                </form>
                            </div>
                        )}

                        <div className="categories-admin-grid">
                            {categories.map(cat => (
                                <div key={cat.id} className="cat-admin-card">
                                    <img src={getImgUrl(cat.image)} alt={cat.name} />
                                    <div className="cat-admin-info">
                                        <h4>{cat.name}</h4>
                                        <p>{cat.description}</p>
                                        <button className="btn-action delete" onClick={() => deleteCategory(cat.id)}><FiTrash2 /> Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'orders' && (
                    <div className="admin-content">
                        <div className="tab-header">
                            <p className="tab-subtitle">{orders.length} total orders</p>
                        </div>
                        <div className="dashboard-card">
                            <table className="admin-table">
                                <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Order Status</th><th>Payment</th><th>Date</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td><strong>#{o.id}</strong></td>
                                            <td>
                                                <div className="user-cell">
                                                    <strong>{o.user_name}</strong>
                                                    <small>{o.user_email}</small>
                                                </div>
                                            </td>
                                            <td><strong>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</strong></td>
                                            <td>
                                                <select value={o.order_status} onChange={(e) => updateOrderStatus(o.id, e.target.value, o.payment_status)} className={`status-select ${o.order_status}`}>
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select value={o.payment_status} onChange={(e) => updateOrderStatus(o.id, o.order_status, e.target.value)} className={`status-select ${o.payment_status}`}>
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="failed">Failed</option>
                                                </select>
                                            </td>
                                            <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'users' && (
                    <div className="admin-content">
                        <div className="tab-header">
                            <p className="tab-subtitle">{users.length} registered users</p>
                        </div>
                        <div className="dashboard-card">
                            <table className="admin-table">
                                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>#{u.id}</td>
                                            <td><strong>{u.name}</strong></td>
                                            <td>{u.email}</td>
                                            <td>{u.phone || '-'}</td>
                                            <td><span className={`role ${u.role}`}>{u.role}</span></td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td className="actions-cell">
                                                {u.role !== 'admin' && <button className="btn-action delete" onClick={() => deleteUser(u.id)}><FiTrash2 /></button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
