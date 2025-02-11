import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Message } from '../types';

interface WebSocketContextType {
  sendMessage: (content: string, roomId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    if (user) {
      // Connect to your local WebSocket server
      ws.current = new WebSocket('ws://localhost:5000');
      
      ws.current.onopen = () => {
        console.log('Connected to WebSocket');
      };
      
      ws.current.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);
        // Handle incoming messages
        console.log('Received message:', message);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return () => {
        ws.current?.close();
      };
    }
  }, [user]);
  
  const sendMessage = (content: string, roomId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && user) {
      const message = {
        content,
        roomId,
        sender: user.id,
        timestamp: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(message));
    }
  };
  
  return (
    <WebSocketContext.Provider value={{ sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};