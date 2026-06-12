import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import LocationPicker from './LocationPicker';
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
  Menu,
  X,
  Briefcase
} from 'lucide-react';

function DashboardLayout() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };

  // Sidebar items
  const sidebarItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/browse', icon: Search, label: 'Browse Services' },
    { path: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
    { path: '/dashboard/favorites', icon: Heart, label: 'Favorites' },
    { path: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  // Add "My Listings" for providers
  if (user.role === 'provider') {
    sidebarItems.splice(2, 0, { 
      path: '/dashboard/my-listings', 
      icon: Briefcase, 
      label: 'My Listings' 
    });
  }

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
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
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
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => 
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-300' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/dashboard/browse?search=${encodeURIComponent(e.target.value.trim())}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                <LocationPicker />
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
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

        {/* ===== PAGE CONTENT (Routed) ===== */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;