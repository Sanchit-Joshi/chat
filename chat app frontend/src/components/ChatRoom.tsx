import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import { Send, UserCircle2, LogOut, Users } from 'lucide-react';

interface ChatRoomProps {
  roomId: string;
}

interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  roomId: string;
  sender: User | null;
  timestamp: string;
}

interface OnlineUser {
  id: string;
  username: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, messages: wsMessages } = useWebSocket();
  const { user, logout } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch messages when the room loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/${roomId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchMessages();
  }, [roomId]);

  // Sync WebSocket messages with local state
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages((prev) => {
        // Ensure wsMessages match the Message interface by mapping them
        const formattedMessages = wsMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          roomId: msg.roomId,
          sender: msg.sender || null, // Ensure sender is not null
          timestamp: msg.timestamp
        }));
        return [...prev, ...formattedMessages];
      });
    }
  }, [wsMessages]);

  const isUserNearBottom = () => {
    if (!chatContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop <= clientHeight + 100; // Adjust the threshold as needed
  };

  // Scroll to the bottom when new messages arrive if the user is near the bottom
  useEffect(() => {
    if (isUserNearBottom() && chatContainerRef.current) {
      chatContainerRef.current.scrollTop += 50; // Adjust the scroll amount as needed
    }
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      sendMessage(newMessage.trim(), roomId);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-800">Chat Room: {roomId}</h2>
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
              title="Logout"
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
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        >
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => {
              const isCurrentUser = message.sender?.username === user?.username;
              const showAvatar = index === 0 || messages[index - 1].sender?.username !== message.sender?.username;

              return (
                <div
                  key={message.id || index}
                  className={`flex items-end space-x-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCurrentUser && showAvatar && (
                    <div className="flex-shrink-0 order-1">
                      <UserCircle2 className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {showAvatar && message.sender && (
                      <div className={`text-sm text-gray-500 mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {message.sender.username}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-t-2xl ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white rounded-l-2xl rounded-br-none'
                          : 'bg-white text-gray-900 rounded-r-2xl rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="px-6 py-2 text-sm text-gray-500 italic">
            Someone is typing...
          </div>
        )}

        {/* Message Input */}
        <div className="bg-white border-t p-4 shadow-lg">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              title="Send"
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
        <div className="w-64 border-l bg-white shadow-lg">
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