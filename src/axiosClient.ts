import axios from 'axios';

const axiosClient = axios.create({
  //@ts-ignore
  baseURL: import.meta.env.VITE_API_URL,

});

// Request interceptor
axiosClient.interceptors.request.use(
  config => {
    // Get fresh token on each request (in case it was updated elsewhere)
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
      } catch (error) {
        // If token parsing fails, remove invalid token
        // localStorage.removeItem('token');
        console.error('Invalid token format, removing from storage:', error);
      }
    }
    
    // Transform request data from camelCase to snake_case
    // Skip transformation for FormData (already manually converted to snake_case)
    if (config.data && !(config.data instanceof FormData)) {
      config.data =config.data;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  response => {
    // Transform response data from snake_case to camelCase
    if (response.data) {
      response.data = response.data;
    }
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Remove invalid/expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
       if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      
      // Optional: You can also dispatch a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { reason: 'unauthorized' } 
      }));
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;