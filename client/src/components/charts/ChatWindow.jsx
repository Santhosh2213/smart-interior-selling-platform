import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const ChatWindow = ({ recipient, projectId, onClose }) => {
  const { user } = useAuth();
  const { sendMessage, sendTyping, onPrivateMessage, onTyping } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Load chat history (from API)
    loadChatHistory();

    // Listen for new messages
    const handleNewMessage = (message) => {
      if (message.senderId === recipient.userId || message.recipientId === recipient.userId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    // Listen for typing indicators
    const handleTyping = ({ userId, name, isTyping }) => {
      if (userId === recipient.userId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(name);
          } else {
            newSet.delete(name);
          }
          return newSet;
        });
      }
    };

    onPrivateMessage(handleNewMessage);
    onTyping(handleTyping);

    return () => {
      // Clean up
    };
  }, [recipient]);

  const loadChatHistory = async () => {
    try {
      // Fetch chat history from API
      const response = await fetch(`/api/chat/history/${recipient.userId}${projectId ? `?projectId=${projectId}` : ''}`);
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(recipient.userId, newMessage, projectId);
      setNewMessage('');
      
      // Clear typing indicator
      sendTyping(recipient.userId, projectId, false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(recipient.userId, projectId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(recipient.userId, projectId, false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {recipient.name?.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{recipient.name}</h3>
            <p className="text-xs text-gray-500">
              {recipient.role} • {typingUsers.size > 0 ? 'typing...' : 'online'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.senderId === user.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;