import api from './api';

export const expenseService = {
  // GET /api/expenses
  getAllExpenses: async () => {
    const response = await api.get('/api/expenses');
    return response.data;
  },

  // GET /api/expenses/{id}
  getExpenseById: async (id) => {
    const response = await api.get(`/api/expenses/${id}`);
    return response.data;
  },

  // GET /api/expenses/event/{eventId}
  getExpensesByEvent: async (eventId) => {
    const response = await api.get(`/api/expenses/event/${eventId}`);
    return response.data;
  },

  // POST /api/expenses
  // Body: { description, amount, category, expenseDate, eventId, userId }
  createExpense: async (expenseData) => {
    const response = await api.post('/api/expenses', expenseData);
    return response.data;
  },

  // PUT /api/expenses/{id}
  // Body: { description, amount, category, expenseDate, eventId, userId }
  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/api/expenses/${id}`, expenseData);
    return response.data;
  },

  // DELETE /api/expenses/{id}
  deleteExpense: async (id) => {
    const response = await api.delete(`/api/expenses/${id}`);
    return response.data;
  },
};
