import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import './Navbar.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-icon">✦</span>
          Shopper Stop
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search products"
          />
          <button type="submit" className="search-btn" aria-label="Submit search">
            Search
          </button>
        </form>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
              >
                <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown" onClick={() => setUserMenuOpen(false)}>
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/orders" className="dropdown-item">My Orders</Link>
                  <Link to="/wishlist" className="dropdown-item">Wishlist</Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item dropdown-item--admin">
                      Admin Panel
                    </Link>
                  )}
                  <button className="dropdown-item dropdown-item--logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link auth-link--register">Register</Link>
            </div>
          )}
          <Link to="/cart" className="cart-link" onClick={() => setMobileMenuOpen(false)}>
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="cart-count">{cartCount}</span>
          </Link>
          <button
            className="menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
              <button className="mobile-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
