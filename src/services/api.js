import axios from 'axios';

const API_BASE_URL = 'http://localhost:8090';




// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('workerId');
      window.location.href = '/';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/wastewise/login', credentials),
  validateToken: () => api.get('/wastewise/validate'),
  resetPassword: (data) => api.post('/wastewise/reset-password', data),
  registerWorker: (data) => api.post('/wastewise/internal/register-worker', data)
};

// Zone API
export const zoneAPI = {
  getAll: (params = {}) => api.get('/wastewise/admin/zones/list', { params }),
  getById: (id) => api.get(`/wastewise/admin/zones/${id}`),
  create: (data) => api.post('/wastewise/admin/zones/create', data),
  update: (id, data) => api.put(`/wastewise/admin/zones/update/${id}`, data),
  delete: (id) => api.delete(`/wastewise/admin/zones/delete/${id}`),
  exists: (id) => api.get(`/wastewise/admin/zones/${id}/exists`),
  getNamesAndIds: () => api.get('/wastewise/admin/zones/namesandids')
};

// Route API
export const routeAPI = {
  getAll: (params = {}) => api.get('/wastewise/admin/routes/list', { params }),
  getById: (id) => api.get(`/wastewise/admin/routes/${id}`),
  create: (data) => api.post('/wastewise/admin/routes/create', data),
  update: (id, data) => api.put(`/wastewise/admin/routes/update/${id}`, data),
  delete: (id) => api.delete(`/wastewise/admin/routes/delete/${id}`),
  getByZone: (zoneId) => api.get(`/wastewise/admin/routes/zone/${zoneId}`)
};

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get('/wastewise/admin/vehicle-management'),
  getById: (id) => api.get(`/wastewise/admin/vehicle-management/${id}`),
  create: (data) => api.post('/wastewise/admin/vehicle-management', data),
  update: (id, data) => api.put(`/wastewise/admin/vehicle-management/${id}`, data),
  delete: (id) => api.delete(`/wastewise/admin/vehicle-management/${id}`),
  getPickupTrucks: () => api.get('/wastewise/admin/vehicle-management/filter/pickuptruck'),
  getRouteTrucks: () => api.get('/wastewise/admin/vehicle-management/filter/routetruck'),
  updateStatus: (id, status) => api.put(`/wastewise/admin/vehicle-management/status/${id}`, status, {
    headers: { 'Content-Type': 'text/plain' }
  }),
  exists: (id) => api.get(`/wastewise/admin/vehicle-management/internal/exists?id=${id}`)
};

// Worker API
export const workerAPI = {
  getAll: () => api.get('/wastewise/admin/workers'),
  getById: (id) => api.get(`/wastewise/admin/workers/${id}`),
  create: (data) => api.post('/wastewise/admin/workers', data),
  update: (id, data) => api.put(`/wastewise/admin/workers/${id}`, data),
  delete: (id) => api.delete(`/wastewise/admin/workers/${id}`),
  getIds: () => api.get('/wastewise/admin/workers/ids'),
  getAvailable: () => api.get('/wastewise/admin/workers/ids/available'),
  updateStatus: (workerId, status) => api.patch(`/wastewise/admin/workers/status/${workerId}`, status, {
    headers: { 'Content-Type': 'text/plain' }
  }),
  exists: (workerId) => api.get(`/wastewise/admin/workers/internal/exists?workerId=${workerId}`)
};

// Worker Assignment API
export const workerAssignmentAPI = {
  getAll: () => api.get('/wastewise/admin/worker-assignments'),
  getByWorkerId: (workerId) => api.get(`/wastewise/admin/worker-assignments/${workerId}`),
  assign: (assignmentId, data) => api.post(`/wastewise/admin/worker-assignments/${assignmentId}`, data),
  updateSingle: (assignmentId, data) => api.put(`/wastewise/admin/worker-assignments/update/${assignmentId}`, data),
  reassignBoth: (assignmentId, data) => api.put(`/wastewise/admin/worker-assignments/reassign/${assignmentId}`, data),
  delete: (assignmentId) => api.delete(`/wastewise/admin/worker-assignments/${assignmentId}`)
};

// Assignment API
export const assignmentAPI = {
  getAll: () => api.get('/wastewise/admin/assignments'),
  getById: (id) => api.get(`/wastewise/admin/assignments/${id}`),
  create: (data) => api.post('/wastewise/admin/assignments', data),
  update: (id, data) => api.put(`/wastewise/admin/assignments/${id}`, data),
  delete: (id) => api.delete(`/wastewise/admin/assignments/${id}`),
  getByRoute: (routeId) => api.get(`/wastewise/admin/assignments/route/${routeId}`)
};

// Pickup API
export const pickupAPI = {
  getAll: () => api.get('/wastewise/scheduler/pickups'),
  getById: (id) => api.get(`/wastewise/scheduler/pickups/${id}`),
  create: (data) => api.post('/wastewise/scheduler/pickups', data),
  update: (id, data) => api.put(`/wastewise/scheduler/pickups/update/${id}`, data),
  delete: (id) => api.delete(`/wastewise/scheduler/pickups/${id}`)
};

// Waste Logs API
export const wasteLogsAPI = {
  startCollection: (data) => api.post('/wastewise/admin/wastelogs/start', data),
  endCollection: (data) => api.put('/wastewise/admin/wastelogs/end', data),
  getZoneReport: (params) => api.get('/wastewise/admin/wastelogs/reports/zone', { params }),
  getVehicleReport: (params) => api.get('/wastewise/admin/wastelogs/reports/vehicle', { params }),
  getRecentLogs: (params = {}) => api.get('/wastewise/admin/wastelogs/reports/recentLogs', { params }),
  getWeeklyCollections: () => api.get('/wastewise/admin/wastelogs/reports/totalCollections/weekly'),
  getMonthlyCollections: () => api.get('/wastewise/admin/wastelogs/reports/totalCollections/monthly'),
  getWeeklyWeight: () => api.get('/wastewise/admin/wastelogs/reports/totalWeight/weekly')
};

export default api;

