const API_BASE = process.env.REACT_APP_API_URL || '/api';

export async function fetchProducts({ category, search, minPrice, maxPrice, sort, page, limit } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);
  if (sort) params.append('sort', sort);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/products${query}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json(); // { products, page, pages, total }
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function fetchRelatedProducts(id) {
  const res = await fetch(`${API_BASE}/products/${id}/related`);
  if (!res.ok) throw new Error('Failed to fetch related products');
  return res.json();
}

export async function submitReview(productId, { rating, comment }, token) {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit review');
  return data;
}
