import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store';

// Components
import ClientApp from './components/ClientApp';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
    return (
        <StoreProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<ClientApp />} />
                </Routes>
            </BrowserRouter>
        </StoreProvider>
    );
};

export default App;