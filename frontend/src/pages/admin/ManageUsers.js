import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchAdminUsers, updateUserRole } from '../../api/admin';
import './Dashboard.css';

export default function ManageUsers() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminUsers(accessToken).then(setUsers).catch((err) => showToast(err.message, 'error')).finally(() => setLoading(false));
  }, [accessToken, showToast]);

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      const updated = await updateUserRole(id, newRole, accessToken);
      setUsers(users.map((u) => u._id === id ? { ...u, role: updated.role } : u));
      showToast(`Role changed to ${newRole}`, 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  if (loading) return <div className="admin"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="admin">
      <h1 className="admin__title">Manage Users</h1>
      <div className="admin__section">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`status-badge ${u.role === 'admin' ? 'status--shipped' : 'status--pending'}`}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="admin-table__btn admin-table__btn--edit" onClick={() => toggleRole(u._id, u.role)}>
                    {u.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
