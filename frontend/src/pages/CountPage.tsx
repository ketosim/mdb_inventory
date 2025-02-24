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
    const navigate = useNavigate();
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
            if (response) {
                setProducts(response);
                setFilteredProducts(response);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleSubmit = async () => {
        console.log('Submit button clicked');
        try {
            for (const [productCode, quantity] of Object.entries(counts)) {
                console.log(`Saving count for ${productCode}: ${quantity}`);
                await inventoryApi.recordCount(sessionId!, productCode, quantity);
            }
            console.log('All counts saved, sessionId:', sessionId);
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
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white text-lg font-semibold py-4 px-6 text-center sticky top-0 z-10">
                Inventory Count
            </div>

            {/* Search Bar */}
            <div className="p-4 sticky top-14 bg-gray-100 z-10">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-2 bg-gray-200 p-2 rounded-full"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No products found.</div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product.code} className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                            <div className="text-sm">
                                <p className="font-semibold">{product.description}</p>
                                <p className="text-gray-500">Unit: {product.walkUnit}</p>
                            </div>
                            <input
                                type="number"
                                value={counts[product.code] || ''}
                                onChange={(e) => handleCountChange(product.code, Number(e.target.value))}
                                placeholder={`Enter count`}
                                className="w-20 p-2 border rounded text-center"
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white p-4 border-t shadow-md">
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white text-lg font-semibold py-3 rounded-lg shadow-lg active:scale-95 transition-transform"
                >
                    Complete Count & View Orders
                </button>
            </div>
        </div>
    );
};

export default CountPage;
