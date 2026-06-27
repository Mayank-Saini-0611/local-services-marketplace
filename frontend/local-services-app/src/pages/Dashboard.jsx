import { useState, useEffect } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Calendar, CheckCircle2, Star,
  Wrench, Zap, GraduationCap, Hammer, Paintbrush,
  Wind, TreePine, ArrowUpRight, TrendingUp,
  Briefcase, Clock, PackageCheck, Plus
} from 'lucide-react';




 const categories = [
    { nameKey: 'plumber',     icon: Wrench,        color: 'from-blue-500 to-cyan-500',    count: '120+', id: 1 },
    { nameKey: 'electrician', icon: Zap,           color: 'from-yellow-500 to-orange-500',count: '95+',  id: 2 },
    { nameKey: 'tutor',       icon: GraduationCap, color: 'from-purple-500 to-pink-500',  count: '210+', id: 3 },
    { nameKey: 'cleaner',     icon: Sparkles,      color: 'from-green-500 to-emerald-500',count: '180+', id: 4 },
    { nameKey: 'carpenter',   icon: Hammer,        color: 'from-amber-600 to-orange-600', count: '75+',  id: 5 },
    { nameKey: 'painter',     icon: Paintbrush,    color: 'from-rose-500 to-pink-500',    count: '60+',  id: 6 },
    { nameKey: 'acRepair',    icon: Wind,          color: 'from-sky-500 to-blue-500',     count: '85+',  id: 7 },
    { nameKey: 'gardener',    icon: TreePine,      color: 'from-lime-500 to-green-500',   count: '45+',  id: 8 },
  ];

function StatsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
          <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
          <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function ProviderStats({ stats }) {
   const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          {stats.activeListings > 0 && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {stats.activeListings} active
            </span>
          )}
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stats.totalListings}</p>
          <p className="text-sm text-slate-500">{t('dashboard.totalListings')}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          {stats.pendingBookings > 0 && (
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {stats.pendingBookings} pending
            </span>
          )}
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stats.totalBookings}</p>
             <p className="text-sm text-slate-500">{t('dashboard.bookingsReceived')}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <PackageCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stats.completedBookings}</p>
 <p className="text-sm text-slate-500">{t('dashboard.completed')}</p>      </div>

      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
          {stats.totalReviews > 0 && (
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              {stats.totalReviews} reviews
            </span>
          )}
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
          {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
        </p>
<p className="text-sm text-slate-500">{t('dashboard.avgRating')}</p>      </div>
    </div>
  );
}

function CustomerStats({ stats }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stats.totalBookings}</p>
 <p className="text-sm text-slate-500">{t('dashboard.totalBookings')}</p>      </div>

      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stats.pendingBookings}</p>
 <p className="text-sm text-slate-500">{t('dashboard.pending')}</p>      </div>

      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stats.completedBookings}</p>
 <p className="text-sm text-slate-500">{t('dashboard.completed')}</p>      </div>

      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stats.totalReviewsGiven}</p>
 <p className="text-sm text-slate-500">{t('dashboard.reviewsGiven')}</p>      </div>
    </div>
  );
}

function ProviderEmptyState({ onNavigate }) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-dashed border-violet-200 rounded-3xl p-10 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-200">
        <Briefcase className="w-10 h-10 text-white" />
      </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('dashboard.noListingsYet')}</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">{t('dashboard.noListingsDesc')}</p>
      <button
        onClick={onNavigate}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all"
      >
        <Plus className="w-5 h-5" />
               {t('dashboard.createFirstListing')}
      </button>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
    const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getMyStats()
      .then(data => setStats(data))
      .catch(err => console.error('Stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* HERO */}
      <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-6 lg:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 right-32 w-32 h-32 bg-white/10 rounded-full -mb-16" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
             {t('dashboard.welcomeBack')}
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
             {t('dashboard.hey')} {user.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-violet-100 text-base lg:text-lg mb-6 max-w-xl">
                        {user.role === 'provider' ? t('dashboard.providerWelcome') : t('dashboard.customerWelcome')}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard/browse')}
              className="px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all shadow-lg"
            >
               {t('common.browseServices')}
            </button>
            {user.role === 'provider' && (
              <button
                onClick={() => navigate('/dashboard/my-listings')}
                className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
              >
                 {t('sidebar.myListings')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      {loading && <StatsLoading />}
      {!loading && stats && user.role === 'provider' && <ProviderStats stats={stats} />}
      {!loading && stats && user.role !== 'provider' && <CustomerStats stats={stats} />}

      {/* PROVIDER EMPTY STATE */}
      {!loading && user.role === 'provider' && stats && stats.totalListings === 0 && (
        <ProviderEmptyState onNavigate={() => navigate('/dashboard/my-listings')} />
      )}

      {/* CATEGORIES */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
                       <h2 className="text-xl lg:text-2xl font-bold text-slate-900">{t('dashboard.browseByCategory')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('dashboard.findRightProfessional')}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="hidden sm:flex items-center gap-1 text-violet-600 font-semibold text-sm hover:gap-2 transition-all"
          >
              {t('common.viewAll')} <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/dashboard/browse?categoryId=${cat.id}`)}
                className="group bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100 transition-all text-left"
              >
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                   <p className="font-semibold text-slate-900 mb-1 text-sm lg:text-base">{t(`categories.${cat.nameKey}`)}</p>
                <p className="text-xs text-slate-500">{cat.count} {t('categories.providers')}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER BANNER */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 lg:p-6 border border-violet-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {user.role === 'provider'
                ? 'Grow your business — create quality listings!'
                : 'Real listings available now!'}
            </p>
            <p className="text-sm text-slate-600 mt-0.5">
              {user.role === 'provider'
                ? 'Click "My Listings" to create or manage your services'
                : 'Click "Browse Services" to find verified providers'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;