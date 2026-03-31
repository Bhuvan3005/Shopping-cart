import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please login to checkout', 'info');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartCount === 0) {
    return (
      <main className="cart cart--empty">
        <h1>Your Cart is Empty</h1>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="cart__cta">Continue Shopping</Link>
      </main>
    );
  }

  const taxPrice = Math.round(cartTotal * 0.18);
  const shippingPrice = cartTotal > 999 ? 0 : 99;
  const totalPrice = cartTotal + taxPrice + shippingPrice;

  return (
    <main className="cart">
      <h1 className="cart__title">Your Cart ({cartCount} items)</h1>

      <div className="cart__layout">
        <section className="cart__items">
          {cart.map((item) => (
            <article key={item._id} className="cart-item">
              <div className="cart-item__image-wrap">
                <img src={item.image} alt={item.name} className="cart-item__image" />
              </div>
              <div className="cart-item__info">
                <Link to={`/product/${item._id}`} className="cart-item__name">{item.name}</Link>
                <p className="cart-item__price">₹{item.price.toFixed(0)} each</p>
                <div className="cart-item__actions">
                  <div className="cart-item__qty">
                    <button type="button" onClick={() => updateQuantity(item._id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item._id, Math.min(item.quantity + 1, item.stock ?? 999), item.stock)} disabled={(item.stock ?? 999) <= item.quantity} aria-label="Increase quantity">+</button>
                  </div>
                  <button type="button" className="cart-item__remove" onClick={() => removeFromCart(item._id)}>Remove</button>
                </div>
              </div>
              <div className="cart-item__total">₹{(item.price * item.quantity).toFixed(0)}</div>
            </article>
          ))}
        </section>

        <aside className="cart__summary">
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary__row"><span>Subtotal</span><span>₹{cartTotal.toFixed(0)}</span></div>
            <div className="cart-summary__row"><span>Tax (18% GST)</span><span>₹{taxPrice}</span></div>
            <div className="cart-summary__row"><span>Shipping</span><span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span></div>
            <div className="cart-summary__row cart-summary__total"><span>Total</span><span>₹{totalPrice}</span></div>
            <button className="cart-summary__checkout" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <Link to="/" className="cart-summary__continue">Continue Shopping</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
