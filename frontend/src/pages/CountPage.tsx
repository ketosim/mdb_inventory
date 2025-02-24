//CountPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryApi } from '../services/inventoryApi';

interface Product {
    code: string;
    description: string;
    walkUnit: string;
    packSize: number;
    baseWeeklyUsage: number;
}

const CountPage: React.FC = () => {
    const navigate = useNavigate(); // Ensure useNavigate is used correctly
    const { sessionId } = useParams<{ sessionId: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            console.log('Fetching products...');
            const response = await inventoryApi.getProducts();
            console.log('Response:', response);
            if (response.data) {
                setProducts(response.data);
                setFilteredProducts(response.data); // Ensure filteredProducts is set initially
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleSubmit = async () => {
        console.log('Submit button clicked'); // Add this line
        try {
            console.log('Starting to save counts...'); // Add this line
            // Save any final counts
            for (const [productCode, quantity] of Object.entries(counts)) {
                console.log(`Saving count for ${productCode}: ${quantity}`); // Add this line
                await inventoryApi.recordCount(sessionId!, productCode, quantity);
            }
            console.log('All counts saved, sessionId:', sessionId); // Add this line
            console.log('Attempting navigation...'); // Add this line

            // Navigate to order summary page
            navigate(`/order-summary/${sessionId}`);
        } catch (error) {
            console.error('Failed to submit counts:', error);
        }
    };

    const handleCountChange = async (productCode: string, quantity: number) => {
        try {
            setCounts(prev => ({ ...prev, [productCode]: quantity }));
            await inventoryApi.recordCount(sessionId!, productCode, quantity);
        } catch (error) {
            console.error('Failed to record count:', error);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    useEffect(() => {
        const filtered = products.filter(product =>
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Inventory Count</h1>

            {/* Search Bar with Clear Button */}
            <div className="mb-4 relative">
                <div className="flex items-center border rounded">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 rounded-l" />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Product List */}
            <div className="space-y-2">
                {filteredProducts.map(product => (
                    <div key={product.code} className="flex justify-between items-center p-2">
                        <div>
                            {product.description}
                        </div>
                        <div>
                            <input
                                type="number"
                                value={counts[product.code] || ''}
                                onChange={(e) => handleCountChange(product.code, Number(e.target.value))}
                                placeholder={`Enter number in ${product.walkUnit}`}
                                className="w-24 p-1 border rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="mt-4 fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <button
                    onClick={() => {
                        console.log('Button clicked'); // Add this line
                        handleSubmit();
                    }}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Complete Count & View Orders
                </button>
            </div>
        </div>
    );
};

export default CountPage;