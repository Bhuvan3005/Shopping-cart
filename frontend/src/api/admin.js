const API_BASE = process.env.REACT_APP_API_URL || '/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// Dashboard
export async function fetchDashboard(token) {
  const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch dashboard');
  return data;
}

// Products
export async function fetchAdminProducts(token) {
  const res = await fetch(`${API_BASE}/admin/products`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
}

export async function createProduct(productData, token) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create product');
  return data;
}

export async function updateProduct(id, productData, token) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update product');
  return data;
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
}

// Users
export async function fetchAdminUsers(token) {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
  return data;
}

export async function updateUserRole(id, role, token) {
  const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update user role');
  return data;
}

// Orders
export async function fetchAdminOrders(token) {
  const res = await fetch(`${API_BASE}/admin/orders`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
  return data;
}

export async function updateOrderStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update order status');
  return data;
}
