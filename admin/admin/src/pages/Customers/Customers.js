import React, { useState, useEffect, useCallback } from 'react';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';
import styles from './Customers.module.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { addToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get('/users', { params });
      const data = res.data;
      const arr = data?.data?.users || data?.users || data?.data || [];
      setCustomers(Array.isArray(arr) ? arr : []);
      setTotalPages(data?.totalPages || data?.data?.totalPages || 1);
    } catch {
      addToast('Failed to load customers', 'error');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchAllData = useCallback(async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        api.get('/users', { params: { limit: 1000 } }),
        api.get('/orders', { params: { limit: 1000 } }),
      ]);
      const uArr = uRes.data?.data?.users || uRes.data?.users || uRes.data?.data || [];
      const oArr = oRes.data?.data?.orders || oRes.data?.orders || oRes.data?.data || [];
      setAllCustomers(Array.isArray(uArr) ? uArr : []);
      setAllOrders(Array.isArray(oArr) ? oArr : []);
    } catch {}
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Analytics
  const totalCustomers = allCustomers.length;
  const totalRevenue = allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const activeCustomers = allCustomers.filter(c => allOrders.some(o => o.user?._id === c._id || o.user === c._id)).length;
  const newThisMonth = allCustomers.filter(c => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const getOrderCount = (customerId) => allOrders.filter(o => o.user?._id === customerId || o.user === customerId).length;
  const getTotalSpent = (customerId) => allOrders.filter(o => o.user?._id === customerId || o.user === customerId).reduce((s, o) => s + (o.totalAmount || 0), 0);

  const openDetail = async (customer) => {
    setSelected(customer);
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders', { params: { limit: 1000 } });
      const all = res.data?.data?.orders || res.data?.orders || [];
      setCustomerOrders(all.filter(o => o.user?._id === customer._id || o.user === customer._id));
    } catch {
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalSpent = customerOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const statusColors = { pending: '#F59E0B', confirmed: '#3B82F6', shipped: '#8B5CF6', delivered: '#10B981', cancelled: '#EF4444' };

  const columns = [
    {
      key: 'name', label: 'Customer',
      render: (v, row) => (
        <div className={styles.customerCell}>
          <div className={styles.avatar}>{(v || 'U')[0].toUpperCase()}</div>
          <div>
            <div className={styles.name}>{v}</div>
            <div className={styles.email}>{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Role', render: (v) => <span className={`badge badge-${v === 'admin' ? 'confirmed' : 'pending'}`}>{v}</span> },
    {
      key: '_id', label: 'Orders',
      render: (v) => {
        const count = getOrderCount(v);
        return <span style={{ background: '#EEF2FF', color: '#6366F1', padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{count} orders</span>;
      }
    },
    {
      key: '_id', label: 'Total Spent',
      render: (v) => {
        const spent = getTotalSpent(v);
        return <strong style={{ color: '#10B981', fontSize: 13 }}>₹{spent.toLocaleString()}</strong>;
      }
    },
    {
      key: 'createdAt', label: 'Joined',
      render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
    },
    {
      key: '_id2', label: 'Actions',
      render: (_, row) => (
        <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); openDetail(row); }}>
          👁 View
        </button>
      )
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Customers</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage all registered customers</p>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Customers', value: totalCustomers, color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Active Buyers', value: activeCustomers, color: '#10B981', bg: '#F0FDF4' },
          { label: 'New This Month', value: newThisMonth, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: '#F59E0B', bg: '#FFFBEB' },
        ].map((c, i) => (
          <div key={i} style={{ background: c.bg, border: `1px solid ${c.color}30`, borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: c.color, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <input
          className="form-control"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ width: 320 }}
        />
      </div>

      {/* Table */}
      <div className="card">
        <Table columns={columns} data={customers} loading={loading} onRowClick={openDetail} />
        <div style={{ padding: '0 16px 8px' }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Customer Details" size="lg">
        {selected && (
          <div className={styles.detail}>
            {/* Profile Card */}
            <div className={styles.profileCard}>
              <div className={styles.profileAvatar}>{selected.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className={styles.profileName}>{selected.name}</div>
                <div className={styles.profileEmail}>{selected.email}</div>
                <div className={styles.profileJoined}>Joined {new Date(selected.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
              <div className={styles.profileStats}>
                <div className={styles.profileStat}>
                  <div className={styles.statVal}>{customerOrders.length}</div>
                  <div className={styles.statLabel}>Orders</div>
                </div>
                <div className={styles.profileStat}>
                  <div className={styles.statVal}>₹{totalSpent.toLocaleString()}</div>
                  <div className={styles.statLabel}>Total Spent</div>
                </div>
                <div className={styles.profileStat}>
                  <div className={styles.statVal}>{customerOrders.filter(o => o.status === 'delivered').length}</div>
                  <div className={styles.statLabel}>Delivered</div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <h4 className={styles.ordersTitle}>Order History</h4>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" /></div>
            ) : customerOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                <p>No orders yet</p>
              </div>
            ) : (
              <table className={styles.ordersTable}>
                <thead>
                  <tr><th>Order ID</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {customerOrders.map(o => (
                    <tr key={o._id}>
                      <td><span className={styles.orderId}>#{o._id?.slice(-6).toUpperCase()}</span></td>
                      <td>{o.items?.length || 0} items</td>
                      <td><strong>₹{(o.totalAmount || 0).toLocaleString()}</strong></td>
                      <td>
                        <span style={{ background: `${statusColors[o.status]}20`, color: statusColors[o.status], padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}