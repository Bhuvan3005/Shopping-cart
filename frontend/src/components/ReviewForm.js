import React, { useState } from 'react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitReview } from '../api/products';
import './ReviewForm.css';

export default function ReviewForm({ productId, onReviewAdded }) {
  const { accessToken, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <p className="review-form__login">Please log in to leave a review.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(productId, { rating, comment }, accessToken);
      showToast('Review submitted!', 'success');
      setRating(0);
      setComment('');
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      <div className="review-form__rating">
        <label>Your Rating:</label>
        <StarRating rating={rating} onRate={setRating} interactive size="1.5rem" />
      </div>
      <textarea
        className="review-form__comment"
        placeholder="Share your thoughts about this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows={4}
      />
      <button type="submit" className="review-form__submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
