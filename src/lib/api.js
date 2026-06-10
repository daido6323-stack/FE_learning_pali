/**
 * Centralized API base URL config.
 * In development: empty string → Vite proxy handles it (localhost:8081)
 * In production (Vercel): VITE_API_BASE_URL=https://api.uydev.io.vn
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Helper wrapper around fetch that prepends API_BASE automatically.
 * Usage: apiFetch('/api/units') or apiFetch('/api/questions', { method: 'POST', ... })
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  
  const headers = { ...options.headers };

  // Inject x-admin-key header if it exists in session
  const adminKey = sessionStorage.getItem('pali_admin_key');
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }

  // Inject JWT Bearer token if it exists in localStorage
  const token = localStorage.getItem('pali_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers
  });
}
