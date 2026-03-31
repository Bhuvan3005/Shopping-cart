import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchDashboard } from '../../api/admin';
import './Dashboard.css';

export default function Dashboard() {
  const { accessToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard(accessToken)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <div className="admin"><div className="loader"><div className="spinner" /></div></div>;
  if (!data) return <div className="admin"><p>Failed to load dashboard</p></div>;

  return (
    <div className="admin">
      <h1 className="admin__title">Admin Dashboard</h1>
      <div className="admin__stats">
        <div className="stat-card"><span className="stat-card__value">{data.totalProducts}</span><span className="stat-card__label">Products</span></div>
        <div className="stat-card"><span className="stat-card__value">{data.totalUsers}</span><span className="stat-card__label">Users</span></div>
        <div className="stat-card"><span className="stat-card__value">{data.totalOrders}</span><span className="stat-card__label">Orders</span></div>
        <div className="stat-card stat-card--revenue"><span className="stat-card__value">₹{data.revenue?.toLocaleString()}</span><span className="stat-card__label">Revenue</span></div>
      </div>

      <div className="admin__nav">
        <Link to="/admin/products" className="admin-nav-card">📦 Manage Products</Link>
        <Link to="/admin/users" className="admin-nav-card">👥 Manage Users</Link>
        <Link to="/admin/orders" className="admin-nav-card">🛒 Manage Orders</Link>
      </div>

      {data.recentOrders?.length > 0 && (
        <section className="admin__section">
          <h2>Recent Orders</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-8)}</td>
                  <td>{order.user?.name || 'Unknown'}</td>
                  <td>₹{order.totalPrice}</td>
                  <td><span className={`status-badge status--${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
