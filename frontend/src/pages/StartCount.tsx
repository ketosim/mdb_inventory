//frontend/src/pages/StartCount.tsx
import React, { useState } from 'react';
import SalesLevelSelector from '../components/inventory/SalesLevelSelector';
import { inventoryApi } from '../services/inventoryApi';
import { useNavigate } from 'react-router-dom';

const StartCount: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSalesLevelSelect = async (level: number) => {
        setIsLoading(true);
        try {
            const session = await inventoryApi.startSession(level);
            if (session?.sessionId) {
                navigate(`/count/${session.sessionId}`);
            } else {
                throw new Error('No session ID received');
            }
        } catch (error) {
            console.error('Failed to start session:', error);
            alert('Failed to start counting session. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {isLoading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-lg">Starting session...</div>
                </div>
            ) : (
                <SalesLevelSelector onSelect={handleSalesLevelSelect} />
            )}
        </div>
    );
};

export default StartCount;