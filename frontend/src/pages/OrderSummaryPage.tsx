// src/pages/OrderSummaryPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { inventoryApi } from '../services/inventoryApi';

interface OrderItem {
    productCode: string;
    description: string;
    currentStock: number;
    weeklyUsage: number;
    orderAmount: number;
    walkUnit: string;
    orderUnit: string;
}

const OrderSummaryPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [orders, setOrders] = useState<OrderItem[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await inventoryApi.getOrderSummary(sessionId!);
            console.log('Order Summary:', response);
            
            if (response && Array.isArray(response)) {
                setOrders(response);
            } else if (response && response.data && Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('Unexpected response format:', response);
                setOrders([]);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
            setOrders([]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold text-center my-4">Order Summary</h1>
            <div className="max-w-md mx-auto">
                {orders && orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.productCode} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                                <div className="text-lg font-semibold">{order.description}</div>
                                <div className="text-sm text-gray-600 mt-2">Current Stock: {order.currentStock} {order.walkUnit}</div>
                                <div className="text-sm text-gray-600">Weekly Usage: {order.weeklyUsage} {order.orderUnit}</div>
                                <div className="text-sm font-medium text-blue-600 mt-1">Order: {order.orderAmount} {order.orderUnit}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        No orders available. Please check your inventory counts.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSummaryPage;