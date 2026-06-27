import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chatApi';
import { tokenStorage } from '../utils/tokenStorage';
import { useChat } from '../context/ChatContext';
import { useTranslation } from 'react-i18next';
import {
  MessageCircle, Search, Send, Loader2, Inbox,
  Phone, Mail, ExternalLink, ArrowLeft, Check, CheckCheck
} from 'lucide-react';

function Messages() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  const { t } = useTranslation();
  const { subscribe, fetchUnread, decrementUnread } = useChat();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Listen for incoming real-time messages
  useEffect(() => {
    const unsub = subscribe((incomingMessage) => {
      // If message belongs to currently open room, append it
      if (selectedRoom && incomingMessage.roomId === selectedRoom.id) {
        setMessages(prev => {
          // Avoid duplicates (sender already added optimistically)
          if (prev.some(m => m.id === incomingMessage.id)) return prev;
          return [...prev, incomingMessage];
        });
      }
      // Refresh room list to update last message + unread badges
      fetchRooms();
    });
    return unsub;
  }, [selectedRoom, subscribe]);

  const fetchRooms = async () => {
    try {
      const data = await chatApi.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Rooms fetch error:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const openRoom = async (room) => {
    setSelectedRoom(room);
    setShowChatOnMobile(true);
    setLoadingMessages(true);
    try {
      const data = await chatApi.getMessages(room.id);
      setMessages(data);
      // Mark them read locally
      if (room.unreadCount > 0) {
        decrementUnread(room.unreadCount);
        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unreadCount: 0 } : r));
      }
    } catch (err) {
      console.error('Messages fetch error:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedRoom) return;

    setSending(true);
    const text = newMessage.trim();
    setNewMessage('');

    try {
      const sent = await chatApi.sendMessage(selectedRoom.id, text);
      setMessages(prev => {
        if (prev.some(m => m.id === sent.id)) return prev;
        return [...prev, { ...sent, isMine: true }];
      });
      // Update room's last message
      setRooms(prev => prev.map(r =>
        r.id === selectedRoom.id
          ? { ...r, lastMessage: text, lastMessageAt: sent.createdAt }
          : r
      ));
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message');
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredRooms = rooms.filter(r =>
    r.otherUserName.toLowerCase().includes(search.toLowerCase()) ||
    (r.listingTitle && r.listingTitle.toLowerCase().includes(search.toLowerCase()))
  );

  if (loadingRooms) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('messages.messages')}</h1>
        <p className="text-slate-500 mt-1">{t('messages.viewConversations')}</p>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">{t('messages.noMessagesYet')}</h3>
          <p className="text-slate-500 mb-6">{t('messages.whenYouBook')}</p>
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg"
          >
            {t('common.browseServices')}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[350px_1fr] h-[calc(100vh-200px)] min-h-[500px]">

          {/* ROOMS LIST */}
          <div className={`border-r border-slate-100 flex flex-col ${showChatOnMobile ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('messages.searchConversations')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-300"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No conversations found</div>
              ) : (
                filteredRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => openRoom(room)}
                    className={`w-full p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left ${
                      selectedRoom?.id === room.id ? 'bg-violet-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {room.otherUserName.charAt(0).toUpperCase()}
                        </div>
                        {room.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            {room.unreadCount > 9 ? '9+' : room.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 truncate">{room.otherUserName}</p>
                          <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(room.lastMessageAt || room.createdAt)}</span>
                        </div>
                        {room.listingTitle && (
                          <p className="text-xs text-violet-600 truncate mt-0.5">{room.listingTitle}</p>
                        )}
                        <p className={`text-xs truncate mt-1 ${room.unreadCount > 0 ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                          {room.lastMessage || 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className={`flex flex-col ${showChatOnMobile ? 'flex' : 'hidden lg:flex'}`}>
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowChatOnMobile(false)}
                      className="lg:hidden p-1 hover:bg-slate-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedRoom.otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedRoom.otherUserName}</p>
                      <p className="text-xs text-slate-500 capitalize">{selectedRoom.otherUserRole}</p>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-2">
                    {selectedRoom.otherUserPhone && (
                      <>
                        <a
                          href={`tel:+91${selectedRoom.otherUserPhone}`}
                          className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://wa.me/91${selectedRoom.otherUserPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    <a
                      href={`mailto:${selectedRoom.otherUserEmail}`}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    {selectedRoom.listingId && (
                      <button
                        onClick={() => navigate(`/dashboard/listing/${selectedRoom.listingId}`)}
                        className="p-2 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors"
                        title="View Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Listing Context Banner */}
                {selectedRoom.listingTitle && (
                  <div className="px-4 py-2 bg-violet-50 border-b border-violet-100 text-xs text-violet-700 font-medium">
                    💬 Discussing: {selectedRoom.listingTitle}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 py-10">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.isMine
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-line break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.isMine ? 'text-violet-100 justify-end' : 'text-slate-400'}`}>
                            <span>{formatTime(msg.createdAt)}</span>
                            {msg.isMine && (
                              msg.isRead
                                ? <CheckCheck className="w-3 h-3" />
                                : <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-violet-300"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 p-8 text-center">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm mt-1">Choose a chat from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;