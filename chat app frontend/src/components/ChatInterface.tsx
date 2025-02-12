import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
  max-width: 1000px;
  padding: 20px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 70%;
  margin: ${({ isOwn }) => (isOwn ? '10px 0 10px auto' : '10px 0 10px 0')};
  padding: 12px 16px;
  background: ${({ isOwn }) => (isOwn ? '#007bff' : '#e9ecef')};
  color: ${({ isOwn }) => (isOwn ? 'white' : 'black')};
  border-radius: ${({ isOwn }) => 
    isOwn ? '20px 20px 0 20px' : '20px 20px 20px 0'};
  word-wrap: break-word;
  position: relative;
`;

const MessageInfo = styled.div<{ isOwn: boolean }>`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
  text-align: ${({ isOwn }) => (isOwn ? 'right' : 'left')};
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  background: white;
  border-top: 1px solid #dee2e6;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 16px;
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const SidebarContainer = styled.div`
  width: 250px;
  background: white;
  border-left: 1px solid #dee2e6;
  padding: 20px;
  overflow-y: auto;
`;

const OnlineUsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const UserItem = styled.div`
  padding: 10px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
`;

const TypingIndicator = styled.div`
  font-style: italic;
  color: #6c757d;
  padding: 8px;
  text-align: center;
`;

const SidebarTitle = styled.h3`
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
`;

export function ChatInterface() {
  const { sendMessage, messages, startTyping, stopTyping, typingUser, onlineUsers } = useWebSocket();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim(), 'general');
      setNewMessage('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    startTyping('general');
  };

  return (
    <PageContainer>
      <ChatContainer>
        <MessagesContainer>
          {messages.map((message, index) => {
            const isOwnMessage = message.sender === user?.username;
            return (
              <div key={message.id || index}>
                <MessageInfo isOwn={isOwnMessage}>
                  {!isOwnMessage && message.sender}
                </MessageInfo>
                <MessageBubble isOwn={isOwnMessage}>
                  {message.content}
                </MessageBubble>
              </div>
            );
          })}
          {typingUser && (
            <TypingIndicator>{typingUser} is typing...</TypingIndicator>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <form onSubmit={handleSend}>
          <InputContainer>
            <Input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onBlur={() => stopTyping('general')}
              placeholder="Type a message..."
            />
            <SendButton type="submit">Send</SendButton>
          </InputContainer>
        </form>
      </ChatContainer>

      <SidebarContainer>
        <SidebarTitle>Online Users ({onlineUsers.length})</SidebarTitle>
        <OnlineUsersList>
          {onlineUsers.map((onlineUser) => (
            <UserItem key={onlineUser.id}>
              <OnlineIndicator />
              <span>{onlineUser.username}</span>
            </UserItem>
          ))}
        </OnlineUsersList>
      </SidebarContainer>
    </PageContainer>
  );
} 