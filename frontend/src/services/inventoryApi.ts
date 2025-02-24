import axios, { AxiosInstance } from 'axios';
import { InventorySession, InventoryCount, Product } from '../types/inventory';

// Configure base URL with proper protocol
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const baseURL = API_URL.startsWith('http') ? API_URL : `https://${API_URL}`;

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: baseURL.replace(/\/+$/, ''),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for logging and authentication
api.interceptors.request.use(
    config => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export const inventoryApi = {
    startSession: async (salesLevel: number): Promise<InventorySession> => {
        try {
            const response = await api.post<InventorySession>('/api/inventory/session', {
                salesLevel
            });
            return response.data;
        } catch (error) {
            console.error('Failed to start session:', error);
            throw error;
        }
    },

    getProducts: async (): Promise<Product[]> => {
        try {
            const response = await api.get<Product[]>('/api/products');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch products:', error);
            throw error;
        }
    },

    recordCount: async (
        sessionId: string,
        productCode: string,
        quantity: number
    ): Promise<InventoryCount> => {
        try {
            const response = await api.post<InventoryCount>('/api/inventory/count', {
                sessionId,
                productCode,
                quantity
            });
            return response.data;
        } catch (error) {
            console.error('Failed to record count:', error);
            throw error;
        }
    },

    getOrderSummary: async (sessionId: string): Promise<any> => {
        try {
            const response = await api.get(`/api/inventory/orders/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch order summary:', error);
            throw error;
        }
    }
};

export { api };