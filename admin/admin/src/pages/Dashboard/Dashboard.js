import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import StatsCard from '../../components/StatsCard/StatsCard';
import api from '../../api/axios';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders').catch(() => ({ data: {} })),
          api.get('/products?limit=5').catch(() => ({ data: {} })),
          api.get('/users').catch(() => ({ data: {} })),
        ]);

        // Orders data
        const ordersArray = ordersRes.data?.data?.orders || ordersRes.data?.orders || [];
        const totalRevenue = ordersArray.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
        // Products data
        const productsArray = productsRes.data?.data?.products || productsRes.data?.products || productsRes.data?.data || [];
        
        // Users data
        const usersArray = usersRes.data?.data?.users || usersRes.data?.users || usersRes.data?.data || [];

        setStats({
          totalRevenue,
          totalOrders: ordersArray.length,
          totalProducts: Array.isArray(productsArray) ? productsArray.length : 0,
          totalCustomers: Array.isArray(usersArray) ? usersArray.length : 0,
        });

        setRecentOrders(Array.isArray(ordersArray) ? ordersArray.slice(0, 5) : []);
        setTopProducts(Array.isArray(productsArray) ? productsArray.slice(0, 5) : []);

        // Build chart data from last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push({
            day: d.toLocaleDateString('en', { weekday: 'short' }),
            revenue: Math.floor(Math.random() * 50000) + 10000,
            orders: Math.floor(Math.random() * 40) + 5,
          });
        }
        setRevenueData(days);
        setOrdersData(days);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statsCards = [
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', change: '12.5%', changeType: 'up', color: '#6C63FF' },
    { title: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), icon: '🛍️', change: '8.2%', changeType: 'up', color: '#10B981' },
    { title: 'Total Products', value: (stats?.totalProducts || 0).toLocaleString(), icon: '📦', change: '3.1%', changeType: 'up', color: '#F59E0B' },
    { title: 'Total Customers', value: (stats?.totalCustomers || 0).toLocaleString(), icon: '👥', change: '2.4%', changeType: 'down', color: '#EF4444' },
  ];

  if (loading) {
    return <div className="page-container loading-center"><div className="spinner spinner-lg" /></div>;
  }

  return (
    <div className="page-container">
      <div className={styles.statsGrid}>
        {statsCards.map((c, i) => <StatsCard key={i} {...c} />)}
      </div>

      <div className={styles.chartsRow}>
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Revenue (Last 7 Days)</h3>
            <span className={styles.chartBadge}>₹ INR</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13 }} />
              <Line type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: '#6C63FF', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Orders (Last 7 Days)</h3>
            <span className={styles.chartBadge}>Count</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [v, 'Orders']} contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13 }} />
              <Bar dataKey="orders" fill="#6C63FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={`card ${styles.ordersCard}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Orders</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/orders')}>View All →</button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><h3>No orders yet</h3></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td><span className={styles.orderId}>#{order._id?.slice(-6).toUpperCase()}</span></td>
                    <td>{order.user?.name || '—'}</td>
                    <td><strong>₹{(order.totalAmount || 0).toLocaleString()}</strong></td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td className={styles.date}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={`card ${styles.productsCard}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Top Products</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/products')}>View All →</button>
          </div>
          {topProducts.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📦</div><h3>No products yet</h3></div>
          ) : (
            <div className={styles.productList}>
              {topProducts.map((p, i) => (
                <div key={p._id} className={styles.productItem}>
                  <div className={styles.productRank}>{i + 1}</div>
                  <div className={styles.productImg}>
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.title} /> : <span>📦</span>}
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{p.title}</div>
                    <div className={styles.productStats}>₹{(p.price || 0).toLocaleString()}</div>
                  </div>
                  <div className={styles.productRevenue}>Stock: {p.stock || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
