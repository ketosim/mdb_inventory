//src/services/inventoryApi.ts
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';  // Match backend port


export const inventoryApi = {
    // Start a new counting session
    startSession: (salesLevel: number) => 
        axios.post(`${API_URL}/inventory/session`, { salesLevel }),
    
    // Get product list
    getProducts: () => 
        axios.get(`${API_URL}/products`),
    
    // Record a count
    recordCount: (sessionId: string, productCode: string, quantity: number) =>
        axios.post(`${API_URL}/inventory/count`, { sessionId, productCode, quantity }),

    getOrderSummary: (sessionId: string) => 
        axios.get(`${API_URL}/inventory/orders/${sessionId}`)
};