import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingApi } from '../api/listingApi';
import { bookingApi } from '../api/bookingApi';
import { tokenStorage } from '../utils/tokenStorage';
import { reviewApi } from '../api/reviewApi';
import { 
  ArrowLeft,
  MapPin, 
  Star, 
  Heart,
  Share2,
  Calendar,
  Phone,
  Mail,
  Shield,
  Award,
  Clock,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  Frown,
  Loader2,
  X,
  Send,
  AlertCircle
} from 'lucide-react';

const getListingImages = (listing) => {
  if (listing.imageUrls && listing.imageUrls.length > 0) {
    return listing.imageUrls;
  }
  
  const imageMap = {
    'Plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80',
    'Tutor': 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=1200&q=80',
    'Cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
    'Carpenter': 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=1200&q=80',
    'Painter': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80',
    'AC Repair': 'https://images.unsplash.com/photo-1631545806609-073f5c39d2b9?w=1200&q=80',
    'Gardener': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
  };
  return [imageMap[listing.categoryName] || 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80'];
};

const getCategoryImage = (categoryName) => {
  const imageMap = {
    'Plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80',
    'Tutor': 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=1200&q=80',
    'Cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
    'Carpenter': 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=1200&q=80',
    'Painter': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80',
    'AC Repair': 'https://images.unsplash.com/photo-1631545806609-073f5c39d2b9?w=1200&q=80',
    'Gardener': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
  };
  return imageMap[categoryName] || 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80';
};

function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  
  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const [reviews, setReviews] = useState([]);
const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, fiveStars: 0, fourStars: 0, threeStars: 0, twoStars: 0, oneStar: 0 });
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    message: '',
    preferredDate: '',
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchListing();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingApi.getById(id);
      setListing(data);
      
      try {
        const similar = await listingApi.getAll({ 
          categoryId: data.categoryId, 
          pageSize: 4 
        });
        setSimilarListings((similar.data || []).filter(l => l.id !== data.id).slice(0, 3));
      } catch (e) {
        console.error('Similar listings error:', e);
      }

      // Fetch reviews
      try {
        const [reviewsData, statsData] = await Promise.all([
          reviewApi.getListingReviews(data.id),
          reviewApi.getListingStats(data.id)
        ]);
        setReviews(reviewsData);
        setReviewStats(statsData);
      } catch (e) {
        console.error('Reviews fetch error:', e);
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err);
      setError(err.response?.status === 404 ? 'Listing not found' : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        });
      } catch (e) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleOpenBookingModal = () => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Provider can't book own listing
    if (user.userId === listing.providerId) {
      alert("You cannot book your own listing!");
      return;
    }

    setBookingForm({ message: '', preferredDate: '' });
    setBookingErrors({});
    setBookingSuccess(false);
    setShowBookingModal(true);
  };

  const validateBooking = () => {
    const errors = {};
    if (!bookingForm.message.trim()) {
      errors.message = 'Message is required';
    } else if (bookingForm.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!validateBooking()) return;

    setIsBooking(true);
    setBookingErrors({});

    try {
      const payload = {
        listingId: parseInt(id),
        message: bookingForm.message.trim(),
        preferredDate: bookingForm.preferredDate 
          ? new Date(bookingForm.preferredDate).toISOString() 
          : null,
      };

      await bookingApi.create(payload);
      setBookingSuccess(true);
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowBookingModal(false);
        navigate('/dashboard/bookings');
      }, 2500);
    } catch (err) {
      console.error('Booking error:', err);
      setBookingErrors({ 
        general: err.response?.data?.message || 'Failed to submit booking. Please try again.' 
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Frown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">{error || 'Listing not found'}</h2>
          <p className="text-slate-500 mb-6">This listing may have been removed or doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg"
          >
            Browse Other Services
          </button>
        </div>
      </div>
    );
  }

  // Min date for date picker (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-violet-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/dashboard/browse" className="hover:text-violet-600 transition-colors">Browse</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/dashboard/browse?categoryId=${listing.categoryId}`} className="hover:text-violet-600 transition-colors">
          {listing.categoryName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 truncate">{listing.title}</span>
      </nav>

      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        
        {/* LEFT: MAIN CONTENT */}
        <div className="space-y-6">
                    {/* Hero Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden bg-slate-100">
              <img
                src={getListingImages(listing)[currentImageIdx]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {/* Top-right actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all"
                >
                  <Share2 className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              {/* Bottom-left category badge */}
              <span className="absolute bottom-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-md text-sm font-semibold text-violet-700 rounded-full shadow-lg">
                {listing.categoryName}
              </span>
              
              {/* Image counter (if multiple) */}
              {getListingImages(listing).length > 1 && (
                <span className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                  {currentImageIdx + 1} / {getListingImages(listing).length}
                </span>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {getListingImages(listing).length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getListingImages(listing).map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      currentImageIdx === idx 
                        ? 'border-violet-500 scale-105 shadow-lg' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          
            
            

          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-700">
                      {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : 'No ratings'}
                    </span>
                    <span className="text-slate-400">
                      {reviewStats.totalReviews > 0 
                        ? `(${reviewStats.totalReviews} ${reviewStats.totalReviews === 1 ? 'review' : 'reviews'})` 
                        : '(Be the first!)'}
                    </span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {listing.location}
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />Insured
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                <Award className="w-3 h-3" />Top Rated
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3" />Fast Response
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About this service</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">What's included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Professional service delivery', 'Tools & equipment included', 'Service warranty', 'Free quote estimate', 'Punctual & reliable', 'Quality guaranteed'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Service Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Category</p>
                <p className="font-semibold text-slate-900">{listing.categoryName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Location</p>
                <p className="font-semibold text-slate-900">{listing.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Listed On</p>
                <p className="font-semibold text-slate-900">
                  {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: BOOKING SIDEBAR */}
        <div className="lg:sticky lg:top-24 space-y-6 h-fit">
          
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg">
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-slate-900">₹{listing.price}</span>
                <span className="text-sm text-slate-500">starting</span>
              </div>
              <p className="text-xs text-slate-500">Final price may vary based on requirements</p>
            </div>

            <button 
              onClick={handleOpenBookingModal}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg shadow-violet-200 mb-3 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Now
            </button>
            
            <button 
              onClick={() => setShowContact(!showContact)}
              className="w-full py-3 bg-white border-2 border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 mb-3 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {showContact ? 'Hide Contact' : 'Contact Provider'}
            </button>

            {showContact && (
              <div className="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Phone</p>
                    <a href={`tel:${listing.providerPhone}`} className="text-sm font-semibold text-slate-900 hover:text-violet-600 truncate block">
                      {listing.providerPhone || 'Not provided'}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Email</p>
                    <a href={`mailto:${listing.providerEmail}`} className="text-sm font-semibold text-slate-900 hover:text-violet-600 truncate block">
                      {listing.providerEmail}
                    </a>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Secure & verified provider
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Service Provider</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {listing.providerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{listing.providerName}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.9</span>
                  <span>•</span>
                  <span>234 jobs done</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Member since</span>
                <span className="font-semibold text-slate-900">2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Response time</span>
                <span className="font-semibold text-green-600">~ 30 mins</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Languages</span>
                <span className="font-semibold text-slate-900">Hindi, English</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR LISTINGS */}
      {similarListings.length > 0 && (
        <div className="pt-8">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-6">Similar Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarListings.map(item => (
              <div key={item.id} onClick={() => navigate(`/dashboard/listing/${item.id}`)} className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer">
                <div className="relative h-40 overflow-hidden">
                  <img src={getCategoryImage(item.categoryName)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-xs font-semibold text-violet-700 rounded-full">
                    {item.categoryName}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-violet-600 transition-colors mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">by {item.providerName}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-slate-900">₹{item.price}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-slate-700">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* BOOKING MODAL */}
      {/* ============================================ */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Book This Service</h2>
                <p className="text-sm text-slate-500 mt-0.5">{listing.title}</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            {bookingSuccess ? (
              // Success State
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Submitted! 🎉</h3>
                <p className="text-slate-600 mb-4">
                  Your request has been sent to <strong>{listing.providerName}</strong>.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Confirmation email sent to your inbox
                  </p>
                </div>
                <p className="text-sm text-slate-500">Redirecting to My Bookings...</p>
                <Loader2 className="w-5 h-5 text-violet-600 animate-spin mx-auto mt-3" />
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="p-6 space-y-5">
                
                {/* Provider Info Card */}
                <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {listing.providerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{listing.providerName}</p>
                    <p className="text-xs text-slate-500">Will receive your request via email</p>
                  </div>
                </div>

                {bookingErrors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{bookingErrors.general}</p>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={bookingForm.message}
                    onChange={(e) => {
                      setBookingForm({ ...bookingForm, message: e.target.value });
                      if (bookingErrors.message) setBookingErrors({ ...bookingErrors, message: '' });
                    }}
                    rows="5"
                    placeholder="Hi! I need this service for... (describe your requirements)"
                    className={`w-full px-4 py-3 bg-white border ${bookingErrors.message ? 'border-red-400' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none`}
                  />
                  {bookingErrors.message && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {bookingErrors.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{bookingForm.message.length} / 1000 characters</p>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Date <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={bookingForm.preferredDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                    min={today}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Service Summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Service</span>
                    <span className="font-semibold text-slate-900 truncate ml-2">{listing.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Starting Price</span>
                    <span className="font-semibold text-slate-900">₹{listing.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Location</span>
                    <span className="font-semibold text-slate-900">{listing.location}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Booking Request
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  By booking, you agree to share your contact info with the provider.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingDetail;