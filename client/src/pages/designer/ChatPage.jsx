import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import  chatService  from '../../services/chatService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  FaceSmileIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import EmojiPicker from 'emoji-picker-react';

const DesignerChatPage = () => {
  const { user } = useAuth();
  const { isConnected, isOnline, sendMessage: socketSend, sendTyping, markAsRead, joinProjectRoom, leaveProjectRoom, on, off } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMenuFor, setShowMenuFor] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // In the fetchConversations function, change:
const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      // Use designer conversations endpoint
      const res = await chatService.getDesignerConversations();
      const list = res.data || [];
      
      const sortedList = list.sort((a, b) => 
        new Date(b.lastMessage?.createdAt || b.updatedAt) - 
        new Date(a.lastMessage?.createdAt || a.updatedAt)
      );
      
      setConversations(sortedList);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchConversations(); 
  }, [fetchConversations]);

  const openConversation = useCallback(async (conv) => {
    if (selectedConv) leaveProjectRoom(selectedConv.projectId?._id);

    setSelectedConv(conv);
    setMessages([]);
    setLoadingMsgs(true);
    setReplyingTo(null);
    setAttachment(null);
    setEditingMessage(null);

    try {
      joinProjectRoom(conv.projectId?._id);
      const res = await chatService.getMessages(conv.projectId?._id);
      setMessages(res.data || []);

      if (conv.unreadCount > 0) {
        await chatService.markAsRead(conv.projectId?._id);
        markAsRead(conv.projectId?._id, conv.otherUser?._id);
        setConversations(prev =>
          prev.map(c => c.projectId?._id === conv.projectId?._id ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (error) {
      console.error('Open conversation error:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMsgs(false);
      scrollToBottom();
    }
  }, [selectedConv, joinProjectRoom, leaveProjectRoom, markAsRead, scrollToBottom]);

  // Socket listeners (same as ChatInterface)
  useEffect(() => {
    const handleMsg = (msg) => {
      if (msg.projectId === selectedConv?.projectId?._id) {
        const newMsg = { ...msg, status: 'delivered' };
        setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, newMsg]);
        scrollToBottom();
        
        if (msg.senderId !== user._id && selectedConv) {
          markAsRead(msg.projectId, msg.senderId);
        }
      } else {
        fetchConversations(); // Refresh conversations
      }
    };

    const handleSent = (msg) => {
      setMessages(prev => prev.map(m => 
        m._id === msg._id ? { ...msg, status: 'sent' } : m
      ));
      scrollToBottom();
      setSending(false);
      fetchConversations();
    };

    const handleTyping = ({ userId, name, isTyping: t }) => {
      if (userId === selectedConv?.otherUser?._id) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          t ? next.add(name) : next.delete(name);
          return next;
        });
      }
    };

    const handleRead = ({ projectId }) => {
      if (projectId === selectedConv?.projectId?._id) {
        setMessages(prev => prev.map(m => ({ ...m, read: true, status: 'read' })));
      }
    };

    on('private-message', handleMsg);
    on('message-sent', handleSent);
    on('typing', handleTyping);
    on('messages-read', handleRead);

    return () => {
      off('private-message', handleMsg);
      off('message-sent', handleSent);
      off('typing', handleTyping);
      off('messages-read', handleRead);
    };
  }, [selectedConv, on, off, markAsRead, scrollToBottom, user._id, fetchConversations]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if ((!text && !attachment) || !selectedConv || sending) return;

    setSending(true);
    
    let attachmentData = null;
    if (attachment) {
      attachmentData = {
        url: URL.createObjectURL(attachment),
        filename: attachment.name,
        type: attachment.type,
        size: attachment.size
      };
    }
    
    setNewMessage('');
    setAttachment(null);
    setIsTyping(false);
    sendTyping(selectedConv.otherUser?._id, selectedConv.projectId?._id, false);

    const opt = {
      _id: `opt-${Date.now()}`,
      senderId: user._id || user.id,
      receiverId: selectedConv.otherUser?._id,
      message: text || (attachment ? '📎 ' + attachment.name : ''),
      attachment: attachmentData,
      projectId: selectedConv.projectId?._id,
      projectName: selectedConv.projectId?.title,
      createdAt: new Date().toISOString(),
      read: false,
      status: 'sending'
    };
    setMessages(prev => [...prev, opt]);
    scrollToBottom();

    socketSend(selectedConv.otherUser?._id, text || (attachment ? '📎 ' + attachment.name : ''), selectedConv.projectId?._id);

    setTimeout(() => setSending(false), 3000);
    inputRef.current?.focus();
  }, [newMessage, attachment, selectedConv, sending, user, socketSend, sendTyping, scrollToBottom]);

  const handleInput = useCallback((e) => {
    setNewMessage(e.target.value);
    if (!selectedConv) return;
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(selectedConv.otherUser?._id, selectedConv.projectId?._id, true);
    }
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(selectedConv.otherUser?._id, selectedConv.projectId?._id, false);
    }, 1200);
  }, [isTyping, selectedConv, sendTyping]);

  const handleEmojiSelect = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max size 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const handleEditMessage = async () => {
    if (!editText.trim() || !editingMessage) return;
    try {
      await chatService.editMessage(editingMessage._id, editText);
      setEditingMessage(null);
      setEditText('');
      toast.success('Message edited');
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId, deleteForEveryone = true) => {
    if (window.confirm(deleteForEveryone ? 'Delete this message for everyone?' : 'Delete this message for yourself?')) {
      try {
        await chatService.deleteMessage(messageId, deleteForEveryone);
        toast.success('Message deleted');
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
    setShowMenuFor(null);
  };

  const getRoleIcon = (role) => {
    if (role === 'customer') return <UserIcon className="w-4 h-4" />;
    if (role === 'seller') return <BuildingStorefrontIcon className="w-4 h-4" />;
    return <UserGroupIcon className="w-4 h-4" />;
  };

  const MessageBubble = ({ message, isMine }) => {
    if (message.deleted) {
      return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} my-1`}>
          <div className="max-w-[70%] px-4 py-2 rounded-2xl bg-gray-100 text-gray-400 italic text-sm">
            {message.message}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} my-1 group`}>
        <div className={`relative max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
          <div className={`relative px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
            isMine 
              ? 'bg-blue-500 text-white rounded-br-none' 
              : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
          }`}>
            {!isMine && message.senderName && (
              <p className="text-xs font-semibold mb-1 text-blue-600">
                {message.senderName}
              </p>
            )}
            
            <p className="break-words whitespace-pre-wrap">{message.message}</p>
            
            {message.edited && (
              <span className="text-[10px] opacity-60 ml-1">(edited)</span>
            )}
            
            {message.attachment && (
              <div className="mt-2">
                {message.attachment.type?.startsWith('image/') ? (
                  <img 
                    src={message.attachment.url} 
                    alt="attachment" 
                    className="max-w-full rounded-lg cursor-pointer max-h-48 object-cover"
                    onClick={() => window.open(message.attachment.url)}
                  />
                ) : (
                  <div className={`flex items-center space-x-2 p-2 rounded ${isMine ? 'bg-blue-400' : 'bg-gray-100'}`}>
                    <DocumentArrowUpIcon className="w-4 h-4" />
                    <span className="text-xs">{message.attachment.filename}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-1 mt-1">
              <span className={`text-[10px] ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          
          {isMine && (
            <div className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowMenuFor(showMenuFor === message._id ? null : message._id)}
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenuFor === message._id && (
                <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[140px]">
                  <button
                    onClick={() => {
                      setEditingMessage(message);
                      setEditText(message.message);
                      setShowMenuFor(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message._id, true)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete for everyone</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message._id, false)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete for me</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filtered = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser?.name?.toLowerCase().includes(q) ||
      c.projectId?.title?.toLowerCase().includes(q)
    );
  });

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-140px)] flex">
        
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Messages</h2>
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader size="sm" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No conversations</p>
                <p className="text-xs text-gray-400 mt-1">When you're assigned to projects, chats will appear here</p>
              </div>
            ) : (
              filtered.map(conv => {
                const active = selectedConv?.projectId?._id === conv.projectId?._id && 
                               selectedConv?.otherUser?._id === conv.otherUser?._id;
                const online = isOnline(conv.otherUser?._id);
                return (
                  <button
                    key={`${conv.projectId?._id}-${conv.otherUser?._id}`}
                    onClick={() => openConversation(conv)}
                    className={`w-full px-4 py-3 text-left border-b border-gray-50 transition-colors ${active ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${active ? 'bg-blue-600' : 'bg-gray-400'}`}>
                          {conv.otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-800 truncate">{conv.otherUser?.name}</span>
                            <span className="text-xs text-gray-400 flex items-center">
                              {getRoleIcon(conv.otherUser?.role)}
                            </span>
                          </div>
                          {conv.lastMessage && <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(conv.lastMessage?.createdAt)}</span>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.projectId?.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {conv.lastMessage?.senderId === user._id ? 'You: ' : ''}{conv.lastMessage?.message}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {selectedConv.otherUser?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {isOnline(selectedConv.otherUser?._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{selectedConv.otherUser?.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedConv.otherUser?.role === 'customer' ? 'Customer' : 'Seller'} · 
                      <span className="text-blue-600 ml-1">{selectedConv.projectId?.title}</span>
                    </p>
                  </div>
                </div>
                {!isConnected && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    Connecting...
                  </span>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingMsgs ? (
                  <div className="flex justify-center py-8"><Loader size="sm" /></div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const currentUserId = (user._id || user.id)?.toString();
                      let senderId = '';
                      if (msg.senderId) {
                        if (typeof msg.senderId === 'object' && msg.senderId._id) {
                          senderId = msg.senderId._id.toString();
                        } else if (typeof msg.senderId === 'object') {
                          senderId = msg.senderId.toString();
                        } else {
                          senderId = msg.senderId.toString();
                        }
                      }
                      const isMine = senderId === currentUserId;
                      return <MessageBubble key={msg._id || idx} message={msg} isMine={isMine} />;
                    })}
                    
                    {typingUsers.size > 0 && (
                      <div className="flex items-center space-x-1 px-2">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">
                          {Array.from(typingUsers).join(', ')} typing...
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Edit Message Modal */}
              {editingMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-4 w-96">
                    <h3 className="text-lg font-semibold mb-3">Edit Message</h3>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button onClick={() => setEditingMessage(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                      <button onClick={handleEditMessage} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachment preview */}
              {attachment && (
                <div className="px-4 pt-2">
                  <div className="bg-white rounded-lg p-2 flex items-center justify-between shadow-sm border">
                    <div className="flex items-center space-x-2">
                      <DocumentArrowUpIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                    <button onClick={() => setAttachment(null)} className="text-gray-500">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <FaceSmileIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <PhotoIcon className="w-5 h-5" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInput}
                    placeholder={`Message ${selectedConv.otherUser?.name}...`}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                  />
                  
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !attachment) || sending}
                    className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiSelect} />
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Select a conversation</p>
                <p className="text-gray-400 text-xs mt-1">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerChatPage;