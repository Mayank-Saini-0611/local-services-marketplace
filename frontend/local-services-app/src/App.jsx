import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Favorites from './pages/Favorites.jsx';
import BrowseServices from './pages/BrowseServices.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import MyListings from './pages/MyListings.jsx';
import Bookings from './pages/Bookings.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Messages from './pages/Messages.jsx';
import Earnings from './pages/Earnings.jsx';
import ProviderProfile from './pages/ProviderProfile.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminListings from './pages/AdminListings.jsx';
import AdminBookings from './pages/AdminBookings.jsx';
import AdminKyc from './pages/AdminKyc.jsx';
import AdminReviews from './pages/AdminReviews.jsx';
import AdminReports from './pages/AdminReports.jsx';
import NotificationToast from './components/NotificationToast.jsx';
import ChatToast from './components/ChatToast.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import FloatingThemeToggle from './components/FloatingThemeToggle.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* Theme switch for the public pages (login / register / etc.) */}
      <FloatingThemeToggle />
      <NotificationToast />
      <ChatToast />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* <-- ADD THIS ROUTE */}

        {/* Dashboard Routes (with shared layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="browse" element={<BrowseServices />} />
          <Route path="listing/:id" element={<ListingDetail />} />
          <Route path="my-listings" element={<MyListings />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="provider/:id" element={<ProviderProfile />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="kyc" element={<AdminKyc />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-violet-100 text-slate-900">
            <h1 className="text-4xl font-bold">404 — Page Not Found</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;