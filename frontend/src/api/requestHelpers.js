import apiClient from './apiClient';

// GET
export const get = async (url, config = {}) => {
  return apiClient.get(url, config);
};

// POST
export const post = async (url, data, config = {}) => {
  return apiClient.post(url, data, config);
};

// PUT
export const put = async (url, data, config = {}) => {
  return apiClient.put(url, data, config);
};

// PATCH
export const patch = async (url, data, config = {}) => {
  return apiClient.patch(url, data, config);
};

// DELETE
export const del = async (url, config = {}) => {
  return apiClient.delete(url, config);
};

// POST with FormData (file uploads, profile photos, etc.)
export const postForm = async (url, formData, config = {}) => {
  return apiClient.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};