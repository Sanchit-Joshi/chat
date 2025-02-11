import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import ChatRoom from './components/ChatRoom';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/chat"
                        element={
                            <PrivateRoute>
                                <ChatRoom  roomId='123'/>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/chat" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;