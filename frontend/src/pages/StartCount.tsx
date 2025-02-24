import React, { useState } from 'react';
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {isLoading ? (
                <div className="text-lg font-medium">Starting session...</div>
            ) : (
                <div className="w-full max-w-xs text-center">
                    <h1 className="text-2xl font-bold mb-6">Select Sales Level</h1>
                    
                    {/* Sales Level Buttons - Centered & Stacked */}
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => handleSalesLevelSelect(40000)}
                            className="bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-medium active:scale-95 transition"
                        >
                            Default Sales Level (40k)
                        </button>

                        <button
                            onClick={() => handleSalesLevelSelect(32000)}
                            className="bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-medium active:scale-95 transition"
                        >
                            Quiet Period (32k)
                        </button>

                        <button
                            onClick={() => handleSalesLevelSelect(50000)}
                            className="bg-red-500 text-white py-3 px-6 rounded-lg text-lg font-medium active:scale-95 transition"
                        >
                            Busy Period (50k)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartCount;
