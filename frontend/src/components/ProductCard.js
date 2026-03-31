import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';
import './ProductCard.css';

export default function ProductCard({ product }) {
    const { cart, addToCart, updateQuantity } = useCart();

    const cartItem = cart.find((item) => item._id === product._id);
    const qty = cartItem ? cartItem.quantity : 0;
    const atStockLimit = qty >= product.stock;
    const inCart = qty > 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (atStockLimit) return;
        addToCart(product, 1);
    };

    const handleIncrease = (e) => {
        e.preventDefault();
        if (atStockLimit) return;
        if (inCart) {
            updateQuantity(product._id, Math.min(qty + 1, product.stock), product.stock);
        } else {
            addToCart(product, 1);
        }
    };

    const handleDecrease = (e) => {
        e.preventDefault();
        if (!inCart) return;
        const newQty = qty - 1;
        if (newQty <= 0) {
            updateQuantity(product._id, 0);
        } else {
            updateQuantity(product._id, newQty);
        }
    };

    return (
        <article className="product-card">
            <Link to={`/product/${product._id}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                />
                <div className="product-body">
                    <h3 className="product-title">{product.name}</h3>
                    {product.numReviews > 0 && (
                        <div className="product-rating">
                            <StarRating rating={product.averageRating || 0} size="0.9rem" />
                            <span className="product-rating__count">({product.numReviews})</span>
                        </div>
                    )}
                    <p className="product-desc">{product.description}</p>
                    <div className="product-footer">
                        <span className="product-price">
                            ₹{product.price.toFixed(0)}
                        </span>
                        {product.stock === 0 ? (
                            <span className="out-of-stock">Out of Stock</span>
                        ) : inCart ? (
                            <div className="quantity-controls" onClick={(e) => e.preventDefault()}>
                                <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={handleDecrease}
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span className="qty-value">{qty}</span>
                                <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={handleIncrease}
                                    disabled={atStockLimit}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </article>
    );
}
