const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ngl_token');
  }
  return null;
};

const buildHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  if (res.status === 401 && typeof window !== 'undefined') {
    clearToken();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data;
};

export const api = {
  get: async (path: string, auth = true) => {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
      headers: buildHeaders(auth),
    });
    return handleResponse(res);
  },

  post: async (path: string, body: unknown, auth = true) => {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (path: string, body: unknown, auth = true) => {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}${path}`, {
      method: 'PUT',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ngl_token', token);
  }
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ngl_token');
  }
};
