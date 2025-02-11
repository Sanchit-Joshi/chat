import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import LoginPage from './components/LoginPage';
import ChatRoom from './components/ChatRoom';
import PrivateRoute from './components/PrivateRoute';

// Wrapper component to extract roomId from URL and pass it to ChatRoom
const ChatRoomWrapper: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>(); // Extract roomId from URL
  return <ChatRoom roomId={roomId!} />; // Pass roomId to ChatRoom
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/chat/:roomId" // Dynamic route for roomId
              element={
                <PrivateRoute>
                  <ChatRoomWrapper /> {/* Use the wrapper component */}
                </PrivateRoute>
              }
            />

            {/* Default Route */}
            <Route
              path="/"
              element={<Navigate to="/chat/general" replace />} // Redirect to a default room (e.g., "general")
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/chat/general" replace />} />
          </Routes>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
};

export default App;