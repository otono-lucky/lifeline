export const getToken = () => localStorage.getItem('token') ?? null;

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  // Optional: clear user data too
};