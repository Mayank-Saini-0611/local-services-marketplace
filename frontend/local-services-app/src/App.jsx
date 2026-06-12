import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import BrowseServices from './pages/BrowseServices.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import MyListings from './pages/MyListings.jsx';
import Bookings from './pages/Bookings.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard Routes (with shared layout) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default dashboard home */}
          <Route index element={<Dashboard />} />
          
          {/* Browse Services (REAL page now) */}
          <Route path="browse" element={<BrowseServices />} />
          
          {/* Listing detail */}
          {/* Listing detail */}
<Route path="listing/:id" element={<ListingDetail />} />
          
          {/* My Listings (Providers) */}
        {/* My Listings (Providers) */}
<Route path="my-listings" element={<MyListings />} />
          
          <Route path="bookings" element={<Bookings />} />
          <Route path="favorites" element={
            <PlaceholderPage 
              title="Favorites" 
              description="Your saved service providers."
              week="Future updates"
            />
          } />
          <Route path="messages" element={
            <PlaceholderPage 
              title="Messages" 
              description="Chat with service providers."
              week="Future updates"
            />
          } />
          <Route path="settings" element={
            <PlaceholderPage 
              title="Settings" 
              description="Manage your account settings."
              week="Future updates"
            />
          } />
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