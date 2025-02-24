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
            console.log('Order Summary:', response.data); // Add this line to debug
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    };

    return (
        <div>
            <h1>Order Summary</h1>
            <div>
                {orders.map(order => (
                    <div key={order.productCode}>
                        <div>{order.description}</div>
                        <div>Current Stock: {order.currentStock} {order.walkUnit}</div>
                        <div>Weekly Usage: {order.weeklyUsage} {order.orderUnit}</div>
                        <div>Order: {order.orderAmount} {order.orderUnit}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderSummaryPage;