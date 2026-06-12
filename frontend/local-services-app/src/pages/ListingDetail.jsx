import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingApi } from '../api/listingApi';
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
  Loader2
} from 'lucide-react';

// Same image mapping as BrowseServices
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
  
  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);

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
      
      // Fetch similar listings from same category
      try {
        const similar = await listingApi.getAll({ 
          categoryId: data.categoryId, 
          pageSize: 4 
        });
        // Filter out current listing
        setSimilarListings((similar.data || []).filter(l => l.id !== data.id).slice(0, 3));
      } catch (e) {
        console.error('Similar listings error:', e);
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

  // Loading state
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

  // Error state
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ===== BREADCRUMB ===== */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-violet-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/dashboard/browse" className="hover:text-violet-600 transition-colors">Browse</Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          to={`/dashboard/browse?categoryId=${listing.categoryId}`} 
          className="hover:text-violet-600 transition-colors"
        >
          {listing.categoryName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 truncate">{listing.title}</span>
      </nav>

      {/* ===== BACK BUTTON ===== */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        
        {/* ===== LEFT: MAIN CONTENT ===== */}
        <div className="space-y-6">
          
          {/* Hero Image */}
          <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden bg-slate-100">
            <img
              src={getCategoryImage(listing.categoryName)}
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
          </div>

          {/* Title + Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-700">4.8</span>
                    <span className="text-slate-400">(234 reviews)</span>
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

            {/* Quick Trust Badges */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />
                Insured
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                <Award className="w-3 h-3" />
                Top Rated
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3" />
                Fast Response
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About this service</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">What's included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Professional service delivery',
                'Tools & equipment included',
                'Service warranty',
                'Free quote estimate',
                'Punctual & reliable',
                'Quality guaranteed'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Service Details */}
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

        {/* ===== RIGHT: BOOKING SIDEBAR ===== */}
        <div className="lg:sticky lg:top-24 space-y-6 h-fit">
          
          {/* Pricing & Booking Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg">
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-slate-900">₹{listing.price}</span>
                <span className="text-sm text-slate-500">starting</span>
              </div>
              <p className="text-xs text-slate-500">Final price may vary based on requirements</p>
            </div>

            {/* CTA Buttons */}
            <button 
              onClick={() => alert('Booking feature coming in Week 6!')}
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

            {/* Contact Info (toggles) */}
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

            {/* Trust Note */}
            <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Secure & verified provider
            </p>
          </div>

          {/* Provider Card */}
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

      {/* ===== SIMILAR LISTINGS ===== */}
      {similarListings.length > 0 && (
        <div className="pt-8">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-6">Similar Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarListings.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/dashboard/listing/${item.id}`)}
                className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={getCategoryImage(item.categoryName)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-xs font-semibold text-violet-700 rounded-full">
                    {item.categoryName}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-violet-600 transition-colors mb-1">
                    {item.title}
                  </h3>
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

    </div>
  );
}

export default ListingDetail;