import axios from 'axios';

const API_URL = 'http://localhost:3001';
export const resolveAssetUrl = (value) => typeof value === 'string' && value.startsWith('/uploads/products/') ? `${API_URL}${value}` : value;
const IS_DEV = import.meta.env.DEV;
const API_DEBUG_URL = 'http://127.0.0.1:7778/event';
const API_DEBUG_SESSION = 'catalog-branch-load';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const API_LOG_STYLE = {
  request: 'background:#0f172a;color:#e2e8f0;padding:2px 8px;border-radius:999px;font-weight:700;',
  success: 'background:#064e3b;color:#d1fae5;padding:2px 8px;border-radius:999px;font-weight:700;',
  warning: 'background:#78350f;color:#fef3c7;padding:2px 8px;border-radius:999px;font-weight:700;',
  error: 'background:#7f1d1d;color:#fecaca;padding:2px 8px;border-radius:999px;font-weight:700;',
  info: 'color:#94a3b8;font-weight:600;',
};

const buildFullUrl = (config = {}) => {
  const baseURL = config.baseURL || API_URL;
  const url = config.url || '';
  return url.startsWith('http') ? url : `${baseURL}${url}`;
};

const getElapsedMs = (config = {}) => {
  const startedAt = config.metadata?.startedAt;
  return startedAt ? `${Date.now() - startedAt}ms` : 'n/a';
};

const getFailureReason = (error) => {
  if (!error.response) {
    return 'Sin respuesta del servidor. Puede ser backend apagado, CORS, puerto incorrecto o caida de red.';
  }

  const { status } = error.response;

  if (status === 304) {
    return '304 = Not Modified. Normalmente no es un error del backend; suele indicar cache del navegador o validacion condicional.';
  }
  if (status === 400) return '400 = Request invalido. Revisar body, params o datos faltantes.';
  if (status === 401) return '401 = No autorizado. Revisar token o sesion vencida.';
  if (status === 403) return '403 = Acceso denegado.';
  if (status === 404) return '404 = Ruta no encontrada o recurso inexistente.';
  if (status === 409) return '409 = Conflicto de estado o datos duplicados.';
  if (status >= 500) return '500+ = Falla interna del backend o base de datos.';

  return `HTTP ${status}. Revisar respuesta del servidor.`;
};

