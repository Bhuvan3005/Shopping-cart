import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__content">
        <h1 className="not-found__code">404</h1>
        <h2 className="not-found__title">Page Not Found</h2>
        <p className="not-found__text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found__link">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
