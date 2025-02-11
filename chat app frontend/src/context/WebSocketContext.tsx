import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { Message } from '../types';

interface WebSocketContextType {
    sendMessage: (content: string, roomId: string) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const ws = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (user) {
            ws.current = new WebSocket('ws://localhost:5000');

            ws.current.onopen = () => {
                console.log('Connected to WebSocket');
            };

            ws.current.onmessage = (event) => {
                const message: Message = JSON.parse(event.data);
                setMessages((prev) => [...prev, message]);
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
        <WebSocketContext.Provider value={{ sendMessage, messages, setMessages }}>
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