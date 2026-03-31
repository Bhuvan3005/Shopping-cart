const API_BASE = process.env.REACT_APP_API_URL || '/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function createOrder(orderData, token) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create order');
  return data;
}

export async function fetchOrders(token) {
  const res = await fetch(`${API_BASE}/my-orders`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
  return data;
}

export async function fetchOrder(id, token) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch order');
  return data;
}
