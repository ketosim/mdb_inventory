//src/services/inventoryApi.ts
import axios from 'axios';
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

// Optional: Add request/response interceptors for better error handling
axios.interceptors.request.use(
  config => {
    console.log(`Making request to: ${config.url}`);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);
export const inventoryApi = {
    // Start a new counting session
    startSession: (salesLevel: number) => 
        axios.post(`${API_URL}/api/inventory/session`, { salesLevel }), // Include `/api/` here

    // Get product list
    getProducts: () => 
        axios.get(`${API_URL}/api/products`),

    // Record a count
    recordCount: (sessionId: string, productCode: string, quantity: number) =>
        axios.post(`${API_URL}/api/inventory/count`, { sessionId, productCode, quantity }),

    getOrderSummary: (sessionId: string) => 
        axios.get(`${API_URL}/api/inventory/orders/${sessionId}`)
};
