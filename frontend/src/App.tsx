import React, { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StartCount from "./pages/StartCount";
import Login from "./pages/Login";
import CountPage from "./pages/CountPage";
import OrderSummaryPage from "./pages/OrderSummaryPage";

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    return isAuthenticated ? children : <Navigate to="/" />;
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/start-count" element={<PrivateRoute><StartCount /></PrivateRoute>} />
                <Route path="/count/:sessionId" element={<PrivateRoute><CountPage /></PrivateRoute>} />
                <Route path="/order-summary/:sessionId" element={<PrivateRoute><OrderSummaryPage /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;