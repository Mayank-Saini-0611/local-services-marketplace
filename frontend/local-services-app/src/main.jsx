import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import './i18n/i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LocationProvider>
        <NotificationProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </NotificationProvider>
      </LocationProvider>
    </ThemeProvider>
  </React.StrictMode>
);