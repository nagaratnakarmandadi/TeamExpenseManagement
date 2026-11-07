import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Receipt, 
  TrendingUp, 
  ArrowUpRight, 
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
import { userService } from '../services/userService';
import { eventService } from '../services/eventService';
import { expenseService } from '../services/expenseService';

const CATEGORY_COLORS = ['#5146D8', '#16A36A', '#F0A43A', '#DC4C4C', '#0EA5E9', '#8B5CF6', '#EC4899'];

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, eventsData, expensesData] = await Promise.all([
        userService.getAllUsers(),
        eventService.getAllEvents(),
        expenseService.getAllExpenses(),
      ]);

      setUsers(usersData || []);
      setEvents(eventsData || []);
      setExpenses(expensesData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations derived directly from real backend data
  const totalUsers = users.length;
  const totalEvents = events.length;
  const totalExpensesAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const averageExpense = useMemo(() => {
    if (expenses.length === 0) return 0;
    return totalExpensesAmount / expenses.length;
  }, [expenses, totalExpensesAmount]);

  // Format currency in INR
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Monthly Expense Trend
  const monthlyTrendData = useMemo(() => {
    const monthMap = {};
    expenses.forEach((item) => {
      if (!item.expenseDate) return;
      const date = new Date(item.expenseDate);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthMap[key] = (monthMap[key] || 0) + Number(item.amount);
    });

    const result = Object.keys(monthMap).map((m) => ({
      month: m,
      total: monthMap[m],
    }));

    // If empty or single, provide at least the current month
    if (result.length === 0) {
      const cur = new Date().toLocaleString('default', { month: 'short', year: '2-digit' });
      return [{ month: cur, total: 0 }];
    }
    return result;
  }, [expenses]);

  // Category Breakdown Data
  const categoryData = useMemo(() => {
    const catMap = {};
    expenses.forEach((item) => {
      const cat = item.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + Number(item.amount);
    });

    return Object.keys(catMap).map((name) => ({
      name,
      value: catMap[name],
    }));
  }, [expenses]);

  // Event-wise Spending Data
  const eventSpendingData = useMemo(() => {
    const eventMap = {};
    expenses.forEach((item) => {
      const eName = item.event?.eventName || `Event #${item.event?.id || 'Unknown'}`;
      eventMap[eName] = (eventMap[eName] || 0) + Number(item.amount);
    });

    // Also include events with 0 expenses
    events.forEach((ev) => {
      if (!eventMap[ev.eventName]) {
        eventMap[ev.eventName] = 0;
      }
    });

    return Object.keys(eventMap).slice(0, 7).map((name) => ({
      name: name.length > 14 ? name.substring(0, 12) + '...' : name,
      fullTitle: name,
      amount: eventMap[name],
    }));
  }, [expenses, events]);

  // Recent 5 expenses
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.expenseDate || 0) - new Date(a.expenseDate || 0) || b.id - a.id)
      .slice(0, 5);
  }, [expenses]);

  if (loading) {
    return <Loading message="Loading dashboard metrics..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Enterprise Dashboard</h1>
          <p>Real-time overview of your organization's team expenses and events</p>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={fetchDashboardData}
            title="Refresh data from database"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <div>
              <strong>Backend Connection Alert:</strong> {error}
            </div>
          </div>
          {(error.includes('unauthorized') || error.includes('Session expired') || error.includes('sign in')) && (
            <button
              onClick={() => { window.location.hash = '#/login'; }}
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 'auto' }}
            >
              Sign In Now
            </button>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <section className="stat-cards-grid">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtitle="Registered team members"
          icon={Users}
          color="var(--primary)"
          bgColor="var(--primary-light)"
        />

        <StatCard
          title="Total Events"
          value={totalEvents}
          subtitle="Active & planned events"
          icon={Calendar}
          color="#0284C7"
          bgColor="#E0F2FE"
        />

        <StatCard
          title="Total Spending"
          value={formatCurrency(totalExpensesAmount)}
          subtitle={`${expenses.length} recorded transactions`}
          icon={Receipt}
          color="var(--success)"
          bgColor="var(--success-bg)"
        />

        <StatCard
          title="Average Expense"
          value={formatCurrency(averageExpense)}
          subtitle="Mean per transaction"
          icon={TrendingUp}
          color="#D97706"
          bgColor="#FEF3C7"
        />
      </section>

      {/* Charts Section */}
      <div className="charts-grid-3">
        {/* Monthly Expense Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Spending Trend</h3>
              <p className="card-subtitle">Monthly expenditure overview</p>
            </div>
            <span className="badge badge-primary">Real-time</span>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    formatter={(val) => [formatCurrency(val), 'Spending']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#FFF', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#spendingGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p className="empty-desc">No expense records available for trend.</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Categories</h3>
              <p className="card-subtitle">Spending by category</p>
            </div>
          </div>
          <div className="card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Amount']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p className="empty-desc">No categorized expenses recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Event-wise Expenses & Recent Activity */}
      <div className="charts-grid-2">
        {/* Event-wise Expenses Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Event-wise Spending</h3>
              <p className="card-subtitle">Total costs incurred per event</p>
            </div>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            {eventSpendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventSpendingData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    formatter={(val) => [formatCurrency(val), 'Total Incurred']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
                  />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p className="empty-desc">No events created yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Expenses</h3>
              <p className="card-subtitle">Latest recorded team costs</p>
            </div>
            <Link to="/expenses" className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
              <span>Manage</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentExpenses.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Event</th>
                      <th>Paid By</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{exp.description}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{exp.expenseDate}</div>
                        </td>
                        <td>
                          <Badge category={exp.category} />
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          {exp.event?.eventName || '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {(exp.paidBy?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '13px' }}>{exp.paidBy?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Receipt size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
                <h4 className="empty-title">No expenses yet</h4>
                <p className="empty-desc">Start adding expenses to see real-time updates.</p>
                <Link to="/expenses" className="btn btn-primary btn-sm">Add First Expense</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
