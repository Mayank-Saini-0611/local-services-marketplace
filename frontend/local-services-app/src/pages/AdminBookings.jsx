import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Tag,
  IndianRupee,
  Inbox,
  PauseCircle,
  PackageCheck
} from 'lucide-react';

function AdminBookings() {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await adminApi.getAllBookings(params);
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      accepted: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
      completed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: PackageCheck },
    };
    return config[status] || config.pending;
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Bookings Overview</h1>
        <p className="text-slate-500 mt-1">Monitor all bookings happening on the platform</p>
      </div>

      {/* STATUS TABS */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'all' 
              ? 'bg-slate-900 border-slate-900 text-white' 
              : 'bg-white border-slate-100 hover:border-slate-300'
          }`}
        >
          <Calendar className={`w-5 h-5 mb-2 ${statusFilter === 'all' ? 'text-orange-400' : 'text-slate-400'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>{counts.all}</p>
          <p className={`text-xs ${statusFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>All Bookings</p>
        </button>
        
        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'pending' 
              ? 'bg-amber-500 border-amber-500 text-white' 
              : 'bg-white border-slate-100 hover:border-amber-300'
          }`}
        >
          <Clock className={`w-5 h-5 mb-2 ${statusFilter === 'pending' ? 'text-amber-100' : 'text-amber-500'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'pending' ? 'text-white' : 'text-slate-900'}`}>{counts.pending}</p>
          <p className={`text-xs ${statusFilter === 'pending' ? 'text-amber-100' : 'text-slate-500'}`}>Pending</p>
        </button>
        
        <button
          onClick={() => setStatusFilter('accepted')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'accepted' 
              ? 'bg-green-600 border-green-600 text-white' 
              : 'bg-white border-slate-100 hover:border-green-300'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 mb-2 ${statusFilter === 'accepted' ? 'text-green-200' : 'text-green-500'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'accepted' ? 'text-white' : 'text-slate-900'}`}>{counts.accepted}</p>
          <p className={`text-xs ${statusFilter === 'accepted' ? 'text-green-100' : 'text-slate-500'}`}>Accepted</p>
        </button>
        
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'rejected' 
              ? 'bg-red-600 border-red-600 text-white' 
              : 'bg-white border-slate-100 hover:border-red-300'
          }`}
        >
          <XCircle className={`w-5 h-5 mb-2 ${statusFilter === 'rejected' ? 'text-red-200' : 'text-red-500'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'rejected' ? 'text-white' : 'text-slate-900'}`}>{counts.rejected}</p>
          <p className={`text-xs ${statusFilter === 'rejected' ? 'text-red-100' : 'text-slate-500'}`}>Rejected</p>
        </button>
        
        <button
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'completed' 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-slate-100 hover:border-blue-300'
          }`}
        >
          <PackageCheck className={`w-5 h-5 mb-2 ${statusFilter === 'completed' ? 'text-blue-200' : 'text-blue-500'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'completed' ? 'text-white' : 'text-slate-900'}`}>{counts.completed}</p>
          <p className={`text-xs ${statusFilter === 'completed' ? 'text-blue-100' : 'text-slate-500'}`}>Completed</p>
        </button>
      </div>

      {/* BOOKINGS LIST */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No bookings found</h3>
          <p className="text-slate-500">Try a different filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => {
            const statusBadge = getStatusBadge(booking.status);
            const StatusIcon = statusBadge.icon;
            
            return (
              <div 
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  
                  {/* Booking Info */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Top Row: Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        <Tag className="w-3 h-3 inline mr-1" />
                        {booking.categoryName}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className="text-xs text-slate-400">Booking #{booking.id}</span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-3">{booking.listingTitle}</h3>

                    {/* Two Column: Customer + Provider */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {/* Customer */}
                      <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                        <p className="text-xs text-violet-700 font-semibold uppercase tracking-wider mb-2">Customer</p>
                        <p className="text-sm font-semibold text-slate-900 mb-1">{booking.customerName}</p>
                        <a href={`mailto:${booking.customerEmail}`} className="text-xs text-slate-600 flex items-center gap-1 hover:text-violet-600 truncate">
                          <Mail className="w-3 h-3" />
                          {booking.customerEmail}
                        </a>
                        {booking.customerPhone && (
                          <a href={`tel:${booking.customerPhone}`} className="text-xs text-slate-600 flex items-center gap-1 hover:text-violet-600 mt-1">
                            <Phone className="w-3 h-3" />
                            +91 {booking.customerPhone}
                          </a>
                        )}
                      </div>

                      {/* Provider */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-2">Provider</p>
                        <p className="text-sm font-semibold text-slate-900 mb-1">{booking.providerName}</p>
                        <a href={`mailto:${booking.providerEmail}`} className="text-xs text-slate-600 flex items-center gap-1 hover:text-blue-600 truncate">
                          <Mail className="w-3 h-3" />
                          {booking.providerEmail}
                        </a>
                        {booking.providerPhone && (
                          <a href={`tel:${booking.providerPhone}`} className="text-xs text-slate-600 flex items-center gap-1 hover:text-blue-600 mt-1">
                            <Phone className="w-3 h-3" />
                            +91 {booking.providerPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                      <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1">Customer Message</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{booking.message}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.listingLocation}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        <span className="font-semibold text-slate-700">₹{booking.listingPrice}</span>
                      </span>
                      {booking.preferredDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.preferredDate).toLocaleDateString('en-IN')}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Booked {new Date(booking.createdAt).toLocaleString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex lg:flex-col gap-2 lg:w-auto">
                    <button
                      onClick={() => navigate(`/dashboard/listing/${booking.listingId}`)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      View Listing
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminBookings;