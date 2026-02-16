import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { 
  BellIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }

    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      toast.success('All notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'success': return 'bg-green-50';
      case 'error': return 'bg-red-50';
      case 'warning': return 'bg-yellow-50';
      default: return 'bg-blue-50';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your activities</p>
        </div>
        
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center text-sm"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="btn-secondary flex items-center text-sm text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'read'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === 'unread' 
              ? "You don't have any unread notifications" 
              : "You don't have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`${getBgColor(notification.type)} rounded-lg shadow-sm p-4 ${
                !notification.read ? 'border-l-4 border-primary-600' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-medium ${
                      !notification.read ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${
                    !notification.read ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {notification.message}
                  </p>
                  
                  {notification.link && (
                    <a
                      href={notification.link}
                      className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                    >
                      View details →
                    </a>
                  )}
                  
                  <div className="flex justify-end space-x-3 mt-3">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;