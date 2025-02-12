import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message } from '../types';

interface WebSocketContextType {
  sendMessage: (content: string, roomId: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onlineUsers: { id: string; username: string }[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<{ id: string; username: string }[]>>;
  connectionStatus: string;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  typingUser: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socket = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; username: string }[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!user) return;

    try {
      setConnectionStatus('connecting');

      socket.current = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket'],
        auth: {
          userId: user.id,
        },
      });

      // Socket event handlers
      socket.current.on('connect', () => {
        console.log('Connected to socket server');
        setConnectionStatus('connected');

        // Join default room
        socket.current?.emit('join', {
          userId: user.id,
          roomId: 'general',
        });
      });

      socket.current.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('error');
      });

      socket.current.on('previousMessages', (messages: Message[]) => {
        setMessages(messages);
      });

      socket.current.on('receiveMessage', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.current.on('onlineUsers', (users: { id: string; username: string }[]) => {
        setOnlineUsers(users);
      });

      socket.current.on('userTyping', (username: string) => {
        setTypingUser(username);
      });

      socket.current.on('userStoppedTyping', () => {
        setTypingUser(null);
      });

      socket.current.on('disconnect', () => {
        setConnectionStatus('disconnected');
      });
    } catch (error) {
      console.error('Error creating socket connection:', error);
      setConnectionStatus('error');
    }
  }, [user]);

  const sendMessage = useCallback(
    (content: string, roomId: string) => {
      if (!socket.current?.connected || !user) {
        console.error('Cannot send message: Socket is not connected or user is not authenticated');
        return;
      }

      socket.current.emit('sendMessage', {
        content,
        roomId,
        sender: user.username, // Ensure the sender field is passed as a username
      });
    },
    [user]
  );

  const startTyping = useCallback(
    (roomId: string) => {
      if (!socket.current?.connected || !user) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socket.current.emit('typing', {
        roomId,
        username: user.username,
      });

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(roomId);
      }, 3000);
    },
    [user]
  );

  const stopTyping = useCallback((roomId: string) => {
    if (!socket.current?.connected) return;

    socket.current.emit('stopTyping', { roomId });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.current?.disconnect();
    };
  }, [connect]);

  const contextValue = {
    sendMessage,
    messages,
    setMessages,
    onlineUsers,
    setOnlineUsers,
    connectionStatus,
    startTyping,
    stopTyping,
    typingUser,
  };

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
// export const WebSocketProvider = WebSocketProvider;