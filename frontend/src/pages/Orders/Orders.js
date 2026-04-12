import React, { useState, useEffect } from 'react';
import API, { API_URL } from '../../utils/api';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try { const { data } = await API.get('/api/orders.php?action=my-orders'); setOrders(data); }
            catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="orders-page">
            <h2>My Orders</h2>
            {orders.length === 0 ? <p className="no-orders">No orders yet.</p> : orders.map(order => (
                <div key={order.id} className="order-card">
                    <div className="order-header">
                        <div>
                            <strong>Order #{order.id}</strong>
                            <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className={`status ${order.order_status}`}>{order.order_status}</span>
                            <span className={`payment ${order.payment_status}`}>{order.payment_status}</span>
                        </div>
                    </div>
                    <div className="order-items">
                        {order.items?.map(item => (
                            <div key={item.id} className="order-item">
                                <img src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : 'https://via.placeholder.com/50'} alt={item.name} />
                                <div>
                                    <p>{item.name}</p>
                                    <p className="item-detail">Qty: {item.quantity} x &#8377;{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="order-footer"><span>Total: <strong>&#8377;{order.total_amount}</strong></span></div>
                </div>
            ))}
        </div>
    );
};

export default Orders;
