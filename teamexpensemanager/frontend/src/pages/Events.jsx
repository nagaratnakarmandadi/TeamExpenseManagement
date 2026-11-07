import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users as UsersIcon, 
  Receipt, 
  Plus, 
  Search, 
  ArrowRight, 
  LayoutGrid, 
  List, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { expenseService } from '../services/expenseService';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Create Event Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ eventName: '', location: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification banners
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, expensesData] = await Promise.all([
        eventService.getAllEvents(),
        expenseService.getAllExpenses(),
      ]);
      setEvents(eventsData || []);
      setExpenses(expensesData || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to fetch events from server' });
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Map expenses to event IDs
  const eventExpenseMap = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      const eId = item.event?.id;
      if (eId) {
        map[eId] = (map[eId] || 0) + Number(item.amount);
      }
    });
    return map;
  }, [expenses]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const validateForm = () => {
    const errors = {};
    if (!newEvent.eventName.trim()) errors.eventName = 'Event name is required';
    if (!newEvent.location.trim()) errors.location = 'Location is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await eventService.createEvent({
        eventName: newEvent.eventName.trim(),
        location: newEvent.location.trim(),
      });
      showFeedback('success', `Event "${newEvent.eventName}" created successfully.`);
      setIsCreateModalOpen(false);
      setNewEvent({ eventName: '', location: '' });
      setFormErrors({});
      await loadData();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;
    const term = searchTerm.toLowerCase();
    return events.filter(
      (ev) =>
        ev.eventName?.toLowerCase().includes(term) ||
        ev.location?.toLowerCase().includes(term) ||
        String(ev.id).includes(term)
    );
  }, [events, searchTerm]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Event Management</h1>
          <p>Organize corporate events, assign participants, and monitor event budgets</p>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormErrors({});
              setNewEvent({ eventName: '', location: '' });
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

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

      {/* Filter & View Switcher */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredEvents.length}</strong> events
          </div>

          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '7px 12px',
                backgroundColor: viewMode === 'grid' ? 'var(--primary-light)' : '#FFFFFF',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '7px 12px',
                backgroundColor: viewMode === 'table' ? 'var(--primary-light)' : '#FFFFFF',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <Loading message="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={30} />
            </div>
            <h3 className="empty-title">
              {searchTerm ? 'No matching events found' : 'No events created yet'}
            </h3>
            <p className="empty-desc">
              {searchTerm
                ? 'Try searching with a different name or location.'
                : 'Create your first team event to track participants and expenses.'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} />
                <span>Create Event</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {filteredEvents.map((ev) => {
            const memberCount = ev.members?.length || 0;
            const totalSpent = eventExpenseMap[ev.id] || 0;
            return (
              <div 
                key={ev.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <span className="badge badge-primary">
                      Event #{ev.id}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <MapPin size={14} color="var(--primary)" />
                      <span>{ev.location}</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {ev.eventName}
                  </h3>

                  <div style={{
                    marginTop: '20px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#F8FAFC',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Members
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <UsersIcon size={15} color="var(--primary)" />
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>{memberCount}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Total Spent
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>
                          {formatCurrency(totalSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '14px 24px',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}>
                  <Link
                    to={`/events/${ev.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px', width: '100%', justifyContent: 'center' }}
                  >
                    <span>View Event Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Event Name</th>
                <th>Location</th>
                <th>Participants</th>
                <th>Total Incurred</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{ev.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.eventName}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <MapPin size={14} />
                      <span>{ev.location}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UsersIcon size={14} color="var(--primary)" />
                      <span>{ev.members?.length || 0} members</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {formatCurrency(eventExpenseMap[ev.id] || 0)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/events/${ev.id}`} className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
                      <span>Details</span>
                      <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Schedule New Event"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateEvent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">
              Event Name <span className="req">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.eventName ? 'error' : ''}`}
              placeholder="e.g. Annual Company Retreat / Q4 Sprint Planning"
              value={newEvent.eventName}
              onChange={(e) => {
                setNewEvent({ ...newEvent, eventName: e.target.value });
                if (formErrors.eventName) setFormErrors({ ...formErrors, eventName: null });
              }}
              autoFocus
            />
            {formErrors.eventName && <div className="form-error">{formErrors.eventName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Location / Venue <span className="req">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.location ? 'error' : ''}`}
              placeholder="e.g. Hyderabad / Goa / Conference Room A"
              value={newEvent.location}
              onChange={(e) => {
                setNewEvent({ ...newEvent, location: e.target.value });
                if (formErrors.location) setFormErrors({ ...formErrors, location: null });
              }}
            />
            {formErrors.location && <div className="form-error">{formErrors.location}</div>}
          </div>
        </form>
      </Modal>
    </div>
  );
}
