import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoriteApi } from '../api/favoriteApi';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  MapPin,
  Star,
  Loader2,
  Search,
  HeartCrack,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Category fallback images
const getListingImage = (listing) => {
  if (listing.imageUrls && listing.imageUrls.length > 0) {
    return listing.imageUrls[0];
  }
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

function Favorites() {
  const navigate = useNavigate();
    const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await favoriteApi.getAll();
      setFavorites(data);
    } catch (err) {
      console.error('Favorites error:', err);
      showToast('Failed to load favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemove = async (listingId, e) => {
    e.stopPropagation();
    try {
      await favoriteApi.remove(listingId);
      setFavorites(prev => prev.filter(f => f.id !== listingId));
      showToast('Removed from favorites');
    } catch (err) {
      console.error('Remove error:', err);
      showToast('Failed to remove', 'error');
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
             <Heart className="w-7 h-7 fill-red-500 text-red-500" />
            {t('favorites.myFavorites')}
          </h1>
          <p className="text-slate-500 mt-1">
            {favorites.length === 0
              ? t('favorites.noSavedServices')
              : `${favorites.length} ${favorites.length === 1 ? t('favorites.savedService') : t('favorites.savedServices')}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/browse')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all"
        >
           <Search className="w-4 h-4" />
            {t('favorites.browseMore')}
        </button>
      </div>

      {/* EMPTY STATE */}
      {favorites.length === 0 ? (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-dashed border-violet-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <HeartCrack className="w-10 h-10 text-violet-400" />
          </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('favorites.noFavoritesYet')}</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">{t('favorites.noFavoritesDesc')}</p>
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all"
          >
            <Search className="w-5 h-5" />
            {t('common.browseServices')}
          </button>
        </div>
      ) : (
        /* FAVORITES GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {favorites.map(listing => (
            <div
              key={listing.id}
              onClick={() => navigate(`/dashboard/listing/${listing.id}`)}
              className="group bg-white rounded-2xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getListingImage(listing)}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Remove favorite button */}
                <button
                  onClick={(e) => handleRemove(listing.id, e)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-50 group/heart transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover/heart:scale-110 transition-transform" />
                </button>
                {/* Category badge */}
                <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-xs font-semibold text-violet-700 rounded-full">
                  {listing.categoryName}
                </span>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-violet-600 transition-colors mb-1">
                  {listing.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2">by {listing.providerName}</p>

                <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-700">
                      {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}
                    </span>
                    {listing.reviewCount > 0 && (
                      <span className="text-slate-400">({listing.reviewCount})</span>
                    )}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.location}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900">₹{listing.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/listing/${listing.id}`);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;