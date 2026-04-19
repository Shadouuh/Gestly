import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.success) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('business', JSON.stringify(response.data.business));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.success) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('business', JSON.stringify(response.data.business));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('business');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getCurrentBusiness = () => {
  const business = localStorage.getItem('business');
  return business ? JSON.parse(business) : null;
};

// Templates
export const getTemplates = async () => {
  const response = await api.get('/templates');
  return response.data;
};

// Products
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Business Products
export const getBusinessProducts = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/products`);
  return response.data;
};

export const updateBusinessProduct = async (id, data) => {
  const response = await api.patch(`/businessProducts/${id}`, data);
  return response.data;
};

export const createBusinessProduct = async (data) => {
  const response = await api.post('/businessProducts', data);
  return response.data;
};

// Businesses
export const getBusiness = async (id) => {
  const response = await api.get(`/businesses/${id}`);
  return response.data;
};

export const updateBusiness = async (id, data) => {
  const response = await api.patch(`/businesses/${id}`, data);
  return response.data;
};

export default api;
