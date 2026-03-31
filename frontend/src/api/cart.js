const API_BASE = process.env.REACT_APP_API_URL || '/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function fetchCart(token) {
  const res = await fetch(`${API_BASE}/cart`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch cart');
  return data;
}

export async function syncCart(items, token) {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to sync cart');
  return data;
}

export async function mergeCart(items, token) {
  const res = await fetch(`${API_BASE}/cart/merge`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to merge cart');
  return data;
}

export async function clearServerCart(token) {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to clear cart');
  return data;
}
