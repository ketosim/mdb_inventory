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
            <div className="p-4 bg-white shadow-md rounded">
                <h1 className="text-2xl mb-4">Login</h1>
                <input
                    type="password"
                    placeholder="Enter yeastman"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default Login;