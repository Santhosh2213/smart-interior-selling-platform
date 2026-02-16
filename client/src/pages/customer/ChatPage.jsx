import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { projectService } from '../../services/projectService';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  PaperClipIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const ChatPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchMessages();
      connectSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectSocket = () => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      query: { projectId }
    });

    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);
  };

  const fetchProject = async () => {
    try {
      const response = await projectService.getProjectById(projectId);
      setProject(response.data);
    } catch (error) {
      toast.error('Failed to fetch project');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await chatService.getMessages(projectId);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files?.length) return;

    setSending(true);
    const formData = new FormData();
    formData.append('message', newMessage);
    
    if (fileInputRef.current?.files?.length) {
      formData.append('attachment', fileInputRef.current.files[0]);
    }

    try {
      const response = await chatService.sendMessage(projectId, formData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Emit via socket
      socket?.emit('sendMessage', response.data);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
          <p className="text-gray-600">Project: {project?.title}</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
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
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
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
      </div>
    </div>
  );
};

export default ChatPage;