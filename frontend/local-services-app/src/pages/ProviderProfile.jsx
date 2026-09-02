import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providerApi } from '../api/providerApi';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Star, MapPin, Briefcase, Calendar, 
  CheckCircle2, Shield, Mail, Phone, Loader2, Frown
} from 'lucide-react';

const getListingImage = (listing) => {
  if (listing.imageUrls && listing.imageUrls.length > 0) return listing.imageUrls[0];
  const imageMap = {
    'Plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
    'Tutor': 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=800&q=80',
    'Cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'Carpenter': 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=800&q=80',
    'Painter': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
    'AC Repair': 'https://images.unsplash.com/photo-1631545806609-073f5c39d2b9?w=800&q=80',
    'Gardener': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  };
  return imageMap[listing.categoryName] || 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&q=80';
};

function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'reviews'

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, listingsData, reviewsData] = await Promise.all([
        providerApi.getProfile(id),
        providerApi.getListings(id),
        providerApi.getReviews(id)
      ]);
      setProfile(profileData);
      setListings(listingsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Provider not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <Frown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">{error}</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 font-medium">
        <ArrowLeft className="w-4 h-4" /> {t('common.back')}
      </button>

      {/* HERO PROFILE CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700"></div>
        <div className="px-6 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
            <div className="w-32 h-32 rounded-2xl shadow-xl ring-4 ring-white bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
              <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                {profile.fullName}
                {profile.kycStatus === 'verified' && <Shield className="w-6 h-6 text-blue-500 fill-blue-500" title="Verified Professional" />}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Member since {new Date(profile.memberSince).getFullYear()}</span>
              </p>
            </div>
            {/* Quick Stats in Header */}
                        {/* Quick Stats in Header */}
            <div className="flex gap-6 mt-4 md:mt-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{profile.totalJobsCompleted ?? 0}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Jobs Done</p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-1">
                  {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : '—'} <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{profile.totalReviews ?? 0} Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('services')}
          className={`pb-4 px-6 font-semibold text-sm transition-colors relative ${activeTab === 'services' ? 'text-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Services Offered ({listings.length})
          {activeTab === 'services' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 px-6 font-semibold text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Customer Reviews ({reviews.length})
          {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-full"></div>}
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 ? (
            <p className="text-slate-500 col-span-full py-8 text-center">No active services currently offered.</p>
          ) : (
            listings.map(listing => (
              <div key={listing.id} onClick={() => navigate(`/dashboard/listing/${listing.id}`)} className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-all overflow-hidden cursor-pointer">
                <div className="relative h-48">
                  <img src={getListingImage(listing)} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-xs font-semibold text-violet-700 rounded-full">{listing.categoryName}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-violet-600 mb-2">{listing.title}</h3>
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-700">{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}</span>
                    <span>•</span><MapPin className="w-3 h-3" /> {listing.location}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-lg font-bold text-slate-900">₹{listing.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                        {review.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{review.customerName}</p>
                        <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="pl-13">
                    <p className="text-xs font-semibold text-violet-600 mb-1">Service: {review.listingTitle}</p>
                    {review.comment && <p className="text-sm text-slate-700 whitespace-pre-line">{review.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProviderProfile;