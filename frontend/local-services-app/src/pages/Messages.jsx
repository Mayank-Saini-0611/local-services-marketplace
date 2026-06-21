import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  MessageCircle,
  Search,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  User,
  ExternalLink
} from 'lucide-react';

function Messages() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedConvo, setSelectedConvo] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const [myBookings, receivedBookings] = await Promise.all([
        bookingApi.getMyBookings().catch(() => []),
        user?.role === 'provider' ? bookingApi.getReceivedBookings().catch(() => []) : Promise.resolve([])
      ]);
      
      // Combine all bookings as "conversations"
      const allBookings = [...myBookings, ...receivedBookings];
      
      // Sort by most recent
      allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setConversations(allBookings);
      if (allBookings.length > 0) setSelectedConvo(allBookings[0]);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConvos = conversations.filter(c => 
    c.listingTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.providerName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => ({
    pending: 'text-amber-600',
    accepted: 'text-green-600',
    rejected: 'text-red-600',
    completed: 'text-blue-600'
  })[status] || 'text-slate-600';

  const getStatusBg = (status) => ({
    pending: 'bg-amber-50',
    accepted: 'bg-green-50',
    rejected: 'bg-red-50',
    completed: 'bg-blue-50'
  })[status] || 'bg-slate-50';

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  if (loading) {
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
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">View all your booking conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No messages yet</h3>
          <p className="text-slate-500 mb-6">When you book or receive bookings, conversations appear here.</p>
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[350px_1fr] h-[600px]">
          
          {/* CONVERSATIONS LIST */}
          <div className="border-r border-slate-100 flex flex-col">
            
            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-300"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConvos.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No conversations found</div>
              ) : (
                filteredConvos.map(convo => {
                  const otherName = convo.customerId === user.userId ? convo.providerName : convo.customerName;
                  const isSelected = selectedConvo?.id === convo.id;
                  
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConvo(convo)}
                      className={`w-full p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left ${
                        isSelected ? 'bg-violet-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {otherName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-slate-900 truncate">{otherName}</p>
                            <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(convo.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">{convo.listingTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium ${getStatusColor(convo.status)} ${getStatusBg(convo.status)} px-1.5 py-0.5 rounded`}>
                              {convo.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* SELECTED CONVERSATION */}
          {selectedConvo ? (
            <div className="flex flex-col">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(selectedConvo.customerId === user.userId ? selectedConvo.providerName : selectedConvo.customerName).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {selectedConvo.customerId === user.userId ? selectedConvo.providerName : selectedConvo.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedConvo.customerId === user.userId ? selectedConvo.providerEmail : selectedConvo.customerEmail}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/listing/${selectedConvo.listingId}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-violet-300 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Listing
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                
                {/* Booking Info Card */}
                <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{selectedConvo.listingTitle}</p>
                      <p className="text-xs text-slate-500">{selectedConvo.categoryName} • ₹{selectedConvo.listingPrice}</p>
                    </div>
                    <span className={`text-xs font-semibold ${getStatusColor(selectedConvo.status)} ${getStatusBg(selectedConvo.status)} px-2 py-1 rounded-full`}>
                      {selectedConvo.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Customer Message */}
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {selectedConvo.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 max-w-md">
                    <p className="text-xs text-slate-500 mb-1">{selectedConvo.customerName} • {new Date(selectedConvo.createdAt).toLocaleString('en-IN')}</p>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4">
                      <p className="text-sm text-slate-700 whitespace-pre-line">{selectedConvo.message}</p>
                    </div>
                    {selectedConvo.preferredDate && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Preferred: {new Date(selectedConvo.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Updates */}
                {selectedConvo.status !== 'pending' && (
                  <div className="text-center my-4">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 ${getStatusBg(selectedConvo.status)} ${getStatusColor(selectedConvo.status)} rounded-full text-sm font-medium`}>
                      {selectedConvo.status === 'accepted' && <CheckCircle2 className="w-4 h-4" />}
                      {selectedConvo.status === 'rejected' && <XCircle className="w-4 h-4" />}
                      {selectedConvo.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                      Booking {selectedConvo.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="p-4 border-t border-slate-100 bg-amber-50">
                <p className="text-xs text-amber-700 flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  💡 Direct messaging coming soon! For now, communicate via email or phone.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-slate-400">
              <p>Select a conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Messages;