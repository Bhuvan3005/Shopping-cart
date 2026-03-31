import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProduct, fetchRelatedProducts } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addToWishlist, removeFromWishlist, getWishlist } from '../api/users';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const { isAuthenticated, accessToken } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);

  const loadProduct = () => {
    setLoading(true);
    fetchProduct(id)
      .then((data) => { setProduct(data); setQuantity(1); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProduct();
    fetchRelatedProducts(id).then(setRelated).catch(() => {});
  }, [id]); // eslint-disable-line

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      getWishlist(accessToken).then((items) => {
        setWishlisted(items.some((p) => p._id === id));
      }).catch(() => {});
    }
  }, [id, isAuthenticated, accessToken]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    showToast('Added to cart!', 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { showToast('Please login to use wishlist', 'info'); return; }
    try {
      if (wishlisted) {
        await removeFromWishlist(id, accessToken);
        setWishlisted(false);
        showToast('Removed from wishlist', 'info');
      } else {
        await addToWishlist(id, accessToken);
        setWishlisted(true);
        showToast('Added to wishlist!', 'success');
      }
    } catch (err) { showToast(err.message, 'error'); }
  };

  if (loading) {
    return <main className="product-detail"><div className="product-detail__loader"><div className="spinner" /></div></main>;
  }
  if (!product) return null;

  const maxQty = Math.min(product.stock, 99);

  return (
    <main className="product-detail">
      <div className="product-detail__inner">
        <button className="product-detail__back" onClick={() => navigate(-1)}>← Back</button>

        <article className="product-detail__card">
          <div className="product-detail__image-wrap">
            <img src={product.image} alt={product.name} className="product-detail__image" />
            <span className="product-detail__category">{product.category}</span>
            <button className={`product-detail__wishlist ${wishlisted ? 'wishlisted' : ''}`} onClick={toggleWishlist} title="Toggle wishlist">
              {wishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="product-detail__body">
            <h1 className="product-detail__title">{product.name}</h1>
            <div className="product-detail__rating-row">
              <StarRating rating={product.averageRating || 0} />
              <span className="product-detail__review-count">({product.numReviews || 0} reviews)</span>
            </div>
            <p className="product-detail__desc">{product.description}</p>
            <p className="product-detail__price">₹{product.price.toFixed(0)}</p>

            {product.stock > 0 ? (
              <>
                <p className="product-detail__stock">In Stock: {product.stock}</p>
                <div className="product-detail__qty">
                  <label htmlFor="qty">Quantity:</label>
                  <input
                    id="qty"
                    type="number"
                    min="1"
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, +e.target.value)))}
                  />
                </div>
                <button className={`product-detail__add ${added ? 'added' : ''}`} onClick={handleAddToCart}>
                  {added ? 'Added to Cart ✓' : 'Add to Cart'}
                </button>
              </>
            ) : (
              <p className="product-detail__out">Out of Stock</p>
            )}
          </div>
        </article>

        {/* Reviews Section */}
        <section className="product-detail__reviews">
          <h2>Customer Reviews ({product.numReviews || 0})</h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="reviews-list">
              {product.reviews.map((review, i) => (
                <div key={i} className="review-item">
                  <div className="review-item__header">
                    <span className="review-item__author">{review.name}</span>
                    <StarRating rating={review.rating} size="1rem" />
                  </div>
                  <p className="review-item__comment">{review.comment}</p>
                  <span className="review-item__date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="review-empty">No reviews yet. Be the first!</p>
          )}
          <ReviewForm productId={id} onReviewAdded={loadProduct} />
        </section>
      </div>
    </main>
  );
}
