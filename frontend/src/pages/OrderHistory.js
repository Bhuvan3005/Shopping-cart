import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchOrders } from '../api/orders';
import './OrderHistory.css';

export default function OrderHistory() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders(accessToken)
      .then(setOrders)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [accessToken, showToast]);

  if (loading) return <main className="orders"><div className="loader"><div className="spinner" /></div></main>;

  return (
    <main className="orders">
      <h1 className="orders__title">My Orders</h1>
      {orders.length === 0 ? (
        <div className="orders__empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="orders__shop-link">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders__list">
          {orders.map((order) => (
            <Link to={`/order/${order._id}`} key={order._id} className="order-card">
              <div className="order-card__header">
                <span className="order-card__id">#{order._id.slice(-8)}</span>
                <span className={`status-badge status--${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <div className="order-card__body">
                <div className="order-card__items">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className="order-card__thumb" />
                  ))}
                  {order.items.length > 3 && <span className="order-card__more">+{order.items.length - 3}</span>}
                </div>
                <div className="order-card__details">
                  <p className="order-card__total">₹{order.totalPrice}</p>
                  <p className="order-card__date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
