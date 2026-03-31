import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchAdminProducts, deleteProduct, createProduct, updateProduct } from '../../api/admin';
import './Dashboard.css';

export default function ManageProducts() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Electronics', stock: '', image: '' });

  const loadProducts = () => {
    fetchAdminProducts(accessToken).then(setProducts).catch((err) => showToast(err.message, 'error')).finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, [accessToken]); // eslint-disable-line

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id, accessToken);
      setProducts(products.filter((p) => p._id !== id));
      showToast('Product deleted', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({ name: product.name, description: product.description, price: product.price, category: product.category, stock: product.stock, image: product.image });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, form, accessToken);
        showToast('Product updated!', 'success');
      } else {
        await createProduct({ ...form, price: Number(form.price), stock: Number(form.stock) }, accessToken);
        showToast('Product created!', 'success');
      }
      setShowForm(false);
      setEditingProduct(null);
      setForm({ name: '', description: '', price: '', category: 'Electronics', stock: '', image: '' });
      loadProducts();
    } catch (err) { showToast(err.message, 'error'); }
  };

  if (loading) return <div className="admin"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="admin">
      <h1 className="admin__title">Manage Products</h1>
      <div className="admin__actions">
        <button className="admin__add-btn" onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', price: '', category: 'Electronics', stock: '', image: '' }); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin__section" style={{ marginBottom: '1.5rem' }}>
          <h2>{editingProduct ? 'Edit Product' : 'New Product'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #ddd' }} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #ddd' }}>
              {['Electronics','Clothing','Home','Books','Sports','Other'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={{ padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #ddd' }} />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required style={{ padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #ddd' }} />
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #ddd', gridColumn: '1/-1' }} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} style={{ padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #ddd', gridColumn: '1/-1', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" className="admin__add-btn" style={{ marginTop: '0.75rem' }}>
            {editingProduct ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="admin__section">
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img src={p.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="admin-table__btn admin-table__btn--edit" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="admin-table__btn admin-table__btn--delete" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
