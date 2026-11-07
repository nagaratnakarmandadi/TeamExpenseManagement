import api from './api';

export const userService = {
  // GET /api/users/getUsersList
  getAllUsers: async () => {
    const response = await api.get('/api/users/getUsersList');
    return response.data;
  },

  // GET /api/users/getUser/{id}
  getUserById: async (id) => {
    const response = await api.get(`/api/users/getUser/${id}`);
    return response.data;
  },

  // POST /api/users/createUser
  // Body: { name, email }
  createUser: async (userData) => {
    const response = await api.post('/api/users/createUser', userData);
    return response.data;
  },

  // DELETE /api/users/deleteUser/{id}
  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/deleteUser/${id}`);
    return response.data;
  },
};
