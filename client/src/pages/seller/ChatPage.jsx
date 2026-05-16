// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import {
//   PaperAirplaneIcon,
//   MagnifyingGlassIcon,
//   UserCircleIcon,
//   ChatBubbleLeftRightIcon,
//   CheckIcon,
//   CheckCircleIcon,
//   WifiIcon
// } from '@heroicons/react/24/outline';
// import { useAuth } from '../../context/AuthContext';
// import { useSocket } from '../../context/SocketContext';
// import  chatService  from '../../services/chatService';
// import Loader from '../../components/common/Loader';
// import toast from 'react-hot-toast';

// const formatTime = (date) => {
//   if (!date) return '';
//   return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// };

// const formatDate = (date) => {
//   if (!date) return '';
//   const d = new Date(date);
//   const today = new Date();
//   if (d.toDateString() === today.toDateString()) return 'Today';
//   const yesterday = new Date(today);
//   yesterday.setDate(yesterday.getDate() - 1);
//   if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
//   return d.toLocaleDateString();
// };

// // In the fetchConversations function:
// const fetchConversations = useCallback(async () => {
//   try {
//     setLoading(true);
//     const res = await chatService.getSellerConversations();
//     const list = res.data || [];
//     setConversations(list);
//   } catch (error) {
//     console.error('Fetch conversations error:', error);
//     toast.error('Failed to load conversations');
//   } finally {
//     setLoading(false);
//   }
// }, []);

// const TypingIndicator = () => (
//   <div className="flex items-center space-x-1 px-4 py-2">
//     <div className="flex space-x-1">
//       {[0, 1, 2].map(i => (
//         <div
//           key={i}
//           className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//           style={{ animationDelay: `${i * 0.15}s` }}
//         />
//       ))}
//     </div>
//     <span className="text-xs text-gray-500 ml-1">typing…</span>
//   </div>
// );

// const MessageBubble = ({ msg, isMine, showDate }) => {
//   const msgDate = formatDate(msg.createdAt);
//   return (
//     <>
//       {showDate && (
//         <div className="flex justify-center my-3">
//           <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
//             {msgDate}
//           </span>
//         </div>
//       )}
//       <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
//         {!isMine && (
//           <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
//             C
//           </div>
//         )}
//         <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
//           <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
//             isMine
//               ? 'bg-blue-600 text-white rounded-br-sm'
//               : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
//           }`}>
//             {msg.message}
//           </div>
//           <div className={`flex items-center mt-1 space-x-1 ${isMine ? 'flex-row-reverse space-x-reverse' : ''}`}>
//             <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
//             {isMine && (
//               msg.read
//                 ? <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400" />
//                 : <CheckIcon className="w-3.5 h-3.5 text-gray-400" />
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// const SellerChatPage = () => {
//   const [searchParams] = useSearchParams();
//   const initialProjectId = searchParams.get('projectId');

//   const { user } = useAuth();
//   const {
//     isConnected, isOnline, sendMessage: socketSend,
//     sendTyping, markAsRead, joinProjectRoom, leaveProjectRoom, on, off
//   } = useSocket();

//   const [customers, setCustomers] = useState([]);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [typingUsers, setTypingUsers] = useState(new Set());
//   const [isTyping, setIsTyping] = useState(false);

//   const messagesEndRef = useRef(null);
//   const typingTimerRef = useRef(null);
//   const inputRef = useRef(null);

//   const scrollToBottom = useCallback(() => {
//     setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
//   }, []);

//   const loadCustomers = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await chatService.getSellerCustomers();
//       const list = res.data || [];
//       setCustomers(list);
//       if (initialProjectId && list.length > 0) {
//         const match = list.find(c => c.projectId?._id === initialProjectId);
//         if (match) openChat(match);
//       }
//     } catch (err) {
//       toast.error('Failed to load conversations');
//     } finally {
//       setLoading(false);
//     }
//   }, [initialProjectId]); // eslint-disable-line

//   useEffect(() => { loadCustomers(); }, [loadCustomers]);

//   const openChat = useCallback(async (chatItem) => {
//     if (selectedChat) leaveProjectRoom(selectedChat.projectId);
//     const projectId = chatItem.projectId?._id;
//     const chat = {
//       customer: chatItem.customer,
//       projectId,
//       projectTitle: chatItem.projectId?.title || 'Project'
//     };
//     setSelectedChat(chat);
//     setMessages([]);
//     setLoadingMessages(true);
//     try {
//       joinProjectRoom(projectId);
//       const res = await chatService.getMessages(projectId);
//       setMessages(res.data || []);
//       if (chatItem.unreadCount > 0) {
//         await chatService.markAsRead(projectId);
//         markAsRead(projectId, chatItem.customer?._id);
//         setCustomers(prev =>
//           prev.map(c => c.projectId?._id === projectId ? { ...c, unreadCount: 0 } : c)
//         );
//       }
//     } catch (err) {
//       toast.error('Failed to load messages');
//     } finally {
//       setLoadingMessages(false);
//       scrollToBottom();
//     }
//   }, [selectedChat, joinProjectRoom, leaveProjectRoom, markAsRead, scrollToBottom]);

