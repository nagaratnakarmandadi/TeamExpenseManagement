import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Trash2, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Key
} from 'lucide-react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = authService.getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    password: 'password123', 
    role: 'MEMBER' 
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification banners
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to fetch users from server' });
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const validateForm = () => {
    const errors = {};
    if (!newUser.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!newUser.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!newUser.password || newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      // Register with role and hashed password via authService
      await authService.register({
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role,
      });

      showFeedback('success', `User "${newUser.name}" registered with role ${newUser.role}.`);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: 'password123', role: 'MEMBER' });
      setFormErrors({});
      await loadUsers();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await userService.deleteUser(userToDelete.id);
      showFeedback('success', `User "${userToDelete.name}" deleted.`);
      setUserToDelete(null);
      await loadUsers();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users by search
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term) ||
        String(u.id).includes(term)
    );
  }, [users, searchTerm]);

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
            <ShieldAlert size={12} />
            <span>ADMIN</span>
          </span>
        );
      case 'MANAGER':
        return (
          <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
            <ShieldCheck size={12} />
            <span>MANAGER</span>
          </span>
        );
      case 'VIEWER':
        return (
          <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>
            <Eye size={12} />
            <span>VIEWER</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-primary">
            <Shield size={12} />
            <span>MEMBER</span>
          </span>
        );
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Users & Permissions</h1>
          <p>Manage enterprise identities, credentials, role-based access, and event memberships</p>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormErrors({});
              setNewUser({ name: '', email: '', password: 'password123', role: 'MEMBER' });
              setIsAddModalOpen(true);
            }}
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'danger' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <div style={{ flex: 1 }}>{feedback.message}</div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, role, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> members
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loading message="Loading team members..." />
      ) : filteredUsers.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>User ID</th>
                <th>Member Profile</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Event Memberships</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    #{user.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {user.email === currentUser?.email ? '(Current Session)' : 'Registered User'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    {renderRoleBadge(user.role || 'MEMBER')}
                  </td>
                  <td>
                    {user.events && user.events.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {user.events.map((ev) => (
                          <span key={ev.id} className="badge badge-primary">
                            <Calendar size={11} />
                            {ev.eventName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        No events assigned
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin && user.email !== currentUser?.email ? (
                      <button
                        className="btn-icon danger"
                        title="Delete User (Admin Only)"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <UsersIcon size={30} />
            </div>
            <h3 className="empty-title">
              {searchTerm ? 'No matching users found' : 'No users registered yet'}
            </h3>
            <p className="empty-desc">
              {searchTerm
                ? 'Try adjusting your search keywords to find the user.'
                : 'Get started by creating your first team member.'}
            </p>
            {!searchTerm && (
              <button 
                className="btn btn-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus size={16} />
                <span>Add User</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="Register New Team Member"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Register Member'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.name ? 'error' : ''}`}
              placeholder="e.g. John Doe"
              value={newUser.name}
              onChange={(e) => {
                setNewUser({ ...newUser, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: null });
              }}
              autoFocus
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${formErrors.email ? 'error' : ''}`}
              placeholder="e.g. john.doe@company.com"
              value={newUser.email}
              onChange={(e) => {
                setNewUser({ ...newUser, email: e.target.value });
                if (formErrors.email) setFormErrors({ ...formErrors, email: null });
              }}
            />
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Initial Password <span className="req">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${formErrors.password ? 'error' : ''}`}
                value={newUser.password}
                onChange={(e) => {
                  setNewUser({ ...newUser, password: e.target.value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: null });
                }}
              />
              {formErrors.password && <div className="form-error">{formErrors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Role & Permissions <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="MEMBER">Member (Standard)</option>
                <option value="MANAGER">Manager (Events & Approvals)</option>
                <option value="ADMIN">Admin (Full Control)</option>
                <option value="VIEWER">Viewer (Read-Only)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => !isDeleting && setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to remove user "${userToDelete?.name}" (${userToDelete?.email})? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
