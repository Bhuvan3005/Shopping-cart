import React from 'react';
import './StarRating.css';

export default function StarRating({ rating, onRate, size = '1.25rem', interactive = false }) {
  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= Math.round(rating) ? 'star--filled' : ''} ${interactive ? 'star--interactive' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `Rate ${star} stars` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}
