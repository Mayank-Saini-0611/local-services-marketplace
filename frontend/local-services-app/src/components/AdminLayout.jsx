import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { tokenStorage } from '../utils/tokenStorage';
import { useNotifications } from '../context/NotificationContext';
import ThemeToggle from './ThemeToggle';
import { 
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  LogOut, 
  Bell,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Shield,
  ArrowLeft
} from 'lucide-react';

function AdminLayout() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
const [showNotifications, setShowNotifications] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };


  const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const handleNotificationClick = (notification) => {
  if (!notification.isRead) markAsRead(notification.id);
  if (notification.link) navigate(notification.link);
  setShowNotifications(false);
};

  const sidebarItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/listings', icon: Briefcase, label: 'Listings' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/admin')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-400">Local Services</p>
            </div>
          </div>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Management</p>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => 
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to App</span>
            </button>
          </div>
        </nav>

        {/* Admin Badge */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-orange-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-lg bg-white/95">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between gap-3">
            
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex-1 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-orange-700">ADMIN MODE</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
                 <ThemeToggle />
                            {/* Notifications Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-[600px] flex flex-col">
                      {/* Header */}
                      <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-between">
                        <div>
                          <p className="font-bold">Notifications</p>
                          <p className="text-xs text-violet-100">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg backdrop-blur-md transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                            <p className="text-xs text-slate-400 mt-1">You'll see updates here when they arrive</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {notifications.map(notif => (
                              <div
                                key={notif.id}
                                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors group ${
                                  !notif.isRead ? 'bg-violet-50/50' : ''
                                }`}
                                onClick={() => handleNotificationClick(notif)}
                              >
                                <div className="flex items-start gap-3">
                                  {!notif.isRead && (
                                    <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
                                  )}
                                  <div className={`flex-1 min-w-0 ${notif.isRead ? 'pl-5' : ''}`}>
                                    <p className="font-semibold text-slate-900 text-sm">{notif.title}</p>
                                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notif.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4 text-slate-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-xs text-orange-100 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <ArrowLeft className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">Back to App</span>
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

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;