//   useEffect(() => {
//     const handleIncoming = (msg) => {
//       if (msg.projectId === selectedChat?.projectId) {
//         setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
//         scrollToBottom();
//         markAsRead(msg.projectId, msg.senderId);
//       } else {
//         setCustomers(prev =>
//           prev.map(c =>
//             c.projectId?._id === msg.projectId
//               ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: msg }
//               : c
//           )
//         );
//       }
//       const known = customers.find(c => c.customer?._id === msg.senderId);
//       if (!known) loadCustomers();
//     };

//     const handleSent = (msg) => {
//       setMessages(prev => {
//         if (prev.find(m => m._id === msg._id)) return prev;
//         // Replace optimistic message
//         return [...prev.filter(m => !m._id?.startsWith('opt-')), msg];
//       });
//       scrollToBottom();
//       setSending(false);
//     };

//     const handleTyping = ({ userId, name, isTyping: t }) => {
//       if (userId === selectedChat?.customer?._id) {
//         setTypingUsers(prev => {
//           const next = new Set(prev);
//           t ? next.add(name) : next.delete(name);
//           return next;
//         });
//       }
//     };

//     const handleRead = ({ projectId }) => {
//       if (projectId === selectedChat?.projectId) {
//         setMessages(prev => prev.map(m => ({ ...m, read: true })));
//       }
//     };

//     on('private-message', handleIncoming);
//     on('message-sent', handleSent);
//     on('typing', handleTyping);
//     on('messages-read', handleRead);

//     return () => {
//       off('private-message', handleIncoming);
//       off('message-sent', handleSent);
//       off('typing', handleTyping);
//       off('messages-read', handleRead);
//     };
//   }, [selectedChat, on, off, markAsRead, scrollToBottom, customers, loadCustomers]);

//   const handleSend = useCallback(async (e) => {
//     e.preventDefault();
//     const text = newMessage.trim();
//     if (!text || !selectedChat || sending) return;

//     setSending(true);
//     setNewMessage('');
//     setIsTyping(false);
//     sendTyping(selectedChat.customer?._id, selectedChat.projectId, false);

//     const optimistic = {
//       _id: `opt-${Date.now()}`,
//       senderId: user._id || user.id,
//       receiverId: selectedChat.customer?._id,
//       message: text,
//       projectId: selectedChat.projectId,
//       createdAt: new Date().toISOString(),
//       read: false
//     };
//     setMessages(prev => [...prev, optimistic]);
//     scrollToBottom();

//     socketSend(selectedChat.customer?._id, text, selectedChat.projectId);
//     setTimeout(() => setSending(false), 3000);
//     inputRef.current?.focus();
//   }, [newMessage, selectedChat, sending, user, socketSend, sendTyping, scrollToBottom]);

//   const handleInput = useCallback((e) => {
//     setNewMessage(e.target.value);
//     if (!selectedChat) return;
//     if (!isTyping) {
//       setIsTyping(true);
//       sendTyping(selectedChat.customer?._id, selectedChat.projectId, true);
//     }
//     clearTimeout(typingTimerRef.current);
//     typingTimerRef.current = setTimeout(() => {
//       setIsTyping(false);
//       sendTyping(selectedChat.customer?._id, selectedChat.projectId, false);
//     }, 1200);
//   }, [isTyping, selectedChat, sendTyping]);

//   const filtered = customers.filter(c => {
//     const q = searchQuery.toLowerCase();
//     return (
//       c.customer?.name?.toLowerCase().includes(q) ||
//       c.projectId?.title?.toLowerCase().includes(q)
//     );
//   });

//   const groupedMessages = messages.reduce((acc, msg, idx) => {
//     const date = formatDate(msg.createdAt);
//     const prev = idx > 0 ? formatDate(messages[idx - 1].createdAt) : null;
//     acc.push({ ...msg, showDate: date !== prev });
//     return acc;
//   }, []);

//   return (
//     <div className="flex h-[calc(100vh-64px)] bg-gray-50">

