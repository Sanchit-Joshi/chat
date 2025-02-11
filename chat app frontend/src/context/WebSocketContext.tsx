import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { Message } from '../types';

interface WebSocketContextType {
    sendMessage: (content: string, roomId: string) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onlineUsers: { id: string; username: string }[];
    setOnlineUsers: React.Dispatch<React.SetStateAction<{ id: string; username: string }[]>>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const ws = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<{ id: string; username: string }[]>([]);

    useEffect(() => {
        if (user) {
            ws.current = new WebSocket('ws://localhost:5000');

            ws.current.onopen = () => {
                console.log('Connected to WebSocket');
                // Join the room when the connection is established
                ws.current?.send(JSON.stringify({ type: 'joinRoom', roomId: 'general', userId: user.id }));
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'receiveMessage') {
                    setMessages((prev) => [...prev, data.message]);
                } else if (data.type === 'onlineUsers') {
                    setOnlineUsers(data.users);
                } else if (data.type === 'previousMessages') {
                    setMessages(data.messages);
                }
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
                type: 'sendMessage',
                content,
                roomId,
                sender: user.id,
                timestamp: new Date().toISOString(),
            };
            ws.current.send(JSON.stringify(message));
        }
    };

    return (
        <WebSocketContext.Provider value={{ sendMessage, messages, setMessages, onlineUsers, setOnlineUsers }}>
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