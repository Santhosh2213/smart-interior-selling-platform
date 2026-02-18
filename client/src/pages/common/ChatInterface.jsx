import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const ChatInterface = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    
    socketRef.current.on('newMessage', (message) => {
      if (message.projectId === selectedConversation?._id) {
        setMessages(prev => [...prev, message]);
      }
      // Update conversation list with latest message
      fetchConversations();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadConversation(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await chatService.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const response = await chatService.getMessages(id);
      setMessages(response.data || []);
      const conversation = conversations.find(c => c.projectId._id === id);
      setSelectedConversation(conversation);
      
      // Join socket room
      socketRef.current.emit('joinProject', id);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const messageData = {
        projectId: selectedConversation.projectId._id,
        receiverId: selectedConversation.otherUser._id,
        message: newMessage
      };

      const response = await chatService.sendMessage(messageData);
      
      // Emit via socket
      socketRef.current.emit('sendMessage', response.data);
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.projectId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherUserName = (conversation) => {
    if (!conversation || !conversation.otherUser) return 'Unknown User';
    return conversation.otherUser.name;
  };

  const getLastMessageTime = (conversation) => {
    if (!conversation.lastMessage) return '';
    return new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-200px)]">
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Messages</h2>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.projectId._id}
                    onClick={() => loadConversation(conversation.projectId._id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-200 ${
                      selectedConversation?.projectId._id === conversation.projectId._id
                        ? 'bg-primary-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">
                            {getOtherUserName(conversation)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getLastMessageTime(conversation)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.projectId.title}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {conversation.lastMessage.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium">{getOtherUserName(selectedConversation)}</h3>
                      <p className="text-sm text-gray-600">{selectedConversation.projectId.title}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderId === user?.id;
                    
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="input-field flex-1"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="btn-primary px-6 disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;