import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { reviewApi } from '../api/reviewApi';
import { tokenStorage } from '../utils/tokenStorage';
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
  Frown,
  Eye,
  Trash2,
  AlertCircle,
  X,
  Filter,
  Inbox,
  Star,
  Send as SendIcon
} from 'lucide-react';

function Bookings() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState(user?.role === 'provider' ? 'received' : 'my');
  const [toast, setToast] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
const [reviewErrors, setReviewErrors] = useState({});
const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [view]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = view === 'received' 
        ? await bookingApi.getReceivedBookings()
        : await bookingApi.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    try {
      await bookingApi.cancel(cancelConfirm.id);
      showToast('Booking cancelled successfully');
      setCancelConfirm(null);
      fetchBookings();
    } catch (err) {
      console.error('Cancel error:', err);
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingApi.updateStatus(bookingId, newStatus);
      showToast(`Booking ${newStatus} successfully! Customer notified via email.`);
      setStatusUpdate(null);
      fetchBookings();
    } catch (err) {
      console.error('Status update error:', err);
      showToast('Failed to update status', 'error');
    }
  };

    const handleSubmitReview = async () => {
    if (reviewForm.rating === 0) {
      setReviewErrors({ rating: 'Please select a rating' });
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrors({});
    try {
      await reviewApi.create({
        bookingId: reviewModal.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null
      });
      showToast('Review submitted successfully!');
      setReviewModal(null);
      setReviewForm({ rating: 0, comment: '' });
      fetchBookings();
    } catch (err) {
      console.error('Review error:', err);
      setReviewErrors({ 
        general: err.response?.data?.message || 'Failed to submit review' 
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
      accepted: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Accepted' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' },
      completed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Completed' },
    };
    return config[status] || config.pending;
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

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
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
          toast.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1">
          {view === 'received' ? 'Manage booking requests from customers' : 'Track your service bookings'}
        </p>
      </div>

      {/* VIEW TOGGLE (only for providers) */}
      {user?.role === 'provider' && (
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          <button
            onClick={() => setView('received')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              view === 'received' 
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Received Requests
          </button>
          <button
            onClick={() => setView('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              view === 'my' 
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SendIcon className="w-4 h-4" />
            My Bookings
          </button>
        </div>
      )}

      {/* STATUS FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'completed', label: 'Completed' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === tab.id ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
          </h3>
          <p className="text-slate-500 mb-6">
            {view === 'received' 
              ? 'When customers book your services, they will appear here.' 
              : 'Browse services and book your first one!'}
          </p>
          {view !== 'received' && (
            <button
              onClick={() => navigate('/dashboard/browse')}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg"
            >
              Browse Services
            </button>
          )}
        </div>
      ) : (
        /* BOOKINGS LIST */
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const statusBadge = getStatusBadge(booking.status);
            const isMyBookings = view === 'my' || user?.role !== 'provider';
            
            return (
              <div 
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 lg:p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  
                  {/* LEFT: Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                            {booking.categoryName}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{booking.listingTitle}</h3>
                      </div>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-slate-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">
                        {isMyBookings ? 'Service Provider' : 'Customer'}
                      </p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(isMyBookings ? booking.providerName : booking.customerName).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {isMyBookings ? booking.providerName : booking.customerName}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                            <a 
                              href={`mailto:${isMyBookings ? booking.providerEmail : booking.customerEmail}`}
                              className="flex items-center gap-1 hover:text-violet-600"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">
                                {isMyBookings ? booking.providerEmail : booking.customerEmail}
                              </span>
                            </a>
                            {(isMyBookings ? booking.providerPhone : booking.customerPhone) && (
                              <a 
                                href={`tel:${isMyBookings ? booking.providerPhone : booking.customerPhone}`}
                                className="flex items-center gap-1 hover:text-violet-600"
                              >
                                <Phone className="w-3 h-3" />
                                +91 {isMyBookings ? booking.providerPhone : booking.customerPhone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                      <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1">Message</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line line-clamp-3">{booking.message}</p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.listingLocation}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-700 font-semibold">₹{booking.listingPrice}</span>
                      </div>
                      {booking.preferredDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Actions */}
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                    <button
                      onClick={() => navigate(`/dashboard/listing/${booking.listingId}`)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Service
                    </button>

                    {/* Customer Actions */}
                                        {/* Write Review Button (Customer for completed bookings) */}
                    {isMyBookings && booking.status === 'completed' && (
                      <button
                        onClick={() => { 
                          setReviewModal(booking); 
                          setReviewForm({ rating: 0, comment: '' });
                          setReviewErrors({});
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        Write Review
                      </button>
                    )}

                    {/* Provider Actions */}
                    {!isMyBookings && booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'accepted')}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'rejected')}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {/* Mark Completed (Provider for accepted bookings) */}
                    {!isMyBookings && booking.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'completed')}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Booking?</h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to cancel your booking for <strong>"{cancelConfirm.listingTitle}"</strong>?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
        
        
      )}
            {/* WRITE REVIEW MODAL */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Write a Review</h3>
              <p className="text-sm text-slate-500">{reviewModal.listingTitle}</p>
            </div>

            <div className="p-6 space-y-5">
              
              {reviewErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{reviewErrors.general}</p>
                </div>
              )}

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  How would you rate this service? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center gap-2 py-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => { 
                        setReviewForm({ ...reviewForm, rating: star });
                        if (reviewErrors.rating) setReviewErrors({ ...reviewErrors, rating: '' });
                      }}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-12 h-12 transition-colors ${
                          star <= reviewForm.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-slate-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm font-medium text-slate-600 mt-2">
                  {reviewForm.rating === 0 && 'Tap a star to rate'}
                  {reviewForm.rating === 1 && '😞 Poor'}
                  {reviewForm.rating === 2 && '😐 Fair'}
                  {reviewForm.rating === 3 && '🙂 Good'}
                  {reviewForm.rating === 4 && '😊 Very Good'}
                  {reviewForm.rating === 5 && '🤩 Excellent!'}
                </p>
                {reviewErrors.rating && (
                  <p className="text-xs text-red-600 mt-1 text-center">{reviewErrors.rating}</p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Share your experience <span className="text-slate-400">(Optional)</span>
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows="4"
                  maxLength="1000"
                  placeholder="What did you like or dislike about this service?"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
                />
                <p className="text-xs text-slate-400 text-right mt-1">{reviewForm.comment.length}/1000</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setReviewModal(null); setReviewForm({ rating: 0, comment: '' }); }}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || reviewForm.rating === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>


    
    
    

  );
}

export default Bookings;