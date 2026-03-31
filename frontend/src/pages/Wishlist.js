import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { getWishlist, removeFromWishlist } from '../api/users';
import './Wishlist.css';

export default function Wishlist() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    getWishlist(accessToken)
      .then(setItems)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWishlist(); }, [accessToken]); // eslint-disable-line

  const handleRemove = async (productId) => {
    try {
      const updated = await removeFromWishlist(productId, accessToken);
      setItems(updated);
      showToast('Removed from wishlist', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    handleRemove(product._id);
    showToast('Moved to cart!', 'success');
  };

  if (loading) return <main className="wishlist"><div className="loader"><div className="spinner" /></div></main>;

  return (
    <main className="wishlist">
      <h1 className="wishlist__title">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="wishlist__empty">
          <p>Your wishlist is empty</p>
          <Link to="/" className="wishlist__shop">Browse Products</Link>
        </div>
      ) : (
        <div className="wishlist__grid">
          {items.map((product) => (
            <div key={product._id} className="wishlist-card">
              <Link to={`/product/${product._id}`}>
                <img src={product.image} alt={product.name} className="wishlist-card__image" />
              </Link>
              <div className="wishlist-card__body">
                <Link to={`/product/${product._id}`} className="wishlist-card__name">{product.name}</Link>
                <p className="wishlist-card__price">₹{product.price.toFixed(0)}</p>
                <div className="wishlist-card__actions">
                  <button onClick={() => handleMoveToCart(product)} disabled={product.stock === 0}>
                    {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                  <button className="wishlist-card__remove" onClick={() => handleRemove(product._id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
