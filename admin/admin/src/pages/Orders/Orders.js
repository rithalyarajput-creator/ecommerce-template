import React, { useState, useEffect, useCallback } from 'react';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';
import styles from './Orders.module.css';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const statusColors = { pending: '#F59E0B', confirmed: '#3B82F6', shipped: '#8B5CF6', delivered: '#10B981', cancelled: '#EF4444' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: { page, limit: 10, search, status: statusFilter } });
      const data = res.data;
      const arr = data?.data?.orders || data?.orders || data?.data || [];
      setOrders(Array.isArray(arr) ? arr : []);
      setTotalPages(data?.totalPages || data?.data?.totalPages || 1);
    } catch {
      addToast('Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchAllOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders', { params: { limit: 1000 } });
      const data = res.data;
      const arr = data?.data?.orders || data?.orders || data?.data || [];
      setAllOrders(Array.isArray(arr) ? arr : []);
    } catch { }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchAllOrders(); }, [fetchAllOrders]);

  // Analytics
  const totalRevenue = allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalOrdersCount = allOrders.length;
  const pendingCount = allOrders.filter(o => o.status === 'pending').length;
  const deliveredCount = allOrders.filter(o => o.status === 'delivered').length;
  const cancelledCount = allOrders.filter(o => o.status === 'cancelled').length;
  const confirmedCount = allOrders.filter(o => o.status === 'confirmed').length;

  const openDetail = (order) => { setSelectedOrder(order); setNewStatus(order.status); };

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, { status: newStatus });
      addToast('Order status updated!', 'success');
      setSelectedOrder(null);
      fetchOrders();
      fetchAllOrders();
    } catch { addToast('Failed to update status', 'error'); }
    finally { setSaving(false); }
  };

  // Quick confirm from table
  const quickConfirm = async (order, e) => {
    e.stopPropagation();
    try {
      await api.put(`/orders/${order._id}/status`, { status: 'confirmed' });
      addToast('Order confirmed!', 'success');
      fetchOrders();
      fetchAllOrders();
    } catch { addToast('Failed', 'error'); }
  };

  // Quick cancel from table
  const quickCancel = async (order, e) => {
    e.stopPropagation();
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${order._id}/status`, { status: 'cancelled' });
      addToast('Order cancelled', 'success');
      fetchOrders();
      fetchAllOrders();
    } catch { addToast('Failed', 'error'); }
  };

  const handlePrintSlip = (order) => {
    const items = (order.items || []).map(item => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd">${item.product?.title || 'Product'}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${item.price?.toLocaleString()}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">₹${(item.price * item.quantity)?.toLocaleString()}</td>
      </tr>`).join('');
    const slipHTML = `<html><head><title>Order Slip #${order._id?.slice(-8).toUpperCase()}</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto}table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:8px;border:1px solid #ddd;text-align:left}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:16px}</style></head>
      <body>
        <h1>🪙 Amshine Jewellery</h1><hr/>
        <p><strong>Order ID:</strong> #${order._id?.slice(-8).toUpperCase()}</p>
        <p><strong>Customer:</strong> ${order.user?.name || '—'}</p>
        <p><strong>Phone:</strong> ${order.shippingAddress?.phone || '—'}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        <p><strong>Status:</strong> ${order.status?.toUpperCase()}</p>
        <p><strong>Address:</strong> ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.pincode || ''}</p>
        <hr/>
        <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${items}</tbody></table>
        <div class="total">Total: ₹${order.totalAmount?.toLocaleString()}</div>
        <p style="text-align:center;color:#888;font-size:12px;margin-top:24px">Thank you for shopping with Amshine Jewellery! ✨</p>
      </body></html>`;
    const win = window.open('', '_blank');
    win.document.write(slipHTML);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  // Filter by date client-side
  const filteredOrders = orders.filter(o => {
    if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(o.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const columns = [
    { key: '_id', label: 'Order ID', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>#{v?.slice(-6).toUpperCase()}</span> },
    {
      key: 'user', label: 'Customer',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{(v?.name || 'U')[0]}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{v?.name || '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v?.email || ''}</div>
          </div>
        </div>
      )
    },
    { key: 'items', label: 'Items', render: (v) => <span style={{ background: '#EEF2FF', color: '#6366F1', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{v?.length || 0} items</span> },
    { key: 'totalAmount', label: 'Total', render: (v) => <strong style={{ fontSize: 14 }}>₹{(v || 0).toLocaleString()}</strong> },
    { key: 'paymentMethod', label: 'Payment', render: (v) => <span style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 8px', borderRadius: 6 }}>{v || 'COD'}</span> },
    { key: 'status', label: 'Status', render: (v) => <span style={{ background: `${statusColors[v]}20`, color: statusColors[v], padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{v}</span> },
    { key: 'createdAt', label: 'Date', render: (v) => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v ? new Date(v).toLocaleDateString('en-IN') : '—'}</span> },
    {
      key: '_id2', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); openDetail(row); }}>👁 View</button>
          {row.status === 'pending' && <button className="btn btn-sm" style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }} onClick={e => quickConfirm(row, e)}>✓ Confirm</button>}
          {row.status !== 'cancelled' && row.status !== 'delivered' && <button className="btn btn-sm" style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }} onClick={e => quickCancel(row, e)}>✕ Cancel</button>}
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); handlePrintSlip(row); }}>🖨️</button>
        </div>
      )
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Orders</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage all customer orders</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Orders', value: totalOrdersCount, color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: '#10B981', bg: '#F0FDF4' },
          { label: 'Pending', value: pendingCount, color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'Confirmed', value: confirmedCount, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Delivered', value: deliveredCount, color: '#10B981', bg: '#F0FDF4' },
          { label: 'Cancelled', value: cancelledCount, color: '#EF4444', bg: '#FEF2F2' },
        ].map((c, i) => (
          <div key={i} style={{ background: c.bg, border: `1px solid ${c.color}30`, borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: c.color, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{ padding: '6px 16px', borderRadius: 99, border: '1.5px solid', borderColor: statusFilter === s ? (statusColors[s] || 'var(--primary)') : 'var(--border)', background: statusFilter === s ? (statusColors[s] || 'var(--primary)') : '#fff', color: statusFilter === s ? '#fff' : 'var(--text-dark)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {s === '' ? `All (${totalOrdersCount})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${allOrders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Search + Date Filter */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" placeholder="🔍 Search by Order ID or customer..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 280 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>From:</span>
          <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <span>To:</span>
          <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          {(dateFrom || dateTo) && <button className="btn btn-ghost btn-sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</button>}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table columns={columns} data={filteredOrders} loading={loading} onRowClick={openDetail} />
        <div style={{ padding: '0 16px 12px' }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?._id?.slice(-6).toUpperCase()}`} size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => handlePrintSlip(selectedOrder)}>🖨️ Print Slip</button>
            <button className="btn btn-ghost" onClick={() => setSelectedOrder(null)}>Close</button>
            <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving}>
              {saving ? <span className="spinner" /> : '💾 Save Status'}
            </button>
          </>
        }
      >
        {selectedOrder && (
          <div className={styles.detailGrid}>
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>👤 Customer Info</h4>
              <div className={styles.infoRow}><span>Name</span><span>{selectedOrder.user?.name || '—'}</span></div>
              <div className={styles.infoRow}><span>Email</span><span>{selectedOrder.user?.email || '—'}</span></div>
              <div className={styles.infoRow}><span>Phone</span><span>{selectedOrder.shippingAddress?.phone || '—'}</span></div>
              <div className={styles.infoRow}><span>Address</span><span>{selectedOrder.shippingAddress ? `${selectedOrder.shippingAddress.street || ''}, ${selectedOrder.shippingAddress.city || ''}, ${selectedOrder.shippingAddress.pincode || ''}` : '—'}</span></div>
              <div className={styles.infoRow}><span>Date</span><span>{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</span></div>
            </div>
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>📦 Items</h4>
              {(selectedOrder.items || []).map((item, i) => (
                <div key={i} className={styles.orderItem}>
                  <div className={styles.orderItemInfo}>
                    <div className={styles.orderItemName}>{item.product?.title || 'Product'}</div>
                    <div className={styles.orderItemQty}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</div>
                  </div>
                  <div className={styles.orderItemPrice}>₹{(item.price * item.quantity)?.toLocaleString()}</div>
                </div>
              ))}
              <div className={styles.divider} />
              <div className={`${styles.infoRow} ${styles.totalRow}`}><span>Total</span><strong>₹{(selectedOrder.totalAmount || 0)?.toLocaleString()}</strong></div>
            </div>
            <div className={styles.detailSection} style={{ gridColumn: '1/-1' }}>
              <h4 className={styles.detailSectionTitle}>🔄 Update Status</h4>
              <div className={styles.statusRow}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setNewStatus(s)}
                    style={{ background: newStatus === s ? statusColors[s] : '#F3F4F6', color: newStatus === s ? '#fff' : 'var(--text-dark)', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}