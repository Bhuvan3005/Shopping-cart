import React from 'react';
import './Skeleton.css';

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton--image" />
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text skeleton--short" />
    </div>
  );
}

export function SkeletonLine({ width }) {
  return <div className="skeleton skeleton--line" style={{ width: width || '100%' }} />;
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
