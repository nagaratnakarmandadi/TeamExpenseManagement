import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  PieChart as PieIcon, 
  Award, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

import { expenseService } from '../services/expenseService';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import Loading from '../components/Loading';
import Badge from '../components/Badge';

const COLORS = ['#5146D8', '#16A36A', '#F0A43A', '#DC4C4C', '#0EA5E9', '#8B5CF6', '#EC4899', '#64748B'];

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time Filter: 'all', 'last30', 'thisYear'
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [expensesData, eventsData, usersData] = await Promise.all([
        expenseService.getAllExpenses(),
        eventService.getAllEvents(),
        userService.getAllUsers(),
      ]);
      setExpenses(expensesData || []);
      setEvents(eventsData || []);
      setUsers(usersData || []);
    } catch (err) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  // Filter expenses according to timeFilter
  const filteredExpenses = useMemo(() => {
    if (timeFilter === 'all') return expenses;
    const now = new Date();

    if (timeFilter === 'last30') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      return expenses.filter((e) => e.expenseDate && new Date(e.expenseDate) >= past30);
    }

    if (timeFilter === 'thisYear') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return expenses.filter((e) => e.expenseDate && new Date(e.expenseDate) >= startOfYear);
    }

    return expenses;
  }, [expenses, timeFilter]);

  // Total Spending
  const totalSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  // Highest Single Expense
  const maxExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    return filteredExpenses.reduce((prev, current) =>
      Number(current.amount) > Number(prev.amount) ? current : prev
    );
  }, [filteredExpenses]);

  // Event Spending Breakdown
  const eventBreakdown = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      const name = item.event?.eventName || `Event #${item.event?.id || '?'}`;
      map[name] = (map[name] || 0) + Number(item.amount);
    });
    return Object.keys(map).map((name) => ({
      name,
      amount: map[name],
      percentage: totalSpend > 0 ? ((map[name] / totalSpend) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, totalSpend]);

  // Top spending event
  const topEvent = eventBreakdown[0] || null;

  // Member Contribution Breakdown (Who paid how much)
  const payerBreakdown = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      const name = item.paidBy?.name || 'Unknown Member';
      map[name] = (map[name] || 0) + Number(item.amount);
    });
    return Object.keys(map).map((name) => ({
      name,
      amount: map[name],
      percentage: totalSpend > 0 ? ((map[name] / totalSpend) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, totalSpend]);

  const topPayer = payerBreakdown[0] || null;

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      const cat = item.category || 'Other';
      map[cat] = (map[cat] || 0) + Number(item.amount);
    });
    return Object.keys(map).map((name) => ({
      name,
      value: map[name],
      percentage: totalSpend > 0 ? ((map[name] / totalSpend) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, totalSpend]);

  // Monthly Spending Trend
  const monthlyTrend = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      if (!item.expenseDate) return;
      const date = new Date(item.expenseDate);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + Number(item.amount);
    });
    return Object.keys(map).map((month) => ({
      month,
      amount: map[month],
    }));
  }, [filteredExpenses]);

  // CSV Export utility
  const exportToCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ['ID', 'Description', 'Amount', 'Category', 'Date', 'Event', 'Paid By'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.amount,
      e.category,
      e.expenseDate,
      `"${(e.event?.eventName || '').replace(/"/g, '""')}"`,
      `"${(e.paidBy?.name || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `team_expenses_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loading message="Generating financial reports..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Financial Reports & Analytics</h1>
          <p>Auditable analytics, category breakdowns, and team expense reconciliations</p>
        </div>

        <div className="page-actions">
          {/* Time Filter Buttons */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setTimeFilter('all')}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: timeFilter === 'all' ? 'var(--primary)' : '#FFFFFF',
                color: timeFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('last30')}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: timeFilter === 'last30' ? 'var(--primary)' : '#FFFFFF',
                color: timeFilter === 'last30' ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeFilter('thisYear')}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: timeFilter === 'thisYear' ? 'var(--primary)' : '#FFFFFF',
                color: timeFilter === 'thisYear' ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              This Year
            </button>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={exportToCSV}
            disabled={filteredExpenses.length === 0}
            style={{ gap: '6px' }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* KPI Cards */}
      <section className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Spending</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Receipt size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value">{formatCurrency(totalSpend)}</div>
            <div className="stat-footer">{filteredExpenses.length} transactions in period</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Top Spending Event</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
              <Calendar size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '20px' }}>
              {topEvent ? topEvent.name : '—'}
            </div>
            <div className="stat-footer">
              {topEvent ? `${formatCurrency(topEvent.amount)} (${topEvent.percentage}%)` : 'No events'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Top Contributing Member</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Award size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '20px' }}>
              {topPayer ? topPayer.name : '—'}
            </div>
            <div className="stat-footer">
              {topPayer ? `${formatCurrency(topPayer.amount)} covered` : 'No contributors'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Largest Single Expense</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '20px' }}>
              {maxExpense ? formatCurrency(maxExpense.amount) : '—'}
            </div>
            <div className="stat-footer">
              {maxExpense ? maxExpense.description : 'No records'}
            </div>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <div className="charts-grid-2">
        {/* Spending by Category Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Distribution</h3>
              <p className="card-subtitle">Spending breakdown by category</p>
            </div>
          </div>
          <div className="card-body" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Spent']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p className="empty-desc">No expense records in this range.</p>
              </div>
            )}
          </div>
        </div>

        {/* Event Cost Comparison Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Event Cost Comparison</h3>
              <p className="card-subtitle">Expenditure per event</p>
            </div>
          </div>
          <div className="card-body" style={{ height: '320px' }}>
            {eventBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventBreakdown} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Event Cost']} />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p className="empty-desc">No events with expenses in this range.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Reimbursement & Payment Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Member Payment Breakdown</h3>
            <p className="card-subtitle">Summary of who settled expenses on behalf of the team</p>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {payerBreakdown.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Total Outlay</th>
                    <th>Share of Total Budget</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payerBreakdown.map((item, idx) => (
                    <tr key={item.name}>
                      <td>
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
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Contributor #{idx + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(item.amount)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
                          <div style={{
                            flex: 1,
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: '#E2E8F0',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${item.percentage}%`,
                              height: '100%',
                              backgroundColor: 'var(--primary)',
                              borderRadius: '4px',
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', width: '42px' }}>
                            {item.percentage}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-success">Reconciled</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-desc">No payer records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
