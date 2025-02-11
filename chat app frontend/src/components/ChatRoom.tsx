import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import { Message } from '../types';
import { Send, UserCircle2, Settings, LogOut, Users } from 'lucide-react';

interface ChatRoomProps {
  roomId: string;
}

interface OnlineUser {
  id: string;
  username: string;
  lastSeen: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const { sendMessage } = useWebSocket();
  const { user, logout } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/${roomId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    // Simulated online users - replace with actual WebSocket data
    setOnlineUsers([
      { id: '1', username: 'Alice', lastSeen: new Date().toISOString() },
      { id: '2', username: 'Bob', lastSeen: new Date().toISOString() },
      { id: '3', username: 'Charlie', lastSeen: new Date().toISOString() },
    ]);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      sendMessage(newMessage.trim(), roomId);
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-800">Chat Room</h2>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {onlineUsers.length} online
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUserList(!showUserList)}
              title="Show Users"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
            title='logout'
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {messages.map((message, index) => {
            const isCurrentUser = message.sender === user?.id;
            const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
              >
                {!isCurrentUser && showAvatar && (
                  <div className="flex-shrink-0">
                    <UserCircle2 className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] ${
                    isCurrentUser ? 'order-1' : 'order-2'
                  }`}
                >
                  {!isCurrentUser && showAvatar && (
                    <div className="text-sm text-gray-500 ml-2 mb-1">
                      User {message.sender.slice(0, 6)}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className={`text-xs mt-1 block ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
            title='Send'
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Online Users Sidebar */}
      {showUserList && (
        <div className="w-64 border-l bg-white">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Online Users</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {onlineUsers.map((onlineUser) => (
                <div key={onlineUser.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <UserCircle2 className="h-8 w-8 text-gray-400" />
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{onlineUser.username}</p>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}