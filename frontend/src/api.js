import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: (filters) => api.get('/bookings', { params: filters }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status, updatedBy, updatedByType, cancellationReason) =>
    api.patch(`/bookings/${id}/status`, { status, updatedBy, updatedByType, cancellationReason }),
  accept: (id, providerId) => api.post(`/bookings/${id}/accept`, { providerId }),
  reject: (id, providerId) => api.post(`/bookings/${id}/reject`, { providerId }),
  cancel: (id, cancelledBy, cancelledByType, reason) =>
    api.post(`/bookings/${id}/cancel`, { cancelledBy, cancelledByType, reason }),
  getEvents: (id) => api.get(`/bookings/${id}/events`)
};

export const providerAPI = {
  getAll: (filters) => api.get('/providers', { params: filters }),
  getBookings: (id) => api.get(`/providers/${id}/bookings`),
  updateAvailability: (id, isAvailable) =>
    api.patch(`/providers/${id}/availability`, { isAvailable })
};

export const adminAPI = {
  getEvents: (filters) => api.get('/admin/events', { params: filters }),
  assignProvider: (bookingId, providerId) =>
    api.post(`/admin/bookings/${bookingId}/assign`, { providerId }),
  overrideStatus: (bookingId, status, reason) =>
    api.post(`/admin/bookings/${bookingId}/override-status`, { status, reason })
};
