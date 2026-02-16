import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import io from 'socket.io-client';

export const useSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Connect to socket
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      query: { userId: user.id }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off
  };
};