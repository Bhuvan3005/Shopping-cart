const API_BASE = process.env.REACT_APP_API_URL || '/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function fetchProfile(token) {
  const res = await fetch(`${API_BASE}/users/profile`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data;
}

export async function updateProfile(profileData, token) {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
}

export async function updateAddresses(addresses, token) {
  const res = await fetch(`${API_BASE}/users/addresses`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ addresses }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update addresses');
  return data;
}

export async function getWishlist(token) {
  const res = await fetch(`${API_BASE}/wishlist`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch wishlist');
  return data;
}

export async function addToWishlist(productId, token) {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add to wishlist');
  return data;
}

export async function removeFromWishlist(productId, token) {
  const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove from wishlist');
  return data;
}
