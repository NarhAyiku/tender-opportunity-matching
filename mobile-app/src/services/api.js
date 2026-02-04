import { logApiError, logNetworkError } from './errorLogger';

const API_BASE = '/api';

// Get stored token
const getToken = () => localStorage.getItem('tender_token');

// Auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { 'Authorization': `Bearer ${getToken()}` })
});

// Generic fetch wrapper with error logging
async function request(endpoint, options = {}) {
  const method = options.method || 'GET';

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...authHeaders(), ...options.headers }
    });

    if (!res.ok) {
      const statusText = `${res.status} ${res.statusText}`;
      const error = await res.json().catch(() => ({ detail: statusText }));
      const detail = error.detail || statusText;
      const err = new Error(detail);
      err.status = res.status;
      err.endpoint = endpoint;

      // Log API error
      logApiError(err, endpoint, method);

      throw err;
    }

    return res.json();
  } catch (err) {
    // Check if it's a network error
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      logNetworkError(err);
      const networkErr = new Error('Network error. Please check your connection.');
      networkErr.status = 0;
      networkErr.isNetworkError = true;
      throw networkErr;
    }

    // Re-throw if already logged
    if (err.endpoint) throw err;

    // Log unknown errors
    logApiError(err, endpoint, method);
    throw err;
  }
}

// Auth
export const auth = {
  signup: (data) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  login: (email, password) => request('/auth/login/json', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  me: () => request('/auth/me'),

  setToken: (token) => localStorage.setItem('tender_token', token),
  clearToken: () => localStorage.removeItem('tender_token'),
  hasToken: () => !!getToken()
};

// User
export const user = {
  getMe: () => request('/users/me'),
  updateMe: (data) => request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// Feed & Matching
export const feed = {
  getFeed: (limit = 10) => request(`/match/feed?limit=${limit}`),
};

// Swipes
export const swipes = {
  create: (opportunity_id, action) => request('/swipes', {
    method: 'POST',
    body: JSON.stringify({ opportunity_id, action })
  }),
  getLiked: () => request('/swipes/liked'),
  getSaved: () => request('/swipes/saved'),
  getHistory: () => request('/swipes'),
  getPending: () => request('/swipes/pending'),
  getLimits: () => request('/swipes/limits'),
  approve: (swipeId) => request(`/swipes/${swipeId}/approve`, {
    method: 'POST'
  }),
  edit: (swipeId, editedData) => request(`/swipes/${swipeId}/edit`, {
    method: 'POST',
    body: JSON.stringify({ edited_data: editedData })
  }),
  reject: (swipeId) => request(`/swipes/${swipeId}/reject`, {
    method: 'POST'
  })
};

// Applications
export const applications = {
  getAll: () => request('/applications'),
  getOne: (id) => request(`/applications/${id}`)
};

// Preferences
export const preferences = {
  get: () => request('/preferences/me'),
  update: (data) => request('/preferences/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  create: (data) => request('/preferences/me', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export default { auth, user, feed, swipes, applications, preferences };
