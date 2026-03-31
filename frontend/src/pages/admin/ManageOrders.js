import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchAdminOrders, updateOrderStatus } from '../../api/admin';
import './Dashboard.css';

const STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

export default function ManageOrders() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOrders(accessToken).then(setOrders).catch((err) => showToast(err.message, 'error')).finally(() => setLoading(false));
  }, [accessToken, showToast]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus, accessToken);
      setOrders(orders.map((o) => o._id === orderId ? { ...o, status: updated.status } : o));
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  if (loading) return <div className="admin"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="admin">
      <h1 className="admin__title">Manage Orders</h1>
      <div className="admin__section">
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>#{order._id.slice(-8)}</td>
                <td>{order.user?.name || 'Unknown'}</td>
                <td>{order.items.length} items</td>
                <td>₹{order.totalPrice}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`status-badge status--${order.status.toLowerCase()}`}
                    style={{ border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.5rem', borderRadius: '20px' }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
