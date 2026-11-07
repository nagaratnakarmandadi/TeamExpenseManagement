import api from './api';

export const eventService = {
  // GET /api/v1/events
  getAllEvents: async () => {
    const response = await api.get('/api/v1/events');
    return response.data;
  },

  // GET /api/v1/events/{id}
  getEventById: async (id) => {
    const response = await api.get(`/api/v1/events/${id}`);
    return response.data;
  },

  // POST /api/v1/events
  // Body: { eventName, location }
  createEvent: async (eventData) => {
    const response = await api.post('/api/v1/events', eventData);
    return response.data;
  },

  // POST /api/v1/events/{eventId}/members/{userId}
  addMember: async (eventId, userId) => {
    const response = await api.post(`/api/v1/events/${eventId}/members/${userId}`);
    return response.data;
  },

  // DELETE /api/v1/events/{eventId}/members/{userId}
  removeMember: async (eventId, userId) => {
    const response = await api.delete(`/api/v1/events/${eventId}/members/${userId}`);
    return response.data;
  },

  // GET /api/v1/events/{eventId}/balances
  getEventBalances: async (eventId) => {
    const response = await api.get(`/api/v1/events/${eventId}/balances`);
    return response.data;
  },

  // GET /api/v1/events/{eventId}/settlements
  getEventSettlements: async (eventId) => {
    const response = await api.get(`/api/v1/events/${eventId}/settlements`);
    return response.data;
  },

  // POST /api/v1/events/{eventId}/settlements
  recordSettlement: async (eventId, settlementData) => {
    const response = await api.post(`/api/v1/events/${eventId}/settlements`, settlementData);
    return response.data;
  },

  // GET /api/v1/events/{eventId}/suggested-settlements
  getSuggestedSettlements: async (eventId) => {
    const response = await api.get(`/api/v1/events/${eventId}/suggested-settlements`);
    return response.data;
  },
};
