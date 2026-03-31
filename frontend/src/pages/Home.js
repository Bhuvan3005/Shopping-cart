import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid } from '../components/Skeleton';
import './Home.css';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Home', 'Books', 'Sports', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts({
      category: category && category !== 'All' ? category : undefined,
      search: search || undefined,
      sort,
      page,
      limit: 12,
    })
      .then((data) => {
        // Handle both old format (flat array) and new format ({ products, pages, total })
        const items = Array.isArray(data) ? data : (data.products || []);
        setProducts(items);
        setPages(data.pages || 1);
        setTotal(data.total || items.length);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'All' && value !== 'newest') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
    setPage(1);
  };

  return (
    <main className="home">
      <header className="home-header">
        <h1 className="home-title">
          {search ? `Results for "${search}"` : 'Shop All Products'}
        </h1>
        {!loading && !error && total > 0 && (
          <span className="product-count">{total} products</span>
        )}
      </header>

      <div className="home-filters">
        <div className="filter-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${(category || 'All') === cat ? 'filter-chip--active' : ''}`}
              onClick={() => updateParam('category', cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          className="filter-sort"
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading && <SkeletonGrid count={6} />}

      {error && (
        <div className="error">
          <p>{error}</p>
          <p className="error-hint">
            Make sure MongoDB is running and you've run <code>npm run seed</code>.
          </p>
        </div>
      )}

      {!loading && !error && (!products || products.length === 0) && (
        <div className="empty">
          <p>No products found. Try a different search or filter.</p>
          <Link to="/" className="empty-link">View all products</Link>
        </div>
      )}

      {!loading && !error && products && products.length > 0 && (
        <>
          <section className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </section>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </main>
  );
}
