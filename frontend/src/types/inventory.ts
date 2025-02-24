//frontend/src/types/inventory.ts
export interface Product {
    code: string;
    description: string;
    walkUnit: string;
    packSize: number;
    baseWeeklyUsage: number;
}


export interface InventorySession {
    sessionId: string;
    salesLevel: number;
    status: 'in_progress' | 'completed';
    createdAt: Date;
}

export interface InventoryCount {
    productCode: string;
    quantity: number;
}