//       {/* Left panel */}
//       <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//         <div className="px-4 py-4 border-b border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
//             <div className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full ${
//               isConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
//             }`}>
//               <WifiIcon className="w-3 h-3" />
//               <span>{isConnected ? 'Live' : 'Offline'}</span>
//             </div>
//           </div>
//           <div className="relative">
//             <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search customers…"
//               value={searchQuery}
//               onChange={e => setSearchQuery(e.target.value)}
//               className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           {loading ? (
//             <div className="flex justify-center py-12"><Loader size="md" /></div>
//           ) : filtered.length === 0 ? (
//             <div className="text-center py-12 px-4">
//               <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//               <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
//               <p className="text-gray-400 text-xs mt-1">
//                 Conversations appear when customers message on their projects.
//               </p>
//             </div>
//           ) : (
//             filtered.map((chatItem) => {
//               const pid = chatItem.projectId?._id;
//               const isActive = selectedChat?.projectId === pid;
//               const online = isOnline(chatItem.customer?._id);
//               return (
//                 <button
//                   key={pid}
//                   onClick={() => openChat(chatItem)}
//                   className={`w-full px-4 py-3 text-left border-b border-gray-50 transition-colors ${
//                     isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className="relative flex-shrink-0">
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
//                         isActive ? 'bg-blue-600' : 'bg-gray-400'
//                       }`}>
//                         {chatItem.customer?.name?.charAt(0)?.toUpperCase() || '?'}
//                       </div>
//                       {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between">
//                         <span className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
//                           {chatItem.customer?.name || 'Unknown'}
//                         </span>
//                         {chatItem.lastMessage && (
//                           <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">
//                             {formatTime(chatItem.lastMessage.createdAt)}
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-xs text-gray-500 truncate">{chatItem.projectId?.title}</p>
//                       {chatItem.lastMessage && (
//                         <p className="text-xs text-gray-400 truncate mt-0.5">{chatItem.lastMessage.message}</p>
//                       )}
//                     </div>
//                     {chatItem.unreadCount > 0 && (
//                       <span className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
//                         {chatItem.unreadCount > 9 ? '9+' : chatItem.unreadCount}
//                       </span>
//                     )}
//                   </div>
//                 </button>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {/* Right panel */}
//       <div className="flex-1 flex flex-col">
//         {selectedChat ? (
//           <>
//             <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center space-x-3 shadow-sm">
//               <div className="relative">
//                 <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
//                   {selectedChat.customer?.name?.charAt(0)?.toUpperCase() || '?'}
//                 </div>
//                 {isOnline(selectedChat.customer?._id) && (
//                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
//                 )}
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-800">{selectedChat.customer?.name}</h3>
//                 <p className="text-xs text-gray-400">
//                   {isOnline(selectedChat.customer?._id) ? '🟢 Online' : '⚫ Offline'} · {selectedChat.projectTitle}
//                 </p>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
//               {loadingMessages ? (
//                 <div className="flex justify-center py-12"><Loader size="md" /></div>
//               ) : messages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full">
//                   <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mb-4" />
//                   <p className="text-gray-500 text-sm font-medium">No messages yet</p>
//                   <p className="text-gray-400 text-xs mt-1">Start the conversation below.</p>
//                 </div>
//               ) : (
//                 <>
//                   {groupedMessages.map((msg, idx) => {
//                     const isMine =
//                       msg.senderId === user._id ||
//                       msg.senderId === user.id ||
//                       msg.senderId?._id === user._id ||
//                       msg.senderId?._id === user.id;
//                     return (
//                       <MessageBubble key={msg._id || idx} msg={msg} isMine={isMine} showDate={msg.showDate} />
//                     );
//                   })}
//                   {typingUsers.size > 0 && <TypingIndicator />}
//                   <div ref={messagesEndRef} />
//                 </>
//               )}
//             </div>

//             <form
//               onSubmit={handleSend}
//               className="bg-white border-t border-gray-200 px-4 py-3 flex items-center space-x-3"
//             >
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={newMessage}
//                 onChange={handleInput}
//                 placeholder="Type a message…"
//                 className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
//                 disabled={sending}
//                 onKeyDown={e => {
//                   if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
//                 }}
//               />
//               <button
//                 type="submit"
//                 disabled={!newMessage.trim() || sending}
//                 className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
//               >
//                 <PaperAirplaneIcon className="w-5 h-5" />
//               </button>
//             </form>
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
//             <div className="text-center">
//               <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-500" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a conversation</h3>
//               <p className="text-gray-400 text-sm max-w-xs">
//                 Choose a customer from the left panel to view messages and chat in real-time.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SellerChatPage;