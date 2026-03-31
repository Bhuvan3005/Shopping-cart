import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchProfile } from '../api/users';
import { createOrder } from '../api/orders';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India' });
  const [useNew, setUseNew] = useState(false);
  const [placing, setPlacing] = useState(false);

  const taxPrice = Math.round(cartTotal * 0.18);
  const shippingPrice = cartTotal > 999 ? 0 : 99;
  const totalPrice = cartTotal + taxPrice + shippingPrice;

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    fetchProfile(accessToken).then((data) => {
      setAddresses(data.addresses || []);
      if (data.addresses?.length > 0) setSelectedAddress(0);
    }).catch(() => {});
  }, [accessToken, cart.length, navigate]);

  const getShippingAddress = () => {
    if (addresses.length === 0 || useNew) return newAddress;
    if (selectedAddress !== null && addresses[selectedAddress]) return addresses[selectedAddress];
    return null;
  };

  const handlePlaceOrder = async () => {
    const addr = getShippingAddress();
    if (!addr || !addr.fullName || !addr.street) {
      showToast('Please provide a shipping address', 'error');
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        items: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
        shippingAddress: addr,
        paymentMethod: 'Simulated',
      };
      const order = await createOrder(orderData, accessToken);
      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate(`/order/${order._id}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="checkout">
      <h1 className="checkout__title">Checkout</h1>

      <div className="checkout__steps">
        <span className={`checkout__step ${step >= 1 ? 'active' : ''}`}>1. Shipping</span>
        <span className={`checkout__step ${step >= 2 ? 'active' : ''}`}>2. Review & Place Order</span>
      </div>

      {step === 1 && (
        <section className="checkout__section">
          <h2>Shipping Address</h2>
          {addresses.length > 0 && !useNew && (
            <div className="checkout__saved-addresses">
              {addresses.map((addr, i) => (
                <label key={i} className={`checkout__address-option ${selectedAddress === i ? 'selected' : ''}`}>
                  <input type="radio" name="address" checked={selectedAddress === i} onChange={() => { setSelectedAddress(i); setUseNew(false); }} />
                  <div>
                    <strong>{addr.fullName}</strong>
                    <p>{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                    <p>📱 {addr.phone}</p>
                  </div>
                </label>
              ))}
              <button className="checkout__use-new" onClick={() => setUseNew(true)}>+ Use a new address</button>
            </div>
          )}
          {(addresses.length === 0 || useNew) && (
            <div className="checkout__new-address">
              {addresses.length > 0 && <button className="checkout__back-link" onClick={() => setUseNew(false)}>← Use saved address</button>}
              <div className="checkout__addr-grid">
                <input placeholder="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} required />
                <input placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                <input placeholder="Street Address" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} required className="full-width" />
                <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
                <input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
                <input placeholder="ZIP Code" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} required />
              </div>
            </div>
          )}
          <button className="checkout__next" onClick={() => setStep(2)}>Continue to Review</button>
        </section>
      )}

      {step === 2 && (
        <section className="checkout__section">
          <h2>Order Summary</h2>
          <div className="checkout__items">
            {cart.map((item) => (
              <div key={item._id} className="checkout__item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="checkout__item-name">{item.name}</p>
                  <p className="checkout__item-qty">Qty: {item.quantity}</p>
                </div>
                <span className="checkout__item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="checkout__totals">
            <div className="checkout__row"><span>Subtotal</span><span>₹{cartTotal.toFixed(0)}</span></div>
            <div className="checkout__row"><span>Tax (18% GST)</span><span>₹{taxPrice}</span></div>
            <div className="checkout__row"><span>Shipping</span><span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span></div>
            <div className="checkout__row checkout__row--total"><span>Total</span><span>₹{totalPrice}</span></div>
          </div>
          <div className="checkout__actions">
            <button className="checkout__back" onClick={() => setStep(1)}>← Back</button>
            <button className="checkout__place" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : '🛒 Place Order'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
