import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providerApi } from '../api/providerApi';
import { safetyApi } from '../api/safetyApi';
import VerificationBadges from '../components/VerificationBadges';
import SafetyReportModal from '../components/SafetyReportModal';
import { tokenStorage } from '../utils/tokenStorage';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Star, MapPin, Calendar,
  Flag, Ban, Loader2, Frown
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
  const currentUser = tokenStorage.getUser();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'reviews'
  const [showReportModal, setShowReportModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockInProgress, setBlockInProgress] = useState(false);
  const [safetyNotice, setSafetyNotice] = useState(null);

  const fetchData = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    window.scrollTo(0, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [fetchData]);

  useEffect(() => {
    let active = true;
    safetyApi.getBlockedUsers()
      .then((blocks) => {
        if (active) setIsBlocked(blocks.some((block) => String(block.userId) === String(id)));
      })
      .catch(() => {
        // The public profile remains usable if the optional block lookup fails.
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleBlockToggle = async () => {
    if (!profile || blockInProgress) return;
    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} ${profile.fullName}?`)) return;

    setBlockInProgress(true);
    try {
      if (isBlocked) {
        await safetyApi.unblockUser(profile.id);
        setIsBlocked(false);
        setSafetyNotice(`${profile.fullName} has been unblocked.`);
      } else {
        await safetyApi.blockUser(profile.id);
        setIsBlocked(true);
        setSafetyNotice(`${profile.fullName} has been blocked. New messages and bookings are disabled.`);
      }
    } catch (requestError) {
      setSafetyNotice(requestError.response?.data?.message || `Unable to ${action} this provider.`);
    } finally {
      setBlockInProgress(false);
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
              </h1>
              <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Member since {new Date(profile.memberSince).getFullYear()}</span>
              </p>
              <VerificationBadges
                verification={profile.verification}
                legacyKycStatus={profile.kycStatus}
                className="mt-3 justify-center md:justify-start"
              />
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

      {String(currentUser?.userId) !== String(profile.id) && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {safetyNotice && (
            <p className="mr-auto text-sm text-slate-600 dark:text-slate-300" role="status">{safetyNotice}</p>
          )}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
          >
            <Flag className="h-4 w-4" /> Report provider
          </button>
          <button
            type="button"
            onClick={handleBlockToggle}
            disabled={blockInProgress}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {blockInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            {isBlocked ? 'Unblock provider' : 'Block provider'}
          </button>
        </div>
      )}

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
                  <VerificationBadges
                    verification={listing.providerVerification}
                    legacyKycStatus={listing.providerKycStatus}
                    compact
                    className="mb-2"
                  />
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

      {showReportModal && (
        <SafetyReportModal
          reportedUserId={profile.id}
          reportedUserName={profile.fullName}
          onClose={() => setShowReportModal(false)}
          onComplete={setSafetyNotice}
        />
      )}
    </div>
  );
}

export default ProviderProfile;