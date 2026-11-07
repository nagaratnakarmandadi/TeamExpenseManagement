import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Users as UsersIcon, 
  Receipt, 
  UserPlus, 
  UserMinus, 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  X,
  CreditCard,
  DollarSign,
  Scale,
  ArrowRightLeft,
  History,
  Check,
  Send
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { expenseService } from '../services/expenseService';
import { userService } from '../services/userService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import SplitCalculator from '../components/SplitCalculator';

export default function EventDetails() {
  const { id } = useParams();
  const eventId = Number(id);

  const [event, setEvent] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestedSettlements, setSuggestedSettlements] = useState([]);
  const [settlementsHistory, setSettlementsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('expenses'); // expenses, balances, settle, settlements, members

  // Add Member Modal
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Remove Member Confirm
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // Add Expense Modal with Splits
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
    expenseDate: new Date().toISOString().split('T')[0],
    userId: '',
  });
  const [splitData, setSplitData] = useState({ splitType: 'EQUAL', splits: [], isValid: true, error: null });
  const [expenseFormErrors, setExpenseFormErrors] = useState({});
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Settle Up Modal
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleForm, setSettleForm] = useState({
    payerId: '',
    payeeId: '',
    amount: '',
    paymentMethod: 'UPI',
    transactionRef: '',
    notes: '',
  });
  const [isSubmittingSettle, setIsSubmittingSettle] = useState(false);

  // Notification banners
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const [eventData, expensesData, usersData, balancesData, suggestedData, historyData] = await Promise.all([
        eventService.getEventById(eventId),
        expenseService.getExpensesByEvent(eventId),
        userService.getAllUsers(),
        eventService.getEventBalances(eventId).catch(() => []),
        eventService.getSuggestedSettlements(eventId).catch(() => []),
        eventService.getEventSettlements(eventId).catch(() => []),
      ]);
      setEvent(eventData);
      setExpenses(expensesData || []);
      setAllUsers(usersData || []);
      setBalances(balancesData || []);
      setSuggestedSettlements(suggestedData || []);
      setSettlementsHistory(historyData || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to fetch event details.' });
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

  // Available users to add as members
  const availableUsers = useMemo(() => {
    if (!event || !event.members) return allUsers;
    const memberIds = new Set(event.members.map((m) => m.id));
    return allUsers.filter((u) => !memberIds.has(u.id));
  }, [allUsers, event]);

  const totalEventExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const memberCount = event?.members?.length || 0;
  const costPerMember = memberCount > 0 ? totalEventExpenses / memberCount : 0;

  // Add member handler
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      showFeedback('danger', 'Please select a user to add.');
      return;
    }

    try {
      setIsAddingMember(true);
      await eventService.addMember(eventId, Number(selectedUserId));
      showFeedback('success', 'Team member added to event successfully.');
      setIsAddMemberModalOpen(false);
      setSelectedUserId('');
      await loadEventDetails();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to add member to event.');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Remove member handler
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      setIsRemovingMember(true);
      await eventService.removeMember(eventId, memberToRemove.id);
      showFeedback('success', `Member "${memberToRemove.name}" removed from event.`);
      setMemberToRemove(null);
      await loadEventDetails();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to remove member from event.');
    } finally {
      setIsRemovingMember(false);
    }
  };

  // Add expense handler
  const validateExpenseForm = () => {
    const errors = {};
    if (!newExpense.description.trim()) errors.description = 'Description is required';
    if (!newExpense.amount || Number(newExpense.amount) <= 0) errors.amount = 'Valid amount is required';
    if (!newExpense.category.trim()) errors.category = 'Category is required';
    if (!newExpense.expenseDate) errors.expenseDate = 'Date is required';
    if (!newExpense.userId) errors.userId = 'Please select who paid';
    if (!splitData.isValid) errors.splits = splitData.error || 'Invalid splits configuration';
    setExpenseFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!validateExpenseForm()) return;

    try {
      setIsSubmittingExpense(true);
      await expenseService.createExpense({
        description: newExpense.description.trim(),
        amount: Number(newExpense.amount),
        category: newExpense.category,
        expenseDate: newExpense.expenseDate,
        eventId: eventId,
        userId: Number(newExpense.userId),
        splitType: splitData.splitType,
        splits: splitData.splits,
      });

      showFeedback('success', `Expense "${newExpense.description}" recorded with ${splitData.splitType} split.`);
      setIsAddExpenseModalOpen(false);
      setNewExpense({
        description: '',
        amount: '',
        category: 'Food',
        expenseDate: new Date().toISOString().split('T')[0],
        userId: '',
      });
      setExpenseFormErrors({});
      await loadEventDetails();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to record expense.');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Open Settle modal pre-filled from suggestion
  const handleOpenSettleFromSuggestion = (suggestion) => {
    setSettleForm({
      payerId: String(suggestion.payerId),
      payeeId: String(suggestion.payeeId),
      amount: String(suggestion.amount),
      paymentMethod: 'UPI',
      transactionRef: '',
      notes: `Settlement between ${suggestion.payerName} and ${suggestion.payeeName}`,
    });
    setIsSettleModalOpen(true);
  };

  // Record Settlement handler
  const handleRecordSettlement = async (e) => {
    e.preventDefault();
    if (!settleForm.payerId || !settleForm.payeeId || !settleForm.amount) {
      showFeedback('danger', 'Payer, payee, and settlement amount are required.');
      return;
    }

    try {
      setIsSubmittingSettle(true);
      await eventService.recordSettlement(eventId, {
        eventId: eventId,
        payerId: Number(settleForm.payerId),
        payeeId: Number(settleForm.payeeId),
        amount: Number(settleForm.amount),
        paymentMethod: settleForm.paymentMethod,
        transactionRef: settleForm.transactionRef,
        notes: settleForm.notes,
      });

      showFeedback('success', `Settlement of ${formatCurrency(settleForm.amount)} recorded successfully!`);
      setIsSettleModalOpen(false);
      await loadEventDetails();
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to record settlement.');
    } finally {
      setIsSubmittingSettle(false);
    }
  };

  if (loading) {
    return <Loading message="Loading event information..." />;
  }

  if (!event) {
    return (
      <div className="card">
        <div className="empty-state">
          <AlertCircle size={36} color="var(--danger)" />
          <h3 className="empty-title">Event Not Found</h3>
          <p className="empty-desc">The requested event could not be found on the server.</p>
          <Link to="/events" className="btn btn-primary">Back to Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation & Header */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/events" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Back to All Events</span>
        </Link>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-primary">Event #{event.id}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <MapPin size={15} color="var(--primary)" />
              <span>{event.location}</span>
            </div>
          </div>
          <h1 style={{ marginTop: '8px' }}>{event.eventName}</h1>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSelectedUserId('');
              setIsAddMemberModalOpen(true);
            }}
          >
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => {
              setSettleForm({
                payerId: event.members?.[0]?.id || '',
                payeeId: event.members?.[1]?.id || '',
                amount: '',
                paymentMethod: 'UPI',
                transactionRef: '',
                notes: '',
              });
              setIsSettleModalOpen(true);
            }}
          >
            <ArrowRightLeft size={16} />
            <span>Settle Up</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setExpenseFormErrors({});
              setNewExpense({
                description: '',
                amount: '',
                category: 'Food',
                expenseDate: new Date().toISOString().split('T')[0],
                userId: event.members?.[0]?.id || allUsers?.[0]?.id || '',
              });
              setIsAddExpenseModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Record Expense</span>
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

      {/* Metrics Row */}
      <section className="stat-cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Event Spending</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <Receipt size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value">{formatCurrency(totalEventExpenses)}</div>
            <div className="stat-footer">Across {expenses.length} expense items</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Event Participants</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <UsersIcon size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value">{memberCount}</div>
            <div className="stat-footer">Assigned members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Cost Per Member</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value">{formatCurrency(costPerMember)}</div>
            <div className="stat-footer">Mean average share</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Unsettled Debts</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: suggestedSettlements.length > 0 ? '#FEE2E2' : '#DCFCE7', color: suggestedSettlements.length > 0 ? '#DC2626' : '#16A34A' }}>
              <ArrowRightLeft size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value">{suggestedSettlements.length}</div>
            <div className="stat-footer">{suggestedSettlements.length === 0 ? 'All settled up!' : 'Required settlements'}</div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'expenses' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'expenses' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={16} />
          <span>Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'balances' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'balances' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Scale size={16} />
          <span>Net Balances ({balances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settle')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'settle' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'settle' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowRightLeft size={16} />
          <span>Debt Simplification ({suggestedSettlements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'settlements' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'settlements' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <History size={16} />
          <span>Settlements History ({settlementsHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'members' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'members' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UsersIcon size={16} />
          <span>Members ({memberCount})</span>
        </button>
      </div>

      {/* TAB 1: Expenses */}
      {activeTab === 'expenses' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Event Expenses & Splits</h3>
              <p className="card-subtitle">All recorded spending and participant cost sharing</p>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddExpenseModalOpen(true)}
              style={{ gap: '4px' }}
            >
              <Plus size={14} />
              <span>Record Expense</span>
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {expenses.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Paid By</th>
                      <th>Split Type</th>
                      <th>Participant Breakdown</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{exp.description}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID #{exp.id}</div>
                        </td>
                        <td>
                          <Badge category={exp.category} />
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>
                            {exp.paidBy?.name || 'Unknown'}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: exp.splitType === 'PERCENTAGE' ? '#EDE9FE' : exp.splitType === 'EXACT' ? '#FEF3C7' : '#E0E7FF',
                            color: exp.splitType === 'PERCENTAGE' ? '#6D28D9' : exp.splitType === 'EXACT' ? '#B45309' : '#3730A3',
                          }}>
                            {exp.splitType || 'EQUAL'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '280px' }}>
                            {exp.splits && exp.splits.length > 0 ? (
                              exp.splits.map((s) => (
                                <span
                                  key={s.id}
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#F1F5F9',
                                    color: '#334155',
                                  }}
                                  title={`${s.user?.name}: ₹${s.allocatedAmount} (${s.percentage || ''}%)`}
                                >
                                  {s.user?.name?.split(' ')[0]}: <strong>₹{s.allocatedAmount}</strong>
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>All members</span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {exp.expenseDate}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                          {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Receipt size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <h4 className="empty-title">No expenses recorded for this event</h4>
                <p className="empty-desc">Record lunch bills, travel tickets, or hotel receipts.</p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsAddExpenseModalOpen(true)}
                >
                  Add First Expense
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Net Member Balances */}
      {activeTab === 'balances' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Participant Net Balances</h3>
              <p className="card-subtitle">Real-time breakdown of who paid, who owes, and net position</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadEventDetails}
            >
              Recalculate
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {balances.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th style={{ textAlign: 'right' }}>Total Paid</th>
                      <th style={{ textAlign: 'right' }}>Total Owed</th>
                      <th style={{ textAlign: 'right' }}>Net Balance</th>
                      <th style={{ textAlign: 'center' }}>Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((b) => (
                      <tr key={b.userId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              fontWeight: 700,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {(b.userName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{b.userName}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{b.email}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#16A34A' }}>
                          {formatCurrency(b.totalPaid)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                          {formatCurrency(b.totalOwed)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', color: b.netBalance > 0 ? '#16A34A' : b.netBalance < 0 ? '#DC2626' : 'var(--text-secondary)' }}>
                          {b.netBalance > 0 ? `+${formatCurrency(b.netBalance)}` : formatCurrency(b.netBalance)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: b.status === 'OWED_MONEY' ? '#DCFCE7' : b.status === 'IN_DEBT' ? '#FEE2E2' : '#F1F5F9',
                            color: b.status === 'OWED_MONEY' ? '#16A34A' : b.status === 'IN_DEBT' ? '#DC2626' : '#64748B',
                          }}>
                            {b.status === 'OWED_MONEY' ? 'Owed Money (Credit)' : b.status === 'IN_DEBT' ? 'Owes Money (Debit)' : 'Settled Up'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Scale size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <h4 className="empty-title">No balance data available</h4>
                <p className="empty-desc">Add event members and record expenses to calculate balances.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Debt Simplification & Settle Up */}
      {activeTab === 'settle' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Smart Debt Simplification</h3>
              <p className="card-subtitle">Greedy algorithm minimizing the number of transactions to resolve all debts</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSettleForm({
                  payerId: event.members?.[0]?.id || '',
                  payeeId: event.members?.[1]?.id || '',
                  amount: '',
                  paymentMethod: 'UPI',
                  transactionRef: '',
                  notes: '',
                });
                setIsSettleModalOpen(true);
              }}
            >
              <ArrowRightLeft size={14} />
              <span>Custom Settle Up</span>
            </button>
          </div>
          <div className="card-body">
            {suggestedSettlements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  The following <strong>{suggestedSettlements.length} transaction(s)</strong> will settle all member debts across this event:
                </div>

                {suggestedSettlements.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <ArrowRightLeft size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <strong>{s.payerName}</strong> pays <strong>{s.payeeName}</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Direct payment via UPI, Cash, or Bank Transfer
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatCurrency(s.amount)}
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenSettleFromSuggestion(s)}
                        style={{ gap: '6px' }}
                      >
                        <Check size={14} />
                        <span>Settle Up Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '36px' }}>
                <CheckCircle2 size={40} color="#16A34A" style={{ marginBottom: '12px' }} />
                <h4 className="empty-title" style={{ color: '#16A34A' }}>Everyone is completely settled up!</h4>
                <p className="empty-desc">No outstanding debts exist for this event.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Settlements History */}
      {activeTab === 'settlements' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Settlement History</h3>
              <p className="card-subtitle">Verified payments recorded between team members</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadEventDetails}
            >
              Refresh
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {settlementsHistory.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Settlement ID</th>
                      <th>Payer</th>
                      <th>Payee</th>
                      <th>Method</th>
                      <th>Reference / Notes</th>
                      <th>Settled Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlementsHistory.map((sh) => (
                      <tr key={sh.id}>
                        <td style={{ fontWeight: 600 }}>#{sh.id}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{sh.payer?.name || 'Unknown'}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{sh.payee?.name || 'Unknown'}</span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#E0F2FE',
                            color: '#0284C7',
                          }}>
                            {sh.paymentMethod}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {sh.transactionRef && <div><strong>Ref:</strong> {sh.transactionRef}</div>}
                          {sh.notes && <div>{sh.notes}</div>}
                          {!sh.transactionRef && !sh.notes && '-'}
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {sh.settledAt ? new Date(sh.settledAt).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#16A34A', fontSize: '14px' }}>
                          {formatCurrency(sh.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <History size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <h4 className="empty-title">No settlements recorded yet</h4>
                <p className="empty-desc">When members pay each other back, use the "Settle Up" button to record the payment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Members */}
      {activeTab === 'members' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Event Members</h3>
              <p className="card-subtitle">{memberCount} registered participants in this event</p>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddMemberModalOpen(true)}
              style={{ gap: '4px' }}
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {event.members && event.members.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {event.members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{member.email}</div>
                      </div>
                    </div>

                    <button
                      className="btn-icon danger"
                      title="Remove member from event"
                      onClick={() => setMemberToRemove(member)}
                    >
                      <UserMinus size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <UsersIcon size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>No members added yet</h4>
                <p className="empty-desc" style={{ fontSize: '12px' }}>
                  Assign team members to this event to track who attended.
                </p>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  Add First Member
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => !isAddingMember && setIsAddMemberModalOpen(false)}
        title="Add Member to Event"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddMemberModalOpen(false)}
              disabled={isAddingMember}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddMember}
              disabled={isAddingMember || availableUsers.length === 0}
            >
              {isAddingMember ? 'Adding...' : 'Add Member'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label className="form-label">
              Select Team Member <span className="req">*</span>
            </label>
            {availableUsers.length > 0 ? (
              <select
                className="form-control"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                autoFocus
              >
                <option value="">-- Choose a user --</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px 0' }}>
                All registered users have already been added to this event.
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        isOpen={!!memberToRemove}
        title="Remove Member"
        message={`Are you sure you want to remove "${memberToRemove?.name}" from this event?`}
        confirmLabel="Remove"
        isDanger={true}
        isLoading={isRemovingMember}
        onConfirm={handleRemoveMember}
        onCancel={() => !isRemovingMember && setMemberToRemove(null)}
      />

      {/* Add Expense Modal with SplitCalculator */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => !isSubmittingExpense && setIsAddExpenseModalOpen(false)}
        title={`Record Expense for ${event.eventName}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddExpenseModalOpen(false)}
              disabled={isSubmittingExpense}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateExpense}
              disabled={isSubmittingExpense || !splitData.isValid}
            >
              {isSubmittingExpense ? 'Saving...' : 'Record Expense'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateExpense}>
          <div className="form-group">
            <label className="form-label">
              Description <span className="req">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${expenseFormErrors.description ? 'is-invalid' : ''}`}
              placeholder="e.g., Team Lunch, Flight Tickets"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              autoFocus
            />
            {expenseFormErrors.description && <div className="form-error">{expenseFormErrors.description}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Amount (₹) <span className="req">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className={`form-control ${expenseFormErrors.amount ? 'is-invalid' : ''}`}
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
              {expenseFormErrors.amount && <div className="form-error">{expenseFormErrors.amount}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Category <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="Food">Food & Dining</option>
                <option value="Travel">Travel & Fuel</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Tech">Tech & Subscriptions</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Office">Office Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Expense Date <span className="req">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={newExpense.expenseDate}
                onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Paid By <span className="req">*</span>
              </label>
              <select
                className={`form-control ${expenseFormErrors.userId ? 'is-invalid' : ''}`}
                value={newExpense.userId}
                onChange={(e) => setNewExpense({ ...newExpense, userId: e.target.value })}
              >
                <option value="">-- Who paid? --</option>
                {(event.members && event.members.length > 0 ? event.members : allUsers).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {expenseFormErrors.userId && <div className="form-error">{expenseFormErrors.userId}</div>}
            </div>
          </div>

          {/* Interactive Split Calculator */}
          <SplitCalculator
            members={event.members && event.members.length > 0 ? event.members : allUsers}
            totalAmount={newExpense.amount}
            onChange={(calculated) => setSplitData(calculated)}
          />
          {splitData.error && (
            <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>
              ⚠️ {splitData.error}
            </div>
          )}
        </form>
      </Modal>

      {/* Settle Up Modal */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => !isSubmittingSettle && setIsSettleModalOpen(false)}
        title="Record Debt Settlement"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSettleModalOpen(false)}
              disabled={isSubmittingSettle}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRecordSettlement}
              disabled={isSubmittingSettle}
            >
              {isSubmittingSettle ? 'Recording...' : 'Record Payment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleRecordSettlement}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Payer (Who Paid) <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={settleForm.payerId}
                onChange={(e) => setSettleForm({ ...settleForm, payerId: e.target.value })}
              >
                <option value="">-- Select payer --</option>
                {(event.members && event.members.length > 0 ? event.members : allUsers).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Payee (Who Received) <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={settleForm.payeeId}
                onChange={(e) => setSettleForm({ ...settleForm, payeeId: e.target.value })}
              >
                <option value="">-- Select payee --</option>
                {(event.members && event.members.length > 0 ? event.members : allUsers).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Settled Amount (₹) <span className="req">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="0.00"
                value={settleForm.amount}
                onChange={(e) => setSettleForm({ ...settleForm, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Payment Method <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={settleForm.paymentMethod}
                onChange={(e) => setSettleForm({ ...settleForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="CASH">Cash in Hand</option>
                <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Reference Code (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. UPI-REF-12345678"
              value={settleForm.transactionRef}
              onChange={(e) => setSettleForm({ ...settleForm, transactionRef: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cleared dinner split"
              value={settleForm.notes}
              onChange={(e) => setSettleForm({ ...settleForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
