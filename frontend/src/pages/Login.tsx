import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        if (password === 'yeastman') {
            localStorage.setItem('authenticated', 'true');
            navigate('/start-count');
        } else {
            alert('Incorrect password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-xs bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
                
                {/* Input Box */}
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-center"
                />

                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white py-3 mt-4 rounded-lg text-lg font-medium active:scale-95 transition"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default Login;
