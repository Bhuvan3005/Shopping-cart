import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchProfile, updateProfile, updateAddresses } from '../api/users';
import './Profile.css';

export default function Profile() {
  const { accessToken, logout } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile(accessToken)
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [accessToken, showToast]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, email };
      if (password) data.password = password;
      await updateProfile(data, accessToken);
      showToast('Profile updated!', 'success');
      setPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const updated = [...(profile.addresses || []), addressForm];
      const result = await updateAddresses(updated, accessToken);
      setProfile({ ...profile, addresses: result });
      setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India' });
      setEditing(false);
      showToast('Address added!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const updated = profile.addresses.filter((_, i) => i !== index);
      const result = await updateAddresses(updated, accessToken);
      setProfile({ ...profile, addresses: result });
      showToast('Address removed', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <main className="profile"><div className="loader"><div className="spinner" /></div></main>;

  return (
    <main className="profile">
      <h1 className="profile__title">My Profile</h1>

      <div className="profile__grid">
        <section className="profile__card">
          <h2>Account Details</h2>
          <form onSubmit={handleProfileUpdate} className="profile__form">
            <div className="form-group">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>New Password (leave blank to keep)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="••••••••" />
            </div>
            <button type="submit" className="profile__save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        <section className="profile__card">
          <h2>Shipping Addresses</h2>
          {profile?.addresses?.length > 0 ? (
            <div className="address-list">
              {profile.addresses.map((addr, i) => (
                <div key={i} className="address-card">
                  <p className="address-card__name">{addr.fullName}</p>
                  <p>{addr.street}, {addr.city}</p>
                  <p>{addr.state} - {addr.zip}, {addr.country}</p>
                  <p>📱 {addr.phone}</p>
                  <button className="address-card__delete" onClick={() => handleDeleteAddress(i)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile__empty">No saved addresses</p>
          )}

          {editing ? (
            <form onSubmit={handleAddAddress} className="address-form">
              <div className="address-form__grid">
                <input placeholder="Full Name" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} required />
                <input placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required />
                <input placeholder="Street Address" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} required className="address-form__full" />
                <input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required />
                <input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required />
                <input placeholder="ZIP Code" value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })} required />
              </div>
              <div className="address-form__actions">
                <button type="submit" className="profile__save">Save Address</button>
                <button type="button" className="profile__cancel" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="profile__add-address" onClick={() => setEditing(true)}>+ Add Address</button>
          )}
        </section>
      </div>
    </main>
  );
}
