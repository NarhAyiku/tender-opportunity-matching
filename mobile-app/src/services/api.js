const API_BASE = '/api';

// Get stored token
const getToken = () => localStorage.getItem('tender_token');

// Auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { 'Authorization': `Bearer ${getToken()}` })
});

// Generic fetch wrapper
async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers }
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return res.json();
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

export default { auth, user, feed, swipes, applications };
