import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-icon">✦</span>
            Mercury Store
          </Link>
          <p className="footer__tagline">
            Quality products for everyday life. Shop with confidence.
          </p>
        </div>

        <div className="footer__links">
          <h4>Shop</h4>
          <Link to="/?category=Electronics">Electronics</Link>
          <Link to="/?category=Clothing">Clothing</Link>
          <Link to="/?category=Home">Home</Link>
          <Link to="/?category=Sports">Sports</Link>
        </div>

        <div className="footer__links">
          <h4>Account</h4>
          <Link to="/cart">View Cart</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {currentYear} Mercury Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
