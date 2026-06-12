import { tokenStorage } from '../utils/tokenStorage';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Star,
  Users,
  Wrench,
  Zap,
  GraduationCap,
  Hammer,
  Paintbrush,
  Wind,
  TreePine,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  if (!user) return null;

  const categories = [
    { name: 'Plumber', icon: Wrench, color: 'from-blue-500 to-cyan-500', count: '120+', id: 1 },
    { name: 'Electrician', icon: Zap, color: 'from-yellow-500 to-orange-500', count: '95+', id: 2 },
    { name: 'Tutor', icon: GraduationCap, color: 'from-purple-500 to-pink-500', count: '210+', id: 3 },
    { name: 'Cleaner', icon: Sparkles, color: 'from-green-500 to-emerald-500', count: '180+', id: 4 },
    { name: 'Carpenter', icon: Hammer, color: 'from-amber-600 to-orange-600', count: '75+', id: 5 },
    { name: 'Painter', icon: Paintbrush, color: 'from-rose-500 to-pink-500', count: '60+', id: 6 },
    { name: 'AC Repair', icon: Wind, color: 'from-sky-500 to-blue-500', count: '85+', id: 7 },
    { name: 'Gardener', icon: TreePine, color: 'from-lime-500 to-green-500', count: '45+', id: 8 },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ===== HERO GREETING ===== */}
      <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-6 lg:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 right-32 w-32 h-32 bg-white/10 rounded-full -mb-16"></div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            Welcome Back
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
            Hey {user.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-violet-100 text-base lg:text-lg mb-6 max-w-xl">
            Find trusted local services or manage your bookings. What do you need today?
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard/browse')}
              className="px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all shadow-lg"
            >
              Browse Services
            </button>
            {user.role === 'provider' && (
              <button
                onClick={() => navigate('/dashboard/my-listings')}
                className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
              >
                My Listings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">24</p>
          <p className="text-sm text-slate-500">Total Bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">18</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">★</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">4.9</p>
          <p className="text-sm text-slate-500">Avg Rating</p>
        </div>

        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">+24</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">156</p>
          <p className="text-sm text-slate-500">Providers</p>
        </div>
      </div>

      {/* ===== SERVICE CATEGORIES ===== */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Browse by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Find the right professional for your needs</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="hidden sm:flex items-center gap-1 text-violet-600 font-semibold text-sm hover:gap-2 transition-all"
          >
            View All <ArrowUpRight className="w-4 h-4" />
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
                <p className="font-semibold text-slate-900 mb-1 text-sm lg:text-base">{cat.name}</p>
                <p className="text-xs text-slate-500">{cat.count} providers</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Footer Info ===== */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 lg:p-6 border border-violet-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Real listings now available!</p>
            <p className="text-sm text-slate-600 mt-0.5">Click "Browse Services" to see all real listings from our database</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;