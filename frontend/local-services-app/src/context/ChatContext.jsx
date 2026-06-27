import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { chatApi } from '../api/chatApi';
import { tokenStorage } from '../utils/tokenStorage';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState(null);
  const connectionRef = useRef(null);
  const listenersRef = useRef(new Set());

  const fetchUnread = useCallback(async () => {
    try {
      const data = await chatApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Unread count error:', err);
    }
  }, []);

  // Subscribe to incoming messages (used by Messages page)
  const subscribe = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => listenersRef.current.delete(callback);
  }, []);

  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token) return;

    fetchUnread();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7020/chatHub', {
        accessTokenFactory: () => tokenStorage.getToken(),
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (message) => {
      // Update unread count if not from me
      if (!message.isMine) {
        setUnreadCount(prev => prev + 1);
        setLatestMessage(message);

        // Play sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
          audio.play().catch(() => {});
        } catch (e) {}
      }

      // Notify all listeners (e.g., Messages page)
      listenersRef.current.forEach(cb => cb(message));
    });

    connection.start()
      .then(() => console.log('✅ Chat SignalR Connected'))
      .catch(err => console.error('Chat SignalR Error:', err));

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) connectionRef.current.stop();
    };
  }, [fetchUnread]);

  const decrementUnread = (count) => {
    setUnreadCount(prev => Math.max(0, prev - count));
  };

  const clearLatestMessage = () => setLatestMessage(null);

  return (
    <ChatContext.Provider value={{
      unreadCount,
      latestMessage,
      subscribe,
      fetchUnread,
      decrementUnread,
      clearLatestMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}