const logApiRequest = (config) => {
  if (!IS_DEV) return;
  const method = String(config.method || 'GET').toUpperCase();
  console.groupCollapsed(
    `%cAPI REQUEST%c ${method} ${config.url}`,
    API_LOG_STYLE.request,
    API_LOG_STYLE.info
  );
  console.log('URL:', buildFullUrl(config));
  console.log('Params:', config.params || null);
  console.log('Body:', config.data || null);
  // #region debug-point A:catalog-request
  if (String(config.url || '').includes('/products')) {
    console.groupCollapsed('[DEBUG][API][A] request summary');
    console.log('method:', method);
    console.log('url:', buildFullUrl(config));
    console.log('headers.Authorization:', config.headers?.Authorization ? 'present' : 'missing');
    console.groupEnd();
    fetch(API_DEBUG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: API_DEBUG_SESSION,
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'client/src/services/api.js',
        msg: '[DEBUG] API request summary',
        data: {
          method,
          url: buildFullUrl(config),
          hasAuthHeader: Boolean(config.headers?.Authorization),
          params: config.params || null,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
  console.groupEnd();
};

const logApiResponse = (response) => {
  if (!IS_DEV) return;
  const method = String(response.config?.method || 'GET').toUpperCase();
  const statusStyle = response.status >= 300 ? API_LOG_STYLE.warning : API_LOG_STYLE.success;
  console.groupCollapsed(
    `%cAPI RESPONSE%c ${response.status} ${method} ${response.config?.url} (${getElapsedMs(response.config)})`,
    statusStyle,
    API_LOG_STYLE.info
  );
  console.log('URL:', buildFullUrl(response.config));
  console.log('Status:', response.status);
  if (response.status === 304) {
    console.warn('Motivo probable:', 'El navegador reutilizo cache. No suele ser una falla del backend.');
  }
  console.log('Data:', response.data);
  // #region debug-point A:catalog-response
  if (String(response.config?.url || '').includes('/products')) {
    const responseData = Array.isArray(response.data) ? response.data : [];
    console.groupCollapsed('[DEBUG][API][A] response summary');
    console.log('url:', buildFullUrl(response.config));
    console.log('status:', response.status);
    console.log('count:', responseData.length);
    console.log('sample:', responseData.slice(0, 3));
    console.groupEnd();
    fetch(API_DEBUG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: API_DEBUG_SESSION,
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'client/src/services/api.js',
        msg: '[DEBUG] API response summary',
        data: {
          url: buildFullUrl(response.config),
          status: response.status,
          count: responseData.length,
          sampleIds: responseData.slice(0, 5).map((item) => item?.id ?? item?.productId ?? null),
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
  console.groupEnd();
};

const logApiError = (error) => {
  if (!IS_DEV) return;
  const config = error.config || {};
  const method = String(config.method || 'GET').toUpperCase();
  const status = error.response?.status || 'NETWORK';
  console.groupCollapsed(
    `%cAPI ERROR%c ${status} ${method} ${config.url || 'url-desconocida'} (${getElapsedMs(config)})`,
    API_LOG_STYLE.error,
    API_LOG_STYLE.info
  );
  console.log('URL:', buildFullUrl(config));
  console.log('Mensaje:', error.message);
  console.warn('Motivo probable:', getFailureReason(error));
  if (error.response) {
    console.log('Status:', error.response.status);
    console.log('Headers:', error.response.headers);
    console.log('Data:', error.response.data);
  } else {
    console.log('Detalle tecnico:', 'No llego respuesta HTTP. Revisar que el backend en :3001 este levantado.');
  }
  // #region debug-point A:catalog-error
  if (String(config.url || '').includes('/products')) {
    console.groupCollapsed('[DEBUG][API][A] error summary');
    console.error('url:', buildFullUrl(config));
    console.error('status:', error.response?.status ?? null);
    console.error('message:', error.message);
    console.groupEnd();
    fetch(API_DEBUG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: API_DEBUG_SESSION,
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'client/src/services/api.js',
        msg: '[DEBUG] API error summary',
        data: {
          url: buildFullUrl(config),
          status: error.response?.status ?? null,
          message: error.message,
          responseData: error.response?.data ?? null,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
  console.groupEnd();
};

// Interceptor para agregar token y trazar peticiones
api.interceptors.request.use((config) => {
  config.metadata = { startedAt: Date.now() };
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  logApiRequest(config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    logApiResponse(response);
    return response;
  },
  (error) => {
    logApiError(error);
    return Promise.reject(error);
  }
);

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

export const deleteBusinessProduct = async (id) => {
  const response = await api.delete(`/businessProducts/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
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

// Reporting
export const getAppEmployees = async (params = {}) => {
  const response = await api.get('/appEmployees', { params });
  return response.data;
};

export const createAppEmployee = async (data) => {
  const response = await api.post('/appEmployees', data);
  return response.data;
};

export const updateAppEmployee = async (id, data) => {
  const response = await api.patch(`/appEmployees/${id}`, data);
  return response.data;
};

export const getBusinessBranches = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}/branches`);
  return response.data;
};

export const createBranch = async (data) => {
  const response = await api.post('/branches', data);
  return response.data;
};

export const getSalesTransactions = async (params = {}) => {
  const response = await api.get('/salesTransactions', { params });
  return response.data;
};

export const getCashMovements = async (params = {}) => {
  const response = await api.get('/cashMovements', { params });
  return response.data;
};

// Cash Register
export const getCashRegisters = async (params = {}) => {
  const response = await api.get('/cash', { params });
  return response.data;
};

export const getCashRegisterStatus = async (params = {}) => {
  const response = await api.get('/cash/status', { params });
  return response.data;
};

export const openCashRegister = async (data) => {
  const response = await api.post('/cash/open', data);
  return response.data;
};

export const closeCashRegister = async (data) => {
  const response = await api.post('/cash/close', data);
  return response.data;
};

// Admin
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getAdminBusinesses = async () => {
  const response = await api.get('/admin/businesses');
  return response.data;
};

export const getAdminEvents = async () => {
  const response = await api.get('/admin/events');
  return response.data;
};

export default api;
