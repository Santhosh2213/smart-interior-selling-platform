import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const ChatInterface = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      setShowMobileList(false);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectSocket = () => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      query: { userId: user?.id }
    });

    newSocket.on('newMessage', (message) => {
      if (activeConversation?._id === message.conversationId) {
        setMessages(prev => [...prev, message]);
      }
      // Update conversation list
      fetchConversations();
    });

    setSocket(newSocket);
  };

  const fetchConversations = async () => {
    try {
      const response = await chatService.getConversations();
      setConversations(response.data);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await chatService.getMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files?.length) return;
    if (!activeConversation) return;

    setSending(true);
    const formData = new FormData();
    formData.append('message', newMessage);
    formData.append('conversationId', activeConversation._id);
    
    if (fileInputRef.current?.files?.length) {
      formData.append('attachment', fileInputRef.current.files[0]);
    }

    try {
      const response = await chatService.sendMessage(formData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      socket?.emit('sendMessage', response.data);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== user?.id);
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
      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Conversations List - Mobile */}
          <div className={`
            absolute inset-0 bg-white z-10 lg:relative lg:block lg:w-80 border-r
            transition-transform duration-300 ease-in-out
            ${showMobileList ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Messages</h2>
                <div className="mt-2 relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  const isActive = activeConversation?._id === conversation._id;
                  
                  return (
                    <button
                      key={conversation._id}
                      onClick={() => setActiveConversation(conversation)}
                      className={`
                        w-full p-4 text-left border-b hover:bg-gray-50 transition-colors
                        ${isActive ? 'bg-primary-50' : ''}
                      `}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <UserCircleIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900 truncate">
                              {otherUser?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(conversation.updatedAt)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No conversations found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        setShowMobileList(true);
                        setActiveConversation(null);
                      }}
                      className="lg:hidden mr-2 text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <UserCircleIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {getOtherParticipant(activeConversation)?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activeConversation.project?.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;

                    return (
                      <div
                        key={index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className="flex-shrink-0">
                            {!isOwn && (
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <UserCircleIcon className="h-5 w-5 text-primary-600" />
                              </div>
                            )}
                          </div>
                          
                          <div className={`mx-2 ${isOwn ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isOwn
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              
                              {message.attachment && (
                                <a
                                  href={message.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs underline mt-1 block ${
                                    isOwn ? 'text-primary-100' : 'text-primary-600'
                                  }`}
                                >
                                  View Attachment
                                </a>
                              )}
                              
                              <p className={`text-xs mt-1 ${
                                isOwn ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          toast.success('File attached');
                        }
                      }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                    >
                      <PaperClipIcon className="h-5 w-5" />
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 input-field"
                      disabled={sending}
                    />

                    <button
                      type="submit"
                      disabled={sending || (!newMessage.trim() && !fileInputRef.current?.files?.length)}
                      className="p-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
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