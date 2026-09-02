import { useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import LocationPicker from './LocationPicker';
import ThemeToggle from './ThemeToggle';
import { tokenStorage } from '../utils/tokenStorage';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { useTranslation } from 'react-i18next';
import {
  Home, Search, Calendar, Heart, MessageCircle,
  Settings, LogOut, Bell, User, ChevronDown,
  Sparkles, Menu, X, Briefcase, Shield
} from 'lucide-react';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = tokenStorage.getUser();
  const { t } = useTranslation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { unreadCount: chatUnread } = useChat();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };

  const isBrowsePage = location.pathname === '/dashboard/browse';

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
    { path: '/dashboard', icon: Home, label: t('sidebar.home') },
    { path: '/dashboard/browse', icon: Search, label: t('sidebar.browseServices') },
    { path: '/dashboard/bookings', icon: Calendar, label: t('sidebar.myBookings') },
    { path: '/dashboard/favorites', icon: Heart, label: t('sidebar.favorites') },
    { path: '/dashboard/messages', icon: MessageCircle, label: t('sidebar.messages'), badge: chatUnread },
    { path: '/dashboard/settings', icon: Settings, label: t('sidebar.settings') },
  ];

  if (user.role === 'provider') {
    sidebarItems.splice(2, 0, {
      path: '/dashboard/my-listings',
      icon: Briefcase,
      label: t('sidebar.myListings')
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>

        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">LocalServices</h1>
              <p className="text-xs text-slate-500">{t('sidebar.marketplace')}</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">{t('sidebar.menu')}</p>
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
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* SIDEBAR USER INFO (Shows Avatar if available) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-violet-200">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 backdrop-blur-lg">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Conditionally render Search bar */}
            {!isBrowsePage ? (
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services, providers, categories..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all text-slate-700 dark:text-white placeholder-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        navigate(`/dashboard/browse?search=${encodeURIComponent(e.target.value.trim())}`);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LocationPicker />

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 max-h-[600px] flex flex-col">
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

                      <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map(notif => (
                              <div
                                key={notif.id}
                                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                                  !notif.isRead ? 'bg-violet-50/50 dark:bg-violet-950/30' : ''
                                }`}
                                onClick={() => handleNotificationClick(notif)}
                              >
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{notif.title}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* TOP HEADER AVATAR (Shows Avatar if available) */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-violet-200">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                    <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-xs text-violet-100 truncate">{user.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setShowProfileMenu(false); navigate('/admin'); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-left text-sm"
                        >
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/dashboard/profile'); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left text-sm"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>{t('profile.myProfile')}</span>
                      </button>

                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/dashboard/settings'); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-left text-sm"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>{t('sidebar.settings')}</span>
                      </button>
                      
                      <hr className="my-1 border-slate-100 dark:border-slate-800" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-left text-sm font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{t('auth.signOut')}</span>
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

export default DashboardLayout;