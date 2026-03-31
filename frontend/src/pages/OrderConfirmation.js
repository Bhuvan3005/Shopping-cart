import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOrder } from '../api/orders';
import './Checkout.css'; /* reuse checkout styles */

export default function OrderConfirmation() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(id, accessToken)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  if (loading) return <main className="checkout"><div className="loader"><div className="spinner" /></div></main>;
  if (!order) return <main className="checkout"><p>Order not found</p></main>;

  return (
    <main className="checkout">
      <div className="order-confirm">
        <div className="order-confirm__icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p className="order-confirm__id">Order ID: <code>{order._id}</code></p>
        <p className="order-confirm__status">Status: <span className={`status-badge status--${order.status.toLowerCase()}`}>{order.status}</span></p>

        <div className="checkout__section" style={{marginTop: '1.5rem'}}>
          <div className="order-confirm__shipping" style={{marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px'}}>
            <h3 style={{margin: '0 0 0.5rem'}}>Shipping Address</h3>
            <p style={{margin: '0 0 0.2rem', fontWeight: '600'}}>{order.shippingAddress.fullName}</p>
            <p style={{margin: '0 0 0.2rem'}}>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
            <p style={{margin: '0 0 0.2rem'}}>{order.shippingAddress.state} - {order.shippingAddress.zip}, {order.shippingAddress.country}</p>
            <p style={{margin: '0 0 0.2rem'}}>📱 {order.shippingAddress.phone}</p>
          </div>
          <h2>Order Details</h2>
          <div className="checkout__items">
            {order.items.map((item, i) => (
              <div key={i} className="checkout__item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="checkout__item-name">{item.name}</p>
                  <p className="checkout__item-qty">Qty: {item.quantity} × ₹{item.price.toFixed(0)}</p>
                </div>
                <span className="checkout__item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="checkout__totals">
            <div className="checkout__row"><span>Subtotal</span><span>₹{order.itemsTotal}</span></div>
            <div className="checkout__row"><span>Tax</span><span>₹{order.taxPrice}</span></div>
            <div className="checkout__row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
            <div className="checkout__row checkout__row--total"><span>Total</span><span>₹{order.totalPrice}</span></div>
          </div>
        </div>

        <div className="order-confirm__actions">
          <Link to="/orders" className="checkout__back">View All Orders</Link>
          <Link to="/" className="checkout__next">Continue Shopping</Link>
        </div>
      </div>
    </main>
  );
}
