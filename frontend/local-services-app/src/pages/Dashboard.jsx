import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  Home,
  Search, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Settings,
  LogOut, 
  Bell,
  User,
  ChevronDown,
  Sparkles,
  Wrench,
  Zap,
  GraduationCap,
  Hammer,
  Paintbrush,
  Wind,
  TreePine,
  Star,
  MapPin,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Users,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };

  // Service categories
  const categories = [
    { name: 'Plumber', icon: Wrench, color: 'from-blue-500 to-cyan-500', count: '120+' },
    { name: 'Electrician', icon: Zap, color: 'from-yellow-500 to-orange-500', count: '95+' },
    { name: 'Tutor', icon: GraduationCap, color: 'from-purple-500 to-pink-500', count: '210+' },
    { name: 'Cleaner', icon: Sparkles, color: 'from-green-500 to-emerald-500', count: '180+' },
    { name: 'Carpenter', icon: Hammer, color: 'from-amber-600 to-orange-600', count: '75+' },
    { name: 'Painter', icon: Paintbrush, color: 'from-rose-500 to-pink-500', count: '60+' },
    { name: 'AC Repair', icon: Wind, color: 'from-sky-500 to-blue-500', count: '85+' },
    { name: 'Gardener', icon: TreePine, color: 'from-lime-500 to-green-500', count: '45+' },
  ];

  // Featured services
  const featuredServices = [
    {
      title: 'Premium Plumbing Service',
      provider: 'Rajesh Kumar',
      rating: 4.9,
      reviews: 234,
      price: '₹500/hr',
      location: 'Delhi NCR',
      image: '🔧',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Expert Electrician',
      provider: 'Amit Sharma',
      rating: 4.8,
      reviews: 189,
      price: '₹400/hr',
      location: 'Mumbai',
      image: '⚡',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Home Cleaning Pro',
      provider: 'Priya Singh',
      rating: 5.0,
      reviews: 412,
      price: '₹600/visit',
      location: 'Bangalore',
      image: '✨',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  // Sidebar items
  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Browse Services' },
    { id: 'bookings', icon: Calendar, label: 'My Bookings' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Activity items
  const activities = [
    { icon: CheckCircle2, color: 'green', text: 'Plumbing service completed successfully', time: '2 hours ago' },
    { icon: Star, color: 'yellow', text: 'You received a 5-star rating from Amit Sharma', time: '5 hours ago' },
    { icon: Calendar, color: 'blue', text: 'New booking request from Rahul Kumar', time: '1 day ago' },
    { icon: MessageCircle, color: 'purple', text: 'You have 3 new messages', time: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* ============ MOBILE SIDEBAR OVERLAY ============ */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ============ SIDEBAR ============ */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">LocalServices</h1>
              <p className="text-xs text-slate-500">Marketplace</p>
            </div>
          </div>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Menu</p>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-300' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        
        {/* ===== TOP HEADER ===== */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-lg bg-white/90">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between gap-3">
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search services, providers, categories..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
                    <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-xs text-violet-100 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">My Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Settings</span>
                      </button>
                      <hr className="my-2 border-slate-100" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ===== DASHBOARD CONTENT ===== */}
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          
          {/* ===== HERO GREETING ===== */}
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-6 lg:p-10 overflow-hidden">
            {/* Decorative shapes */}
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
                <button className="px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all shadow-lg">
                  Browse Services
                </button>
                <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30">
                  My Bookings
                </button>
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
              <button className="hidden sm:flex items-center gap-1 text-violet-600 font-semibold text-sm hover:gap-2 transition-all">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={idx}
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

          {/* ===== FEATURED SERVICES ===== */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Featured Services</h2>
                <p className="text-sm text-slate-500 mt-1">Top-rated professionals in your area</p>
              </div>
              <button className="hidden sm:flex items-center gap-1 text-violet-600 font-semibold text-sm hover:gap-2 transition-all">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {featuredServices.map((service, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer"
                >
                  {/* Image/Icon Header */}
                  <div className={`h-40 bg-gradient-to-br ${service.gradient} relative flex items-center justify-center text-7xl`}>
                    {service.image}
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{service.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">by {service.provider}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-slate-700">{service.rating}</span>
                      </div>
                      <span className="text-xs text-slate-400">({service.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      {service.location}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-lg font-bold text-slate-900">{service.price}</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-300 transition-all">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== ACTIVITY FEED ===== */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                <p className="text-sm text-slate-500 mt-1">Your latest interactions</p>
              </div>
              <button className="text-violet-600 font-semibold text-sm hover:underline">View all</button>
            </div>

            <div className="space-y-2">
              {activities.map((activity, idx) => {
                const Icon = activity.icon;
                
                // Get colors based on activity type
                const colorClasses = {
                  green: { bg: 'bg-green-50', text: 'text-green-600' },
                  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
                  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
                  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
                };
                
                const colors = colorClasses[activity.color];
                
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">{activity.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
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
                <p className="font-semibold text-slate-900">Dashboard is in development</p>
                <p className="text-sm text-slate-600 mt-0.5">More features coming soon — real listings, booking system, admin panel</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;