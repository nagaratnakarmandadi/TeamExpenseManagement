import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import SplitCalculator from '../components/SplitCalculator';

const CATEGORIES = ['Food', 'Travel', 'Accommodation', 'Tech', 'Entertainment', 'Office', 'Other'];

export default function Expenses() {
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    expenseDate: new Date().toISOString().split('T')[0],
    eventId: '',
    userId: '',
  });
  const [splitData, setSplitData] = useState({ splitType: 'EQUAL', splits: [], isValid: true, error: null });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm state
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  // If navigated from Navbar "+ Record Expense", open create modal automatically
  useEffect(() => {
    if (location.state?.openCreateModal && !loading && events.length > 0) {
      openAddModal();
    }
  }, [location.state, loading, events]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [expensesData, eventsData, usersData] = await Promise.all([
        expenseService.getAllExpenses(),
        eventService.getAllEvents(),
        userService.getAllUsers(),
      ]);
      setExpenses(expensesData || []);
      setEvents(eventsData || []);
      setUsers(usersData || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to load expense records.' });
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      expenseDate: new Date().toISOString().split('T')[0],
      eventId: events[0]?.id || '',
      userId: users[0]?.id || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setIsEditing(true);
    setEditingId(expense.id);
    setFormData({
      description: expense.description || '',
      amount: expense.amount || '',
      category: expense.category || 'Food',
      expenseDate: expense.expenseDate || new Date().toISOString().split('T')[0],
      eventId: expense.event?.id || '',
      userId: expense.paidBy?.id || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.amount || Number(formData.amount) <= 0) errors.amount = 'Amount must be greater than zero';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.expenseDate) errors.expenseDate = 'Date is required';
    if (!formData.eventId) errors.eventId = 'Event must be selected';
    if (!formData.userId) errors.userId = 'Paying member must be selected';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!splitData.isValid) {
      showFeedback('danger', splitData.error || 'Please correct the split allocations.');
      return;
    }

    const payload = {
      description: formData.description.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      expenseDate: formData.expenseDate,
      eventId: Number(formData.eventId),
      userId: Number(formData.userId),
      splitType: splitData.splitType,
      splits: splitData.splits,
    };

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await expenseService.updateExpense(editingId, payload);
        showFeedback('success', `Expense #${editingId} updated successfully.`);
      } else {
        await expenseService.createExpense(payload);
        showFeedback('success', `Expense "${payload.description}" recorded successfully.`);
      }
      setIsModalOpen(false);
      await loadAllData();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to save expense record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      setIsDeleting(true);
      await expenseService.deleteExpense(expenseToDelete.id);
      showFeedback('success', `Expense #${expenseToDelete.id} deleted.`);
      setExpenseToDelete(null);
      await loadAllData();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to delete expense record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered expenses logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Search by description or ID
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const descMatch = item.description?.toLowerCase().includes(term);
        const idMatch = String(item.id).includes(term);
        const userMatch = item.paidBy?.name?.toLowerCase().includes(term);
        const eventMatch = item.event?.eventName?.toLowerCase().includes(term);
        if (!descMatch && !idMatch && !userMatch && !eventMatch) return false;
      }

      // Filter by category
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      // Filter by event
      if (selectedEventId && String(item.event?.id) !== String(selectedEventId)) {
        return false;
      }

      // Filter by date range
      if (startDate && item.expenseDate && item.expenseDate < startDate) {
        return false;
      }
      if (endDate && item.expenseDate && item.expenseDate > endDate) {
        return false;
      }

      return true;
    });
  }, [expenses, searchTerm, selectedCategory, selectedEventId, startDate, endDate]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredExpenses]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Expense Management</h1>
          <p>Track, categorize, and reconcile all company and team expenses</p>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-primary"
            onClick={openAddModal}
            disabled={events.length === 0 || users.length === 0}
            title={
              events.length === 0 || users.length === 0
                ? 'Create at least one user and event first'
                : 'Record new expense'
            }
          >
            <Plus size={18} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Prerequisite warning if no users or events exist */}
      {(events.length === 0 || users.length === 0) && !loading && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <div>
            <strong>Prerequisite Required:</strong> You must create at least one team member in{' '}
            <a href="#/users" style={{ textDecoration: 'underline', fontWeight: 600 }}>Users</a> and one event in{' '}
            <a href="#/events" style={{ textDecoration: 'underline', fontWeight: 600 }}>Events</a> before adding expenses.
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.type === 'danger' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <div style={{ flex: 1 }}>{feedback.message}</div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search */}
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search description, member, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Dropdown */}
            <select
              className="select-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Event Dropdown */}
            <select
              className="select-filter"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.eventName}</option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory || selectedEventId || startDate || endDate) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedEventId('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Date Range Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>Date Range:</span>
            <input
              type="date"
              className="select-filter"
              style={{ padding: '6px 10px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="From date"
            />
            <span>to</span>
            <input
              type="date"
              className="select-filter"
              style={{ padding: '6px 10px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="To date"
            />

            <div style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-primary)' }}>
              Filtered Total: <span style={{ color: 'var(--success)', fontSize: '16px', fontWeight: 800 }}>{formatCurrency(totalFilteredAmount)}</span>
              {' '}<span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({filteredExpenses.length} items)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <Loading message="Loading expenses..." />
      ) : filteredExpenses.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Event</th>
                <th>Paid By</th>
                <th>Split</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    #{exp.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {exp.description}
                    </div>
                  </td>
                  <td>
                    <Badge category={exp.category} />
                  </td>
                  <td>
                    {exp.event ? (
                      <span className="badge badge-primary" style={{ fontWeight: 500 }}>
                        {exp.event.eventName}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {exp.paidBy?.name ? exp.paidBy.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span style={{ fontSize: '13px' }}>{exp.paidBy?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: exp.splitType === 'PERCENTAGE' ? '#EDE9FE' : exp.splitType === 'EXACT' ? '#FEF3C7' : '#E0E7FF',
                        color: exp.splitType === 'PERCENTAGE' ? '#6D28D9' : exp.splitType === 'EXACT' ? '#B45309' : '#3730A3',
                        display: 'inline-block',
                        width: 'fit-content'
                      }}>
                        {exp.splitType || 'EQUAL'}
                      </span>
                      {exp.splits && exp.splits.length > 0 && (
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {exp.splits.length} participants
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {exp.expenseDate}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {formatCurrency(exp.amount)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        className="btn-icon"
                        title="Edit Expense"
                        onClick={() => openEditModal(exp)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete Expense"
                        onClick={() => setExpenseToDelete(exp)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
              <Receipt size={30} />
            </div>
            <h3 className="empty-title">
              {expenses.length === 0 ? 'No expenses recorded yet' : 'No matching expenses'}
            </h3>
            <p className="empty-desc">
              {expenses.length === 0
                ? 'Keep track of all food, travel, and logistics bills for your events.'
                : 'Try adjusting your search criteria or date filter.'}
            </p>
            {expenses.length === 0 && events.length > 0 && users.length > 0 && (
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={16} />
                <span>Record First Expense</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={isEditing ? `Edit Expense #${editingId}` : 'Record New Expense'}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Expense' : 'Save Expense'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Description <span className="req">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.description ? 'error' : ''}`}
              placeholder="e.g. Flight tickets to Mumbai / Team dinner"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) setFormErrors({ ...formErrors, description: null });
              }}
              autoFocus
            />
            {formErrors.description && <div className="form-error">{formErrors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Amount (INR) <span className="req">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className={`form-control ${formErrors.amount ? 'error' : ''}`}
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  if (formErrors.amount) setFormErrors({ ...formErrors, amount: null });
                }}
              />
              {formErrors.amount && <div className="form-error">{formErrors.amount}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Category <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Event <span className="req">*</span>
              </label>
              <select
                className={`form-control ${formErrors.eventId ? 'error' : ''}`}
                value={formData.eventId}
                onChange={(e) => {
                  setFormData({ ...formData, eventId: e.target.value });
                  if (formErrors.eventId) setFormErrors({ ...formErrors, eventId: null });
                }}
              >
                <option value="">-- Choose Event --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.eventName} ({ev.location})
                  </option>
                ))}
              </select>
              {formErrors.eventId && <div className="form-error">{formErrors.eventId}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Paid By <span className="req">*</span>
              </label>
              <select
                className={`form-control ${formErrors.userId ? 'error' : ''}`}
                value={formData.userId}
                onChange={(e) => {
                  setFormData({ ...formData, userId: e.target.value });
                  if (formErrors.userId) setFormErrors({ ...formErrors, userId: null });
                }}
              >
                <option value="">-- Select Member --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {formErrors.userId && <div className="form-error">{formErrors.userId}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Expense Date <span className="req">*</span>
            </label>
            <input
              type="date"
              className={`form-control ${formErrors.expenseDate ? 'error' : ''}`}
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            />
            {formErrors.expenseDate && <div className="form-error">{formErrors.expenseDate}</div>}
          </div>

          {/* Dynamic Split Calculator */}
          {formData.eventId && (
            <SplitCalculator
              members={(() => {
                const selectedEv = events.find((ev) => String(ev.id) === String(formData.eventId));
                return selectedEv?.members && selectedEv.members.length > 0 ? selectedEv.members : users;
              })()}
              totalAmount={formData.amount}
              onChange={(calculated) => setSplitData(calculated)}
            />
          )}
          {splitData.error && (
            <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>
              ⚠️ {splitData.error}
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Expense Confirm */}
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        onClose={() => !isDeleting && setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message={`Are you sure you want to delete expense #${expenseToDelete?.id} "${expenseToDelete?.description}" for ${formatCurrency(expenseToDelete?.amount)}?`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
