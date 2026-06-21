import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { notificationApi } from '../api/notificationApi';
import { tokenStorage } from '../utils/tokenStorage';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);
  const connectionRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => {
        const removed = prev.find(n => n.id === id);
        if (removed && !removed.isRead) {
          setUnreadCount(p => Math.max(0, p - 1));
        }
        return prev.filter(n => n.id !== id);
      });
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }, []);

  // Show toast (auto-hide after 5 sec)
  const showToast = useCallback((notification) => {
    setToastNotification(notification);
    setTimeout(() => setToastNotification(null), 5000);
  }, []);

  // Setup SignalR connection
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token) return;

    // Fetch initial notifications
    fetchNotifications();

    // Create SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7020/notificationHub', {
        accessTokenFactory: () => tokenStorage.getToken(),
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Handle incoming notifications
    connection.on('ReceiveNotification', (notification) => {
      console.log('🔔 New notification received:', notification);
      
      // Add to list
      setNotifications(prev => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast
      showToast(notification);

      // Play sound (optional - browser may block)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
        audio.play().catch(() => {});
      } catch (e) {}
    });

    // Start connection
    connection.start()
      .then(() => console.log('✅ SignalR Connected'))
      .catch(err => console.error('❌ SignalR Connection Error:', err));

    connectionRef.current = connection;

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [fetchNotifications, showToast]);

  const value = {
    notifications,
    unreadCount,
    toastNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}