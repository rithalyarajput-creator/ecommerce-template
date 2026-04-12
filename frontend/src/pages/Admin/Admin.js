import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiPlus, FiTrash2, FiEdit, FiTag, FiHome, FiCheckCircle, FiDownload, FiGift, FiUserCheck, FiClock, FiAlertTriangle, FiTrendingUp, FiFilter, FiEye, FiX, FiSearch, FiChevronRight, FiChevronDown, FiFolder, FiFolderPlus } from 'react-icons/fi';
import API, { API_URL } from '../../utils/api';
import { toast } from 'react-toastify';
import './Admin.css';

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const money = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const Admin = () => {
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [products, setProducts] = useState([]);
    const [productStats, setProductStats] = useState({});
    const [orders, setOrders] = useState([]);
    const [orderAnalytics, setOrderAnalytics] = useState({});
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [leads, setLeads] = useState([]);
    const [leadStats, setLeadStats] = useState({});

    // Product form
    const [showProdForm, setShowProdForm] = useState(false);
    const [editProdId, setEditProdId] = useState(null);
    const emptyProd = { name: '', description: '', price: '', sale_price: '', category_id: '', subcategory_id: '', sub_subcategory_id: '', stock: '', featured: false, brand: '', meesho_link: '', flipkart_link: '', amazon_link: '' };
    const [prodForm, setProdForm] = useState(emptyProd);
    const [prodImage, setProdImage] = useState(null);
    const [prodExtraImages, setProdExtraImages] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [subSubcategories, setSubSubcategories] = useState([]);
    const [editProductImages, setEditProductImages] = useState([]);
    const [editMainImage, setEditMainImage] = useState('');

    // Category tree + form
    const [categoryTree, setCategoryTree] = useState([]);
    const [expandedCats, setExpandedCats] = useState({});
    const [expandedSubs, setExpandedSubs] = useState({});
    // catNodeForm: { level: 'cat'|'sub'|'subsub', mode: 'create'|'edit', id, parentId, name, description, image, currentImage }
    const [catNodeForm, setCatNodeForm] = useState(null);

    // Coupons
    const [showCoupForm, setShowCoupForm] = useState(false);
    const [editCoupId, setEditCoupId] = useState(null);
    const emptyCoup = { code: '', description: '', discount_type: 'percent', discount_value: '', min_order_amount: '', max_discount: '', usage_limit: '', valid_from: '', valid_until: '', active: 1 };
    const [coupForm, setCoupForm] = useState(emptyCoup);

    // Orders filters + detail modal
    const [orderFilter, setOrderFilter] = useState({ from: daysAgo(29), to: today(), status: '', search: '' });
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Leads filters + detail modal
    const [leadFilter, setLeadFilter] = useState({ status: '', search: '' });
    const [selectedLead, setSelectedLead] = useState(null);

    const fetchDashboard = async () => {
        try { const { data } = await API.get('/api/admin.php?action=dashboard'); setStats(data); } catch (err) { console.error(err); }
    };
    const fetchProducts = async () => {
        try { const { data } = await API.get('/api/products.php?action=list&limit=200'); setProducts(data.products); } catch (err) { console.error(err); }
    };
    const fetchProductStats = async () => {
        try { const { data } = await API.get('/api/admin.php?action=product-analytics'); setProductStats(data); } catch (err) { console.error(err); }
    };
    const fetchCategories = async () => {
        try { const { data } = await API.get('/api/categories.php?action=list'); setCategories(data); } catch (err) { console.error(err); }
    };
    const fetchCategoryTree = async () => {
        try { const { data } = await API.get('/api/categories.php?action=tree'); setCategoryTree(data); } catch (err) { console.error(err); }
    };
    const fetchSubcategories = async (catId) => {
        if (!catId) return setSubcategories([]);
        try { const { data } = await API.get(`/api/subcategories.php?action=list&category_id=${catId}`); setSubcategories(data); } catch (err) { console.error(err); }
    };
    const fetchSubSubcategories = async (subId) => {
        if (!subId) return setSubSubcategories([]);
        try { const { data } = await API.get(`/api/subcategories.php?action=sub-sub&subcategory_id=${subId}`); setSubSubcategories(data); } catch (err) { console.error(err); }
    };

    const fetchOrders = useCallback(async () => {
        try {
            const q = new URLSearchParams({ action: 'all', ...orderFilter }).toString();
            const { data } = await API.get(`/api/orders.php?${q}`);
            setOrders(data);
        } catch (err) { console.error(err); }
    }, [orderFilter]);

    const fetchOrderAnalytics = useCallback(async () => {
        try {
            const { data } = await API.get(`/api/admin.php?action=order-analytics&from=${orderFilter.from}&to=${orderFilter.to}`);
            setOrderAnalytics(data);
        } catch (err) { console.error(err); }
    }, [orderFilter.from, orderFilter.to]);

    const fetchUsers = async () => {
        try { const { data } = await API.get('/api/admin.php?action=users'); setUsers(data); } catch (err) { console.error(err); }
    };
    const fetchCoupons = async () => {
        try { const { data } = await API.get('/api/coupons.php?action=list'); setCoupons(data); } catch (err) { console.error(err); }
    };
    const fetchLeads = useCallback(async () => {
        try {
            const q = new URLSearchParams({ action: 'list', ...leadFilter }).toString();
            const { data } = await API.get(`/api/leads.php?${q}`);
            setLeads(data);
        } catch (err) { console.error(err); }
    }, [leadFilter]);
    const fetchLeadStats = async () => {
        try { const { data } = await API.get('/api/leads.php?action=stats'); setLeadStats(data); } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (tab === 'dashboard') fetchDashboard();
        if (tab === 'products') { fetchProducts(); fetchCategories(); fetchProductStats(); }
        if (tab === 'orders') { fetchOrders(); fetchOrderAnalytics(); }
        if (tab === 'users') fetchUsers();
        if (tab === 'categories') { fetchCategories(); fetchCategoryTree(); }
        if (tab === 'coupons') fetchCoupons();
        if (tab === 'leads') { fetchLeads(); fetchLeadStats(); }
    }, [tab, fetchOrders, fetchOrderAnalytics, fetchLeads]);

    const getImgUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/60';
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    // --- Products ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(prodForm).forEach(key => formData.append(key, prodForm[key]));
        if (prodImage) formData.append('image', prodImage);
        if (prodExtraImages.length > 0) prodExtraImages.forEach(img => formData.append('images[]', img));

        try {
            if (editProdId) {
                await API.post(`/api/products.php?action=update&id=${editProdId}`, formData);
                toast.success('Product updated!');
            } else {
                await API.post('/api/products.php?action=create', formData);
                toast.success('Product added!');
            }
            setShowProdForm(false); setEditProdId(null); setProdForm(emptyProd);
            setProdImage(null); setProdExtraImages([]);
            fetchProducts(); fetchProductStats();
        } catch (err) { toast.error('Error saving product'); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        await API.delete(`/api/products.php?action=delete&id=${id}`);
        toast.success('Product deleted!');
        fetchProducts(); fetchProductStats();
    };

    const editProduct = async (p) => {
        setProdForm({
            name: p.name, description: p.description || '', price: p.price,
            sale_price: p.sale_price || '', category_id: p.category_id || '',
            subcategory_id: p.subcategory_id || '', sub_subcategory_id: p.sub_subcategory_id || '',
            stock: p.stock, featured: p.featured === '1' || p.featured === 1, brand: p.brand || '',
            meesho_link: p.meesho_link || '', flipkart_link: p.flipkart_link || '', amazon_link: p.amazon_link || ''
        });
        setEditProdId(p.id); setEditMainImage(p.image || ''); setShowProdForm(true);
        if (p.category_id) fetchSubcategories(p.category_id);
        if (p.subcategory_id) fetchSubSubcategories(p.subcategory_id);
        try {
            const { data: fullImgs } = await API.get(`/api/products.php?action=list-images&product_id=${p.id}`);
            setEditProductImages(fullImgs || []);
        } catch (err) { setEditProductImages([]); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteExistingImage = async (imgId) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            await API.delete(`/api/products.php?action=delete-image&image_id=${imgId}`);
            toast.success('Image deleted');
            const { data } = await API.get(`/api/products.php?action=list-images&product_id=${editProdId}`);
            setEditProductImages(data || []);
        } catch (err) { toast.error('Error deleting image'); }
    };

    const setAsPrimaryImage = async (imageUrl) => {
        try {
            const fd = new FormData();
            fd.append('image_url', imageUrl);
            await API.post(`/api/products.php?action=set-primary-image&product_id=${editProdId}`, fd);
            setEditMainImage(imageUrl); toast.success('Primary image updated'); fetchProducts();
        } catch (err) { toast.error('Error updating primary image'); }
    };

    const uploadAdditionalImages = async (files) => {
        if (!files || files.length === 0) return;
        const fd = new FormData();
        Array.from(files).forEach(f => fd.append('images[]', f));
        try {
            await API.post(`/api/products.php?action=add-images&product_id=${editProdId}`, fd);
            toast.success('Images uploaded');
            const { data } = await API.get(`/api/products.php?action=list-images&product_id=${editProdId}`);
            setEditProductImages(data || []);
        } catch (err) { toast.error('Error uploading'); }
    };

    // --- Categories (tree CRUD) ---
    const toggleCat = (id) => setExpandedCats(s => ({ ...s, [id]: !s[id] }));
    const toggleSub = (id) => setExpandedSubs(s => ({ ...s, [id]: !s[id] }));

    const openCatForm = (level, mode, parentId = null, node = null) => {
        setCatNodeForm({
            level, mode,
            id: node ? node.id : null,
            parentId,
            parentCatId: level === 'subsub' ? (categoryTree.find(c => (c.subcategories || []).some(s => s.id === parentId))?.id || '') : '',
            name: node ? node.name : '',
            description: node ? node.description || '' : '',
            image: null,
            currentImage: node ? node.image || '' : ''
        });
    };

    const submitCatNode = async (e) => {
        e.preventDefault();
        const f = catNodeForm;

        // Validation for nested levels
        if (f.mode === 'create' && f.level === 'sub' && !f.parentId) {
            return toast.error('Please select a parent category');
        }
        if (f.mode === 'create' && f.level === 'subsub' && !f.parentId) {
            return toast.error('Please select a parent subcategory');
        }

        const fd = new FormData();
        fd.append('name', f.name);
        fd.append('description', f.description);
        if (f.image) fd.append('image', f.image);

        let url = '';
        if (f.level === 'cat') {
            url = f.mode === 'create'
                ? '/api/categories.php?action=create'
                : `/api/categories.php?action=update&id=${f.id}`;
        } else if (f.level === 'sub') {
            if (f.mode === 'create') { fd.append('category_id', f.parentId); url = '/api/subcategories.php?action=create-sub'; }
            else { url = `/api/subcategories.php?action=update-sub&id=${f.id}`; }
        } else {
            if (f.mode === 'create') { fd.append('subcategory_id', f.parentId); url = '/api/subcategories.php?action=create-sub-sub'; }
            else { url = `/api/subcategories.php?action=update-sub-sub&id=${f.id}`; }
        }

        try {
            await API.post(url, fd);
            toast.success(f.mode === 'create' ? 'Added successfully!' : 'Updated successfully!');
            setCatNodeForm(null);
            fetchCategoryTree();
            if (f.level === 'cat') fetchCategories();
        } catch (err) { toast.error('Error saving'); }
    };

    const deleteCategoryNode = async (level, id, productCount) => {
        const levelName = level === 'cat' ? 'category' : level === 'sub' ? 'subcategory' : 'sub-subcategory';
        let msg = `Delete this ${levelName}?`;
        if (productCount > 0) msg += `\n\nWarning: ${productCount} product(s) are linked. Their ${levelName} will be unset.`;
        if (!window.confirm(msg)) return;

        let url = '';
        if (level === 'cat') url = `/api/categories.php?action=delete&id=${id}`;
        else if (level === 'sub') url = `/api/subcategories.php?action=delete-sub&id=${id}`;
        else url = `/api/subcategories.php?action=delete-sub-sub&id=${id}`;

        await API.delete(url);
        toast.success('Deleted!');
        fetchCategoryTree();
        if (level === 'cat') fetchCategories();
    };

    // --- Orders ---
    const updateOrderStatus = async (id, order_status, payment_status) => {
        await API.put(`/api/orders.php?action=update-status&id=${id}`, { order_status, payment_status });
        toast.success('Order updated!');
        fetchOrders(); fetchOrderAnalytics();
    };

    const confirmOrder = async (id) => {
        await API.post(`/api/orders.php?action=confirm&id=${id}`);
        toast.success('Order confirmed!');
        fetchOrders(); fetchOrderAnalytics();
    };

    const viewOrder = async (id) => {
        try {
            const { data } = await API.get(`/api/orders.php?action=detail&id=${id}`);
            setSelectedOrder(data);
        } catch (err) { toast.error('Could not load order'); }
    };

    const printOrderSlip = (order) => {
        const w = window.open('', '_blank', 'width=800,height=900');
        if (!w) return toast.error('Popup blocked - allow popups to print');
        w.document.write(buildSlipHtml([order]));
        w.document.close();
        setTimeout(() => w.print(), 300);
    };

    const printDateRangeSlips = () => {
        if (orders.length === 0) return toast.info('No orders in selected range');
        const w = window.open('', '_blank', 'width=800,height=900');
        if (!w) return toast.error('Popup blocked');
        // Need items for each order - fetch in parallel
        Promise.all(orders.map(o => API.get(`/api/orders.php?action=detail&id=${o.id}`).then(r => r.data)))
            .then(fullOrders => {
                w.document.write(buildSlipHtml(fullOrders, `Orders ${orderFilter.from} to ${orderFilter.to}`));
                w.document.close();
                setTimeout(() => w.print(), 400);
            })
            .catch(() => { w.close(); toast.error('Error loading orders'); });
    };

    const buildSlipHtml = (ordersList, rangeLabel = null) => {
        const rows = ordersList.map(o => {
            const items = (o.items || []).map(i => `
                <tr>
                    <td>${i.name}${i.brand ? ' (' + i.brand + ')' : ''}</td>
                    <td style="text-align:center">${i.quantity}</td>
                    <td style="text-align:right">₹${parseFloat(i.price).toFixed(2)}</td>
                    <td style="text-align:right">₹${(parseFloat(i.price) * parseInt(i.quantity)).toFixed(2)}</td>
                </tr>`).join('');
            return `
            <div class="slip">
                <div class="slip-header">
                    <div>
                        <h2>TopMTop</h2>
                        <small>Order Invoice / Slip</small>
                    </div>
                    <div class="slip-order">
                        <div><strong>Order #${o.id}</strong></div>
                        <div>Date: ${new Date(o.created_at).toLocaleString()}</div>
                        <div>Status: <strong>${o.order_status}</strong> / ${o.payment_status}</div>
                    </div>
                </div>
                <div class="slip-info">
                    <div><strong>Customer:</strong> ${o.user_name || ''}<br/>
                    ${o.user_email || ''}<br/>
                    Phone: ${o.phone || '-'}</div>
                    <div><strong>Shipping:</strong><br/>
                    ${o.shipping_address || ''}<br/>
                    ${o.city || ''}, ${o.state || ''} - ${o.pincode || ''}</div>
                </div>
                <table class="slip-items">
                    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                    <tbody>${items}</tbody>
                </table>
                <div class="slip-totals">
                    ${o.subtotal ? `<div><span>Subtotal</span><span>₹${parseFloat(o.subtotal).toFixed(2)}</span></div>` : ''}
                    ${parseFloat(o.discount_amount || 0) > 0 ? `<div><span>Discount (${o.coupon_code || ''})</span><span>- ₹${parseFloat(o.discount_amount).toFixed(2)}</span></div>` : ''}
                    <div class="total-line"><span>Total</span><span>₹${parseFloat(o.total_amount).toFixed(2)}</span></div>
                    <div><span>Payment</span><span>${o.payment_method?.toUpperCase()} (${o.payment_status})</span></div>
                </div>
                <div class="slip-footer">Thank you for shopping with TopMTop!</div>
            </div>`;
        }).join('');

        return `<!DOCTYPE html><html><head><title>Order Slip</title>
        <style>
            body { font-family: Arial, sans-serif; background: #fff; color: #111; margin: 0; padding: 20px; }
            .range-header { text-align: center; margin-bottom: 16px; font-size: 1.1rem; font-weight: 600; }
            .slip { border: 1px solid #ddd; padding: 22px; max-width: 760px; margin: 0 auto 20px; page-break-after: always; }
            .slip:last-child { page-break-after: auto; }
            .slip-header { display: flex; justify-content: space-between; border-bottom: 2px solid #172337; padding-bottom: 12px; margin-bottom: 16px; }
            .slip-header h2 { color: #2874f0; margin: 0; font-size: 1.6rem; }
            .slip-header small { color: #666; }
            .slip-order { text-align: right; font-size: 0.88rem; }
            .slip-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; font-size: 0.9rem; line-height: 1.5; }
            .slip-items { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 0.9rem; }
            .slip-items th, .slip-items td { border: 1px solid #e0e0e0; padding: 8px; text-align: left; }
            .slip-items th { background: #f5f5f5; }
            .slip-totals { border-top: 1px solid #ddd; padding-top: 10px; max-width: 300px; margin-left: auto; font-size: 0.92rem; }
            .slip-totals > div { display: flex; justify-content: space-between; padding: 4px 0; }
            .total-line { font-size: 1.1rem; font-weight: bold; border-top: 1px solid #ddd; padding-top: 6px !important; margin-top: 4px; }
            .slip-footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.85rem; border-top: 1px dashed #ccc; padding-top: 10px; }
            @media print { body { padding: 0; } .slip { border: none; } }
        </style></head><body>
        ${rangeLabel ? `<div class="range-header">${rangeLabel} — ${ordersList.length} order(s)</div>` : ''}
        ${rows}
        </body></html>`;
    };

    // --- Coupons ---
    const resetCoupForm = () => { setCoupForm(emptyCoup); setEditCoupId(null); };
    const closeCoupForm = () => { resetCoupForm(); setShowCoupForm(false); };

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        // Optional prefix based on discount type/value for readability
        if (coupForm.discount_value && coupForm.discount_type === 'percent') {
            code = `SAVE${Math.round(parseFloat(coupForm.discount_value))}`;
        } else if (coupForm.discount_value && coupForm.discount_type === 'flat') {
            code = `FLAT${Math.round(parseFloat(coupForm.discount_value))}`;
        } else {
            code = 'OFFER';
        }
        for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
        setCoupForm({ ...coupForm, code });
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editCoupId) {
                await API.put(`/api/coupons.php?action=update&id=${editCoupId}`, coupForm);
                toast.success('Coupon updated!');
            } else {
                await API.post('/api/coupons.php?action=create', coupForm);
                toast.success('Coupon created!');
            }
            closeCoupForm(); fetchCoupons();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving coupon'); }
    };

    const editCoupon = (c) => {
        setCoupForm({
            code: c.code, description: c.description || '', discount_type: c.discount_type,
            discount_value: c.discount_value, min_order_amount: c.min_order_amount || '',
            max_discount: c.max_discount || '', usage_limit: c.usage_limit || '',
            valid_from: c.valid_from || '', valid_until: c.valid_until || '',
            active: parseInt(c.active)
        });
        setEditCoupId(c.id); setShowCoupForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        await API.delete(`/api/coupons.php?action=delete&id=${id}`);
        toast.success('Coupon deleted');
        fetchCoupons();
    };

    // --- Leads ---
    const updateLead = async (id, status, notes) => {
        await API.put(`/api/leads.php?action=update&id=${id}`, { status, notes });
        toast.success('Lead updated');
        fetchLeads(); fetchLeadStats();
        setSelectedLead(null);
    };

    const deleteLead = async (id) => {
        if (!window.confirm('Delete this lead?')) return;
        await API.delete(`/api/leads.php?action=delete&id=${id}`);
        toast.success('Lead deleted');
        fetchLeads(); fetchLeadStats();
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        await API.delete(`/api/admin.php?action=delete-user&id=${id}`);
        toast.success('User deleted!');
        fetchUsers();
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
                    <button className={tab === 'coupons' ? 'active' : ''} onClick={() => setTab('coupons')}><FiGift /> Coupons</button>
                    <button className={tab === 'leads' ? 'active' : ''} onClick={() => setTab('leads')}><FiUserCheck /> Leads</button>
                    <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><FiUsers /> Users</button>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h1>
                    <div className="admin-user"><span>Welcome, Admin 👋</span></div>
                </header>

                {tab === 'dashboard' && (
                    <div className="admin-content">
                        <div className="stats-grid">
                            <div className="stat-card blue"><div className="stat-icon"><FiUsers /></div>
                                <div><h3>{stats.totalUsers || 0}</h3><p>Total Users</p></div></div>
                            <div className="stat-card green"><div className="stat-icon"><FiPackage /></div>
                                <div><h3>{stats.totalProducts || 0}</h3><p>Total Products</p></div></div>
                            <div className="stat-card orange"><div className="stat-icon"><FiShoppingBag /></div>
                                <div><h3>{stats.totalOrders || 0}</h3><p>Total Orders</p></div></div>
                            <div className="stat-card purple"><div className="stat-icon"><FiDollarSign /></div>
                                <div><h3>{money(stats.totalRevenue)}</h3><p>Total Revenue</p></div></div>
                            <div className="stat-card red"><div className="stat-icon"><FiClock /></div>
                                <div><h3>{stats.pendingOrders || 0}</h3><p>Pending Orders</p></div></div>
                            <div className="stat-card teal"><div className="stat-icon"><FiTrendingUp /></div>
                                <div><h3>{stats.todayOrders || 0}</h3><p>Today's Orders</p></div></div>
                            <div className="stat-card pink"><div className="stat-icon"><FiUserCheck /></div>
                                <div><h3>{stats.newLeads || 0}</h3><p>New Leads</p></div></div>
                            <div className="stat-card indigo"><div className="stat-icon"><FiDollarSign /></div>
                                <div><h3>{money(stats.todayRevenue)}</h3><p>Today's Revenue</p></div></div>
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
                                                <td><strong>{money(o.total_amount)}</strong></td>
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
                        <div className="stats-grid compact">
                            <div className="stat-card blue"><div className="stat-icon"><FiPackage /></div>
                                <div><h3>{productStats.total || 0}</h3><p>Total Products</p></div></div>
                            <div className="stat-card green"><div className="stat-icon"><FiCheckCircle /></div>
                                <div><h3>{productStats.inStock || 0}</h3><p>In Stock</p></div></div>
                            <div className="stat-card orange"><div className="stat-icon"><FiAlertTriangle /></div>
                                <div><h3>{productStats.lowStock || 0}</h3><p>Low Stock (≤5)</p></div></div>
                            <div className="stat-card red"><div className="stat-icon"><FiX /></div>
                                <div><h3>{productStats.outOfStock || 0}</h3><p>Out of Stock</p></div></div>
                            <div className="stat-card purple"><div className="stat-icon"><FiTrendingUp /></div>
                                <div><h3>{productStats.featured || 0}</h3><p>Featured</p></div></div>
                            <div className="stat-card teal"><div className="stat-icon"><FiEdit /></div>
                                <div><h3>{productStats.draft || 0}</h3><p>Drafts</p></div></div>
                            <div className="stat-card indigo"><div className="stat-icon"><FiDollarSign /></div>
                                <div><h3>{money(productStats.inventoryValue)}</h3><p>Inventory Value</p></div></div>
                        </div>

                        {productStats.topSelling?.length > 0 && (
                            <div className="dashboard-card">
                                <h3 className="card-title">Top Selling Products</h3>
                                <table className="admin-table">
                                    <thead><tr><th>Product</th><th>Sold</th><th>Revenue</th><th>Stock</th></tr></thead>
                                    <tbody>
                                        {productStats.topSelling.filter(p => parseInt(p.sold) > 0).slice(0, 5).map(p => (
                                            <tr key={p.id}>
                                                <td><div style={{display:'flex',alignItems:'center',gap:'10px'}}><img src={getImgUrl(p.image)} alt="" className="table-img" /><strong>{p.name}</strong></div></td>
                                                <td><strong>{p.sold}</strong></td>
                                                <td>{money(p.revenue)}</td>
                                                <td><span className={`stock-badge ${p.stock > 10 ? 'good' : p.stock > 0 ? 'low' : 'out'}`}>{p.stock}</span></td>
                                            </tr>
                                        ))}
                                        {productStats.topSelling.filter(p => parseInt(p.sold) > 0).length === 0 && (
                                            <tr><td colSpan="4" className="empty-msg">No sales yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="tab-header">
                            <div><p className="tab-subtitle">{products.length} products in store</p></div>
                            <button className="btn-add" onClick={() => { setShowProdForm(!showProdForm); setEditProdId(null); setProdForm(emptyProd); setProdImage(null); setProdExtraImages([]); }}>
                                <FiPlus /> {showProdForm ? 'Cancel' : 'Add Product'}
                            </button>
                        </div>

                        {showProdForm && (
                            <div className="dashboard-card">
                                <h3 className="card-title">{editProdId ? 'Edit Product' : 'Add New Product'}</h3>
                                <form className="admin-form" onSubmit={handleProductSubmit}>
                                    <div className="form-row">
                                        <div className="form-group"><label>Product Name *</label>
                                            <input placeholder="e.g., Gold Pendant" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} required /></div>
                                        <div className="form-group"><label>Brand</label>
                                            <input placeholder="e.g., Amshine" value={prodForm.brand} onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })} /></div>
                                    </div>
                                    <div className="form-group"><label>Description</label>
                                        <textarea placeholder="Product description..." value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Price (₹) *</label>
                                            <input type="number" placeholder="Original price" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} required /></div>
                                        <div className="form-group"><label>Sale Price (₹)</label>
                                            <input type="number" placeholder="Discounted price" value={prodForm.sale_price} onChange={(e) => setProdForm({ ...prodForm, sale_price: e.target.value })} /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Category</label>
                                            <select value={prodForm.category_id} onChange={(e) => { setProdForm({ ...prodForm, category_id: e.target.value, subcategory_id: '', sub_subcategory_id: '' }); fetchSubcategories(e.target.value); }}>
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select></div>
                                        <div className="form-group"><label>Subcategory</label>
                                            <select value={prodForm.subcategory_id} onChange={(e) => { setProdForm({ ...prodForm, subcategory_id: e.target.value, sub_subcategory_id: '' }); fetchSubSubcategories(e.target.value); }}>
                                                <option value="">Select Subcategory</option>
                                                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Sub-Subcategory</label>
                                            <select value={prodForm.sub_subcategory_id} onChange={(e) => setProdForm({ ...prodForm, sub_subcategory_id: e.target.value })}>
                                                <option value="">Select Sub-Subcategory</option>
                                                {subSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select></div>
                                        <div className="form-group"><label>Stock</label>
                                            <input type="number" placeholder="Available quantity" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Main Product Image {editProdId && '(Leave empty to keep current)'}</label>
                                            <input type="file" accept="image/*" onChange={(e) => setProdImage(e.target.files[0])} /></div>
                                        <div className="form-group"><label>Additional Images {editProdId ? '(Will add to existing)' : '(Multiple)'}</label>
                                            <input type="file" accept="image/*" multiple onChange={(e) => {
                                                if (editProdId) { uploadAdditionalImages(e.target.files); e.target.value = ''; }
                                                else setProdExtraImages(Array.from(e.target.files));
                                            }} /></div>
                                    </div>

                                    {editProdId && (
                                        <div className="existing-images">
                                            <h4 style={{margin: '12px 0', color: '#212121', fontWeight: 600, fontSize: '0.95rem'}}>Current Product Images ({editProductImages.length})</h4>
                                            {editProductImages.length === 0 ? (
                                                <p style={{color: '#878787', fontSize: '0.85rem'}}>No images yet. Upload using the field above.</p>
                                            ) : (
                                                <div className="existing-images-grid">
                                                    {editProductImages.map((img) => (
                                                        <div key={img.id} className={`existing-img-card ${editMainImage === img.image_url ? 'is-primary' : ''}`}>
                                                            <img src={img.image_url.startsWith('http') ? img.image_url : `${API_URL}${img.image_url}`} alt="" />
                                                            {editMainImage === img.image_url && <span className="primary-badge">Primary</span>}
                                                            <div className="existing-img-actions">
                                                                {editMainImage !== img.image_url && (
                                                                    <button type="button" className="btn-set-primary" onClick={() => setAsPrimaryImage(img.image_url)}>★ Set Primary</button>
                                                                )}
                                                                <button type="button" className="btn-delete-img" onClick={() => deleteExistingImage(img.id)}><FiTrash2 /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="form-group checkbox-group">
                                        <label><input type="checkbox" checked={prodForm.featured} onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })} /> Mark as Featured Product</label>
                                    </div>
                                    <h4 style={{margin: '12px 0 4px', color: '#212121', fontWeight: 600, fontSize: '0.95rem'}}>External Shopping Links (Optional)</h4>
                                    <div className="form-row">
                                        <div className="form-group"><label>🛒 Meesho Link</label>
                                            <input type="url" placeholder="https://meesho.com/..." value={prodForm.meesho_link} onChange={(e) => setProdForm({ ...prodForm, meesho_link: e.target.value })} /></div>
                                        <div className="form-group"><label>🛍️ Flipkart Link</label>
                                            <input type="url" placeholder="https://flipkart.com/..." value={prodForm.flipkart_link} onChange={(e) => setProdForm({ ...prodForm, flipkart_link: e.target.value })} /></div>
                                    </div>
                                    <div className="form-group"><label>📦 Amazon Link</label>
                                        <input type="url" placeholder="https://amazon.in/..." value={prodForm.amazon_link} onChange={(e) => setProdForm({ ...prodForm, amazon_link: e.target.value })} /></div>
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
                                            <td><strong>{money(p.sale_price || p.price)}</strong></td>
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
                            <div>
                                <p className="tab-subtitle">
                                    {categoryTree.length} categories •{' '}
                                    {categoryTree.reduce((n, c) => n + (c.subcategories?.length || 0), 0)} subcategories •{' '}
                                    {categoryTree.reduce((n, c) => n + (c.subcategories || []).reduce((m, s) => m + (s.sub_subcategories?.length || 0), 0), 0)} sub-sub
                                </p>
                            </div>
                            <button className="btn-add" onClick={() => openCatForm('cat', 'create')}>
                                <FiPlus /> Add New
                            </button>
                        </div>

                        <div className="dashboard-card">
                            <div className="cat-tree">
                                {categoryTree.length === 0 && <p className="empty-msg">No categories yet. Click "Add Category" to get started.</p>}

                                {categoryTree.map(cat => (
                                    <div key={cat.id} className="cat-tree-node level-1">
                                        <div className="cat-row">
                                            <button className="tree-toggle" onClick={() => toggleCat(cat.id)}>
                                                {expandedCats[cat.id] ? <FiChevronDown /> : <FiChevronRight />}
                                            </button>
                                            <img className="cat-thumb" src={getImgUrl(cat.image)} alt="" />
                                            <div className="cat-info">
                                                <strong>{cat.name}</strong>
                                                <small>{cat.description || 'No description'}</small>
                                            </div>
                                            <div className="cat-meta">
                                                <span className="count-badge">{cat.product_count} products</span>
                                                <span className="count-badge secondary">{cat.subcategories?.length || 0} subs</span>
                                            </div>
                                            <div className="cat-actions">
                                                <button className="btn-action edit" title="Add Subcategory" onClick={() => openCatForm('sub', 'create', cat.id)}><FiFolderPlus /></button>
                                                <button className="btn-action edit" title="Edit" onClick={() => openCatForm('cat', 'edit', null, cat)}><FiEdit /></button>
                                                <button className="btn-action delete" title="Delete" onClick={() => deleteCategoryNode('cat', cat.id, cat.product_count)}><FiTrash2 /></button>
                                            </div>
                                        </div>

                                        {expandedCats[cat.id] && (
                                            <div className="cat-children">
                                                {(cat.subcategories || []).length === 0 && (
                                                    <p className="empty-branch">No subcategories. <button className="inline-link" onClick={() => openCatForm('sub', 'create', cat.id)}>+ Add one</button></p>
                                                )}
                                                {(cat.subcategories || []).map(sub => (
                                                    <div key={sub.id} className="cat-tree-node level-2">
                                                        <div className="cat-row">
                                                            <button className="tree-toggle" onClick={() => toggleSub(sub.id)}>
                                                                {expandedSubs[sub.id] ? <FiChevronDown /> : <FiChevronRight />}
                                                            </button>
                                                            <img className="cat-thumb small" src={getImgUrl(sub.image)} alt="" />
                                                            <div className="cat-info">
                                                                <strong>{sub.name}</strong>
                                                                <small>{sub.description || '—'}</small>
                                                            </div>
                                                            <div className="cat-meta">
                                                                <span className="count-badge">{sub.product_count} products</span>
                                                                <span className="count-badge secondary">{sub.sub_subcategories?.length || 0} sub-sub</span>
                                                            </div>
                                                            <div className="cat-actions">
                                                                <button className="btn-action edit" title="Add Sub-subcategory" onClick={() => openCatForm('subsub', 'create', sub.id)}><FiFolderPlus /></button>
                                                                <button className="btn-action edit" title="Edit" onClick={() => openCatForm('sub', 'edit', cat.id, sub)}><FiEdit /></button>
                                                                <button className="btn-action delete" title="Delete" onClick={() => deleteCategoryNode('sub', sub.id, sub.product_count)}><FiTrash2 /></button>
                                                            </div>
                                                        </div>

                                                        {expandedSubs[sub.id] && (
                                                            <div className="cat-children">
                                                                {(sub.sub_subcategories || []).length === 0 && (
                                                                    <p className="empty-branch">No sub-subcategories. <button className="inline-link" onClick={() => openCatForm('subsub', 'create', sub.id)}>+ Add one</button></p>
                                                                )}
                                                                {(sub.sub_subcategories || []).map(ss => (
                                                                    <div key={ss.id} className="cat-tree-node level-3">
                                                                        <div className="cat-row">
                                                                            <FiFolder className="leaf-icon" />
                                                                            <img className="cat-thumb small" src={getImgUrl(ss.image)} alt="" />
                                                                            <div className="cat-info">
                                                                                <strong>{ss.name}</strong>
                                                                                <small>{ss.description || '—'}</small>
                                                                            </div>
                                                                            <div className="cat-meta">
                                                                                <span className="count-badge">{ss.product_count} products</span>
                                                                            </div>
                                                                            <div className="cat-actions">
                                                                                <button className="btn-action edit" title="Edit" onClick={() => openCatForm('subsub', 'edit', sub.id, ss)}><FiEdit /></button>
                                                                                <button className="btn-action delete" title="Delete" onClick={() => deleteCategoryNode('subsub', ss.id, ss.product_count)}><FiTrash2 /></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {catNodeForm && (
                            <div className="modal-overlay" onClick={() => setCatNodeForm(null)}>
                                <div className="modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>
                                            {catNodeForm.mode === 'create' ? 'Add' : 'Edit'}{' '}
                                            {catNodeForm.level === 'cat' ? 'Category' : catNodeForm.level === 'sub' ? 'Subcategory' : 'Sub-subcategory'}
                                        </h3>
                                        <button className="modal-close" onClick={() => setCatNodeForm(null)}><FiX /></button>
                                    </div>
                                    <form className="admin-form" style={{padding:'18px 22px'}} onSubmit={submitCatNode}>
                                        {catNodeForm.mode === 'create' && (
                                            <div className="form-group">
                                                <label>Type * — where to save this?</label>
                                                <div className="type-selector">
                                                    <label className={`type-option ${catNodeForm.level === 'cat' ? 'active' : ''}`}>
                                                        <input type="radio" name="catLevel" checked={catNodeForm.level === 'cat'} onChange={() => setCatNodeForm({ ...catNodeForm, level: 'cat', parentId: null, parentCatId: '' })} />
                                                        <div><strong>Category</strong><small>Top-level (e.g. Jewellery)</small></div>
                                                    </label>
                                                    <label className={`type-option ${catNodeForm.level === 'sub' ? 'active' : ''}`}>
                                                        <input type="radio" name="catLevel" checked={catNodeForm.level === 'sub'} onChange={() => setCatNodeForm({ ...catNodeForm, level: 'sub', parentId: catNodeForm.parentId && categoryTree.some(c => c.id === catNodeForm.parentId) ? catNodeForm.parentId : '' })} />
                                                        <div><strong>Subcategory</strong><small>Under a category (e.g. Necklaces)</small></div>
                                                    </label>
                                                    <label className={`type-option ${catNodeForm.level === 'subsub' ? 'active' : ''}`}>
                                                        <input type="radio" name="catLevel" checked={catNodeForm.level === 'subsub'} onChange={() => setCatNodeForm({ ...catNodeForm, level: 'subsub', parentId: '', parentCatId: '' })} />
                                                        <div><strong>Sub-subcategory</strong><small>Under a subcategory (e.g. Chokers)</small></div>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {catNodeForm.mode === 'create' && catNodeForm.level === 'sub' && (
                                            <div className="form-group">
                                                <label>Parent Category *</label>
                                                <select value={catNodeForm.parentId || ''} onChange={(e) => setCatNodeForm({ ...catNodeForm, parentId: parseInt(e.target.value) || null })} required>
                                                    <option value="">Select a category</option>
                                                    {categoryTree.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {catNodeForm.mode === 'create' && catNodeForm.level === 'subsub' && (
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Parent Category *</label>
                                                    <select value={catNodeForm.parentCatId || ''} onChange={(e) => setCatNodeForm({ ...catNodeForm, parentCatId: parseInt(e.target.value) || '', parentId: null })} required>
                                                        <option value="">Select a category</option>
                                                        {categoryTree.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Parent Subcategory *</label>
                                                    <select value={catNodeForm.parentId || ''} onChange={(e) => setCatNodeForm({ ...catNodeForm, parentId: parseInt(e.target.value) || null })} required disabled={!catNodeForm.parentCatId}>
                                                        <option value="">{catNodeForm.parentCatId ? 'Select a subcategory' : 'Pick category first'}</option>
                                                        {(categoryTree.find(c => c.id === catNodeForm.parentCatId)?.subcategories || []).map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label>Name *</label>
                                            <input value={catNodeForm.name} onChange={(e) => setCatNodeForm({ ...catNodeForm, name: e.target.value })} required autoFocus />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea value={catNodeForm.description} onChange={(e) => setCatNodeForm({ ...catNodeForm, description: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Image {catNodeForm.mode === 'edit' && '(leave empty to keep current)'}</label>
                                            <input type="file" accept="image/*" onChange={(e) => setCatNodeForm({ ...catNodeForm, image: e.target.files[0] })} />
                                            {catNodeForm.currentImage && (
                                                <img src={getImgUrl(catNodeForm.currentImage)} alt="" style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'4px',marginTop:'8px',border:'1px solid #e0e0e0'}} />
                                            )}
                                        </div>
                                        <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'10px'}}>
                                            <button type="button" className="btn-action view" onClick={() => setCatNodeForm(null)}>Cancel</button>
                                            <button type="submit" className="btn-submit">
                                                {catNodeForm.mode === 'create'
                                                    ? `Create ${catNodeForm.level === 'cat' ? 'Category' : catNodeForm.level === 'sub' ? 'Subcategory' : 'Sub-subcategory'}`
                                                    : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'orders' && (
                    <div className="admin-content">
                        <div className="stats-grid compact">
                            <div className="stat-card blue"><div className="stat-icon"><FiShoppingBag /></div>
                                <div><h3>{orderAnalytics.totalOrders || 0}</h3><p>Orders (range)</p></div></div>
                            <div className="stat-card green"><div className="stat-icon"><FiDollarSign /></div>
                                <div><h3>{money(orderAnalytics.totalRevenue)}</h3><p>Revenue (range)</p></div></div>
                            <div className="stat-card purple"><div className="stat-icon"><FiTrendingUp /></div>
                                <div><h3>{money(orderAnalytics.avgOrderValue)}</h3><p>Avg Order Value</p></div></div>
                            {(orderAnalytics.statusBreakdown || []).map(s => (
                                <div key={s.order_status} className={`stat-card ${s.order_status === 'pending' ? 'orange' : s.order_status === 'delivered' ? 'green' : s.order_status === 'cancelled' ? 'red' : 'teal'}`}>
                                    <div className="stat-icon"><FiClock /></div>
                                    <div><h3>{s.c}</h3><p style={{textTransform:'capitalize'}}>{s.order_status}</p></div>
                                </div>
                            ))}
                        </div>

                        <div className="dashboard-card">
                            <div className="filters-row">
                                <div className="filter-group">
                                    <label><FiFilter /> From</label>
                                    <input type="date" value={orderFilter.from} onChange={(e) => setOrderFilter({ ...orderFilter, from: e.target.value })} />
                                </div>
                                <div className="filter-group">
                                    <label>To</label>
                                    <input type="date" value={orderFilter.to} onChange={(e) => setOrderFilter({ ...orderFilter, to: e.target.value })} />
                                </div>
                                <div className="filter-group">
                                    <label>Status</label>
                                    <select value={orderFilter.status} onChange={(e) => setOrderFilter({ ...orderFilter, status: e.target.value })}>
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="filter-group grow">
                                    <label><FiSearch /> Search</label>
                                    <input type="text" placeholder="Order ID, customer name or email" value={orderFilter.search} onChange={(e) => setOrderFilter({ ...orderFilter, search: e.target.value })} />
                                </div>
                                <div className="filter-group">
                                    <label>&nbsp;</label>
                                    <button className="btn-submit" onClick={printDateRangeSlips}><FiDownload /> Download All Slips</button>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <table className="admin-table">
                                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Order Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td><strong>#{o.id}</strong>{o.coupon_code && <div><small style={{color:'#388e3c'}}>🎁 {o.coupon_code}</small></div>}</td>
                                            <td>
                                                <div className="user-cell">
                                                    <strong>{o.user_name}</strong>
                                                    <small>{o.user_email}</small>
                                                </div>
                                            </td>
                                            <td>{o.items?.length || 0} item(s)</td>
                                            <td><strong>{money(o.total_amount)}</strong>
                                                {parseFloat(o.discount_amount || 0) > 0 && <div><small style={{color:'#388e3c'}}>-{money(o.discount_amount)}</small></div>}
                                            </td>
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
                                            <td className="actions-cell">
                                                <button className="btn-action view" title="View details" onClick={() => viewOrder(o.id)}><FiEye /></button>
                                                {o.order_status === 'pending' && (
                                                    <button className="btn-action confirm" title="Confirm order" onClick={() => confirmOrder(o.id)}><FiCheckCircle /></button>
                                                )}
                                                <button className="btn-action slip" title="Download slip" onClick={() => viewOrder(o.id).then(() => {})}>
                                                    <FiDownload />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && <tr><td colSpan="8" className="empty-msg">No orders match the filters</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {selectedOrder && (
                            <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                                <div className="modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>Order #{selectedOrder.id}</h3>
                                        <button className="modal-close" onClick={() => setSelectedOrder(null)}><FiX /></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="order-detail-grid">
                                            <div>
                                                <h4>Customer</h4>
                                                <p><strong>{selectedOrder.user_name}</strong><br/>
                                                {selectedOrder.user_email}<br/>
                                                📞 {selectedOrder.phone}</p>
                                            </div>
                                            <div>
                                                <h4>Shipping Address</h4>
                                                <p>{selectedOrder.shipping_address}<br/>
                                                {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                                            </div>
                                            <div>
                                                <h4>Payment</h4>
                                                <p><span className={`status ${selectedOrder.payment_status}`}>{selectedOrder.payment_method?.toUpperCase()} • {selectedOrder.payment_status}</span></p>
                                            </div>
                                            <div>
                                                <h4>Order Status</h4>
                                                <p><span className={`status ${selectedOrder.order_status}`}>{selectedOrder.order_status}</span><br/>
                                                <small>{new Date(selectedOrder.created_at).toLocaleString()}</small></p>
                                            </div>
                                        </div>
                                        <h4 style={{marginTop:'16px'}}>Items</h4>
                                        <table className="admin-table">
                                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                                            <tbody>
                                                {(selectedOrder.items || []).map(i => (
                                                    <tr key={i.id}>
                                                        <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                                            <img src={getImgUrl(i.image)} alt="" className="table-img" style={{width:'40px',height:'40px'}} />
                                                            {i.name}</div></td>
                                                        <td>{i.quantity}</td>
                                                        <td>{money(i.price)}</td>
                                                        <td>{money(parseFloat(i.price) * parseInt(i.quantity))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="totals-box">
                                            {selectedOrder.subtotal && <div><span>Subtotal</span><span>{money(selectedOrder.subtotal)}</span></div>}
                                            {parseFloat(selectedOrder.discount_amount || 0) > 0 && (
                                                <div><span>Discount ({selectedOrder.coupon_code})</span><span style={{color:'#388e3c'}}>-{money(selectedOrder.discount_amount)}</span></div>
                                            )}
                                            <div className="grand-total"><span>Total</span><span>{money(selectedOrder.total_amount)}</span></div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        {selectedOrder.order_status === 'pending' && (
                                            <button className="btn-submit" onClick={() => { confirmOrder(selectedOrder.id); setSelectedOrder(null); }}><FiCheckCircle /> Confirm Order</button>
                                        )}
                                        <button className="btn-add" onClick={() => printOrderSlip(selectedOrder)}><FiDownload /> Download Slip</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'coupons' && (
                    <div className="admin-content">
                        <div className="tab-header">
                            <div><p className="tab-subtitle">{coupons.length} coupons • {coupons.filter(c => parseInt(c.active) === 1).length} active</p></div>
                            <button className="btn-add" onClick={() => {
                                if (showCoupForm) { closeCoupForm(); }
                                else { resetCoupForm(); setShowCoupForm(true); }
                            }}>
                                <FiPlus /> {showCoupForm ? 'Cancel' : 'Create Coupon'}
                            </button>
                        </div>

                        {showCoupForm && (
                            <div className="dashboard-card">
                                <h3 className="card-title">{editCoupId ? 'Edit Coupon' : 'New Coupon'}</h3>
                                <form className="admin-form" onSubmit={handleCouponSubmit}>
                                    <div className="form-row">
                                        <div className="form-group"><label>Code * (type or generate)</label>
                                            <div className="input-with-btn">
                                                <input value={coupForm.code} onChange={(e) => setCoupForm({ ...coupForm, code: e.target.value.toUpperCase() })} placeholder="e.g. WELCOME10" required disabled={!!editCoupId} />
                                                {!editCoupId && (
                                                    <button type="button" className="btn-generate" onClick={generateCouponCode} title="Generate random code">
                                                        ⚡ Generate
                                                    </button>
                                                )}
                                            </div></div>
                                        <div className="form-group"><label>Description (shown to customer)</label>
                                            <input value={coupForm.description} onChange={(e) => setCoupForm({ ...coupForm, description: e.target.value })} placeholder="10% off on first order" /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Discount Type</label>
                                            <select value={coupForm.discount_type} onChange={(e) => setCoupForm({ ...coupForm, discount_type: e.target.value })}>
                                                <option value="percent">Percentage %</option>
                                                <option value="flat">Flat Amount ₹</option>
                                            </select></div>
                                        <div className="form-group"><label>Discount Value *</label>
                                            <input type="number" step="0.01" value={coupForm.discount_value} onChange={(e) => setCoupForm({ ...coupForm, discount_value: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Min Order Amount (₹)</label>
                                            <input type="number" value={coupForm.min_order_amount} onChange={(e) => setCoupForm({ ...coupForm, min_order_amount: e.target.value })} /></div>
                                        <div className="form-group"><label>Max Discount Cap (₹) — for % type</label>
                                            <input type="number" value={coupForm.max_discount} onChange={(e) => setCoupForm({ ...coupForm, max_discount: e.target.value })} /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Usage Limit (total uses)</label>
                                            <input type="number" value={coupForm.usage_limit} onChange={(e) => setCoupForm({ ...coupForm, usage_limit: e.target.value })} placeholder="Unlimited" /></div>
                                        <div className="form-group checkbox-group">
                                            <label><input type="checkbox" checked={parseInt(coupForm.active) === 1} onChange={(e) => setCoupForm({ ...coupForm, active: e.target.checked ? 1 : 0 })} /> Active</label>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Valid From</label>
                                            <input type="date" value={coupForm.valid_from} onChange={(e) => setCoupForm({ ...coupForm, valid_from: e.target.value })} /></div>
                                        <div className="form-group"><label>Valid Until</label>
                                            <input type="date" value={coupForm.valid_until} onChange={(e) => setCoupForm({ ...coupForm, valid_until: e.target.value })} /></div>
                                    </div>
                                    <button type="submit" className="btn-submit">{editCoupId ? 'Update Coupon' : 'Create Coupon'}</button>
                                </form>
                            </div>
                        )}

                        <div className="dashboard-card">
                            <table className="admin-table">
                                <thead><tr><th>Code</th><th>Description</th><th>Discount</th><th>Min Order</th><th>Usage</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {coupons.map(c => (
                                        <tr key={c.id}>
                                            <td><strong style={{fontFamily:'monospace',letterSpacing:'0.5px'}}>{c.code}</strong></td>
                                            <td>{c.description || '-'}</td>
                                            <td><strong>{c.discount_type === 'percent' ? `${c.discount_value}%` : money(c.discount_value)}</strong>
                                                {c.max_discount && <div><small>max {money(c.max_discount)}</small></div>}</td>
                                            <td>{money(c.min_order_amount)}</td>
                                            <td>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                                            <td>{c.valid_until || '∞'}</td>
                                            <td><span className={`status ${parseInt(c.active) === 1 ? 'delivered' : 'cancelled'}`}>{parseInt(c.active) === 1 ? 'Active' : 'Inactive'}</span></td>
                                            <td className="actions-cell">
                                                <button className="btn-action edit" onClick={() => editCoupon(c)}><FiEdit /></button>
                                                <button className="btn-action delete" onClick={() => deleteCoupon(c.id)}><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {coupons.length === 0 && <tr><td colSpan="8" className="empty-msg">No coupons yet. Create one!</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'leads' && (
                    <div className="admin-content">
                        <div className="stats-grid compact">
                            <div className="stat-card blue"><div className="stat-icon"><FiUserCheck /></div>
                                <div><h3>{leadStats.total || 0}</h3><p>Total Leads</p></div></div>
                            <div className="stat-card orange"><div className="stat-icon"><FiClock /></div>
                                <div><h3>{leadStats.new || 0}</h3><p>New</p></div></div>
                            <div className="stat-card green"><div className="stat-icon"><FiCheckCircle /></div>
                                <div><h3>{leadStats.converted || 0}</h3><p>Converted</p></div></div>
                            <div className="stat-card purple"><div className="stat-icon"><FiTrendingUp /></div>
                                <div><h3>{leadStats.today || 0}</h3><p>Today</p></div></div>
                        </div>

                        <div className="dashboard-card">
                            <div className="filters-row">
                                <div className="filter-group">
                                    <label>Status</label>
                                    <select value={leadFilter.status} onChange={(e) => setLeadFilter({ ...leadFilter, status: e.target.value })}>
                                        <option value="">All</option>
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="converted">Converted</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div className="filter-group grow">
                                    <label><FiSearch /> Search</label>
                                    <input type="text" placeholder="Name, email or phone" value={leadFilter.search} onChange={(e) => setLeadFilter({ ...leadFilter, search: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <table className="admin-table">
                                <thead><tr><th>Name</th><th>Contact</th><th>Source</th><th>Product</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {leads.map(l => (
                                        <tr key={l.id}>
                                            <td><strong>{l.name}</strong></td>
                                            <td>
                                                <div className="user-cell">
                                                    {l.email && <small>✉ {l.email}</small>}
                                                    {l.phone && <small>📞 {l.phone}</small>}
                                                </div>
                                            </td>
                                            <td><span className="role user">{l.source}</span></td>
                                            <td>{l.product_name || '-'}</td>
                                            <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.message || '-'}</td>
                                            <td><span className={`status ${l.status === 'new' ? 'pending' : l.status === 'converted' ? 'delivered' : l.status === 'closed' ? 'cancelled' : 'confirmed'}`}>{l.status}</span></td>
                                            <td>{new Date(l.created_at).toLocaleDateString()}</td>
                                            <td className="actions-cell">
                                                <button className="btn-action view" onClick={() => setSelectedLead({ ...l })}><FiEye /></button>
                                                <button className="btn-action delete" onClick={() => deleteLead(l.id)}><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {leads.length === 0 && <tr><td colSpan="8" className="empty-msg">No leads yet</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {selectedLead && (
                            <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
                                <div className="modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>Lead: {selectedLead.name}</h3>
                                        <button className="modal-close" onClick={() => setSelectedLead(null)}><FiX /></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="order-detail-grid">
                                            <div><h4>Contact</h4><p>
                                                {selectedLead.email && <>✉ {selectedLead.email}<br/></>}
                                                {selectedLead.phone && <>📞 {selectedLead.phone}<br/></>}
                                                Source: <strong>{selectedLead.source}</strong></p>
                                            </div>
                                            <div><h4>Product Interest</h4><p>{selectedLead.product_name || 'General enquiry'}</p></div>
                                        </div>
                                        <h4>Message</h4>
                                        <p style={{background:'#f9f9f9',padding:'10px',borderRadius:'4px',whiteSpace:'pre-wrap'}}>{selectedLead.message || '(no message)'}</p>
                                        <div className="form-row" style={{marginTop:'12px'}}>
                                            <div className="form-group"><label>Status</label>
                                                <select value={selectedLead.status} onChange={(e) => setSelectedLead({ ...selectedLead, status: e.target.value })}>
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="qualified">Qualified</option>
                                                    <option value="converted">Converted</option>
                                                    <option value="closed">Closed</option>
                                                </select></div>
                                        </div>
                                        <div className="form-group"><label>Internal Notes</label>
                                            <textarea value={selectedLead.notes || ''} onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })} placeholder="Call details, follow-up, etc." /></div>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn-submit" onClick={() => updateLead(selectedLead.id, selectedLead.status, selectedLead.notes)}>Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}
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
