import React, { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';
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
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', sale_price: '', category_id: '', stock: '', featured: false });
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (tab === 'dashboard') fetchDashboard();
        if (tab === 'products') { fetchProducts(); fetchCategories(); }
        if (tab === 'orders') fetchOrders();
        if (tab === 'users') fetchUsers();
    }, [tab]);

    const fetchDashboard = async () => {
        try { const { data } = await API.get('/api/admin.php?action=dashboard'); setStats(data); }
        catch (err) { console.error(err); }
    };
    const fetchProducts = async () => {
        try { const { data } = await API.get('/api/products.php?action=list&limit=100'); setProducts(data.products); }
        catch (err) { console.error(err); }
    };
    const fetchCategories = async () => {
        try { const { data } = await API.get('/api/categories.php?action=list'); setCategories(data); }
        catch (err) { console.error(err); }
    };
    const fetchOrders = async () => {
        try { const { data } = await API.get('/api/orders.php?action=all'); setOrders(data); }
        catch (err) { console.error(err); }
    };
    const fetchUsers = async () => {
        try { const { data } = await API.get('/api/admin.php?action=users'); setUsers(data); }
        catch (err) { console.error(err); }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (image) formData.append('image', image);

        try {
            if (editId) {
                await API.post(`/api/products.php?action=update&id=${editId}`, formData);
                toast.success('Product updated!');
            } else {
                await API.post('/api/products.php?action=create', formData);
                toast.success('Product added!');
            }
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', description: '', price: '', sale_price: '', category_id: '', stock: '', featured: false });
            fetchProducts();
        } catch (err) { toast.error('Error saving product'); }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            await API.delete(`/api/products.php?action=delete&id=${id}`);
            fetchProducts();
        }
    };

    const updateOrderStatus = async (id, order_status, payment_status) => {
        await API.put(`/api/orders.php?action=update-status&id=${id}`, { order_status, payment_status });
        toast.success('Order updated!');
        fetchOrders();
    };

    const editProduct = (p) => {
        setForm({ name: p.name, description: p.description || '', price: p.price, sale_price: p.sale_price || '', category_id: p.category_id || '', stock: p.stock, featured: p.featured === '1' || p.featured === 1 });
        setEditId(p.id);
        setShowForm(true);
    };

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <h3>Admin Panel</h3>
                <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
                <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
                <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
                <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
            </aside>
            <main className="admin-main">
                {tab === 'dashboard' && (
                    <div>
                        <h2>Dashboard</h2>
                        <div className="stats-grid">
                            <div className="stat-card"><FiUsers /><div><h3>{stats.totalUsers || 0}</h3><p>Users</p></div></div>
                            <div className="stat-card"><FiPackage /><div><h3>{stats.totalProducts || 0}</h3><p>Products</p></div></div>
                            <div className="stat-card"><FiShoppingBag /><div><h3>{stats.totalOrders || 0}</h3><p>Orders</p></div></div>
                            <div className="stat-card"><FiDollarSign /><div><h3>&#8377;{stats.totalRevenue || 0}</h3><p>Revenue</p></div></div>
                        </div>
                        <h3 style={{ marginTop: 30 }}>Recent Orders</h3>
                        <table className="admin-table">
                            <thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                            <tbody>
                                {stats.recentOrders?.map(o => (
                                    <tr key={o.id}>
                                        <td>#{o.id}</td><td>{o.user_name}</td><td>&#8377;{o.total_amount}</td>
                                        <td><span className={`status ${o.order_status}`}>{o.order_status}</span></td>
                                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'products' && (
                    <div>
                        <div className="tab-header">
                            <h2>Products</h2>
                            <button className="btn-add" onClick={() => { setShowForm(!showForm); setEditId(null); }}><FiPlus /> Add Product</button>
                        </div>
                        {showForm && (
                            <form className="admin-form" onSubmit={handleProductSubmit}>
                                <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                <div className="form-row">
                                    <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                                    <input type="number" placeholder="Sale Price" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                                    <label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
                                </div>
                                <button type="submit">{editId ? 'Update' : 'Add'} Product</button>
                            </form>
                        )}
                        <table className="admin-table">
                            <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td><img src={p.image ? `${API_URL}${p.image}` : 'https://via.placeholder.com/40'} alt="" className="table-img" /></td>
                                        <td>{p.name}</td><td>&#8377;{p.sale_price || p.price}</td><td>{p.stock}</td><td>{p.category_name}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => editProduct(p)}><FiEdit /></button>
                                            <button className="btn-delete" onClick={() => deleteProduct(p.id)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'orders' && (
                    <div>
                        <h2>Orders</h2>
                        <table className="admin-table">
                            <thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Order Status</th><th>Payment</th><th>Date</th></tr></thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td>#{o.id}</td>
                                        <td>{o.user_name}<br /><small>{o.user_email}</small></td>
                                        <td>&#8377;{o.total_amount}</td>
                                        <td>
                                            <select value={o.order_status} onChange={(e) => updateOrderStatus(o.id, e.target.value, o.payment_status)}>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select value={o.payment_status} onChange={(e) => updateOrderStatus(o.id, o.order_status, e.target.value)}>
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
                )}

                {tab === 'users' && (
                    <div>
                        <h2>Users</h2>
                        <table className="admin-table">
                            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone || '-'}</td>
                                        <td><span className={`role ${u.role}`}>{u.role}</span></td>
                                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
