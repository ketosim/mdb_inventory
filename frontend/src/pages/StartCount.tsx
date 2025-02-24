//frontend/src/pages/StartCount.tsx

import React from 'react';
import SalesLevelSelector from '../components/inventory/SalesLevelSelector';
import { inventoryApi } from '../services/inventoryApi';
import { useNavigate } from 'react-router-dom';

const StartCount: React.FC = () => {
    const navigate = useNavigate();

    const handleSalesLevelSelect = async (level: number) => {
        try {
            // Start a new counting session
            const response = await inventoryApi.startSession(level);
            
            // Navigate to the counting screen with the session ID
            navigate(`/count/${response.data.sessionId}`);
        } catch (error) {
            console.error('Failed to start session:', error);
            alert('Failed to start counting session');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SalesLevelSelector onSelect={handleSalesLevelSelect} />
        </div>
    );
};

export default StartCount;