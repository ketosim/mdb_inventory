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
            const response = await api.post<{sessionId: string}>('/api/inventory/session', {
                salesLevel
            });

            if (!response.data?.sessionId) {
                throw new Error('Invalid session response format');
            }

            return {
                sessionId: response.data.sessionId,
                salesLevel,
                status: 'in_progress',
                createdAt: new Date()
            };
        } catch (error) {
            console.error('Failed to start session:', error);
            throw error;
        }
    },

    getProducts: async (): Promise<Product[]> => {
        try {
            const response = await api.get<Product[]>('/api/products');
            console.log('Products response:', response.data); // Debug log
            
            if (!Array.isArray(response.data)) {
                throw new Error('Invalid products response format - expected array');
            }

            // Map the response to match the Product interface
            return response.data.map(product => ({
                code: product.code,
                description: product.description,
                walkUnit: product.walkUnit,
                packSize: product.packSize,
                baseWeeklyUsage: product.baseWeeklyUsage
            }));
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

            if (!response.data || !response.data.productCode) {
                throw new Error('Invalid count response format');
            }

            return {
                productCode: response.data.productCode,
                quantity: response.data.quantity
            };
        } catch (error) {
            console.error('Failed to record count:', error);
            throw error;
        }
    },

    getOrderSummary: async (sessionId: string): Promise<any> => {
        try {
            const response = await api.get(`/api/inventory/orders/${sessionId}`);
            if (!response.data) {
                throw new Error('No order summary data received');
            }
            return response.data;
        } catch (error) {
            console.error('Failed to fetch order summary:', error);
            throw error;
        }
    }
};

export { api };