// Basic data types for our application
export interface Product {
    code: string;
    description: string;
    walkUnit: string;
    packSize: number;
    baseWeeklyUsage: number;
}

export interface InventorySession {
    id: string;
    salesLevel: number;
    status: 'in_progress' | 'completed';
    createdAt: Date;
}

export interface InventoryCount {
    productCode: string;
    quantity: number;
}