import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryApi } from '../services/inventoryApi';

interface Product {
    code: string;
    description: string;
    walkUnit: string;
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
            const response = await inventoryApi.getProducts();
            if (response) {
                setProducts(response);
                setFilteredProducts(response);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleSubmit = async () => {
        let allSuccess = true;
        
        try {
            for (const [productCode, quantity] of Object.entries(counts)) {
                try {
                    await inventoryApi.recordCount(sessionId!, productCode, quantity);
                } catch (error) {
                    console.error(`Error saving ${productCode}, continuing:`, error);
                    allSuccess = false;
                }
            }
            
            // Navigate even if some items failed
            console.log(`Navigating to /order-summary/${sessionId}`);
            navigate(`/order-summary/${sessionId}`);
        } catch (error) {
            console.error('Failed to submit counts:', error);
            // Maybe show an error message to the user here
        }
    };

    const handleCountChange = async (productCode: string, quantity: number) => {
        // Update local state immediately for responsive UI
        setCounts(prev => ({ ...prev, [productCode]: quantity }));
        
        try {
            // Only make API call if we have valid values
            if (sessionId && productCode && quantity >= 0) {
                await inventoryApi.recordCount(sessionId, productCode, quantity);
            }
        } catch (error) {
            // Log error but don't disturb the user
            console.error('Error saving count, will retry on submit:', error);
        }
    };
    useEffect(() => {
        const filtered = products.filter(product =>
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Fixed Header & Search Bar */}
            <div className="bg-white shadow-md p-4 sticky top-0 left-0 right-0 z-10">
                <h1 className="text-xl font-bold text-center mb-2">Inventory Count</h1>
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

            {/* Scrollable Product List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4 mt-2">
                {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No products found.</div>
                ) : (
                    filteredProducts.map(product => (
                        <div 
                            key={product.code} 
                            className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md border"
                        >
                            {/* Product Description */}
                            <div className="text-sm font-medium text-gray-700">
                                {product.description}
                            </div>

                            {/* Input Field */}
                            <input
                                type="number"
                                value={counts[product.code] || ''}
                                onChange={(e) => handleCountChange(product.code, Number(e.target.value))}
                                placeholder={`${product.walkUnit}`}
                                className="w-24 p-2 border rounded text-center text-gray-700"
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white p-4 border-t shadow-lg">
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white text-lg font-semibold py-3 rounded-lg active:scale-95 transition-transform"
                >
                    Complete Count & View Orders
                </button>
            </div>
        </div>
    );
};

export default CountPage;
