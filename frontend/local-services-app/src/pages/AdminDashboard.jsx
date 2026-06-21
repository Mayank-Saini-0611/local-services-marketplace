import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { 
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  UserCheck,
  UserPlus,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Loader2,
  Activity,
  PackageCheck
} from 'lucide-react';

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, growthData, activityData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getGrowthAnalytics(),
        adminApi.getRecentActivity(),
      ]);
      setStats(statsData);
      setGrowth(growthData);
      setActivity(activityData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  // CHARTS DATA
  const usersChartData = {
    labels: growth?.usersGrowth?.map(d => d.label) || [],
    datasets: [
      {
        label: 'New Users',
        data: growth?.usersGrowth?.map(d => d.value) || [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 5,
      },
    ],
  };

  const bookingsChartData = {
    labels: growth?.bookingsGrowth?.map(d => d.label) || [],
    datasets: [
      {
        label: 'New Bookings',
        data: growth?.bookingsGrowth?.map(d => d.value) || [],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const categoryChartData = {
    labels: growth?.categoryDistribution?.map(c => c.categoryName) || [],
    datasets: [
      {
        label: 'Listings',
        data: growth?.categoryDistribution?.map(c => c.listingsCount) || [],
        backgroundColor: [
          '#8b5cf6', '#f97316', '#10b981', '#3b82f6', 
          '#ef4444', '#f59e0b', '#06b6d4', '#84cc16'
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 } }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right',
        labels: { 
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
        }
      },
    },
  };

  const getActivityIcon = (type) => {
    if (type === 'user_registered') return { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' };
    if (type === 'listing_created') return { icon: PackageCheck, color: 'text-green-600', bg: 'bg-green-50' };
    if (type === 'booking_created') return { icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' };
    return { icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' };
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening on your platform.</p>
      </div>

      {/* STAT CARDS - First Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +{stats?.newUsersThisWeek || 0} this week
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-slate-500">Total Users</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-violet-600">{stats?.totalCustomers || 0} customers</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600">{stats?.totalProviders || 0} providers</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              +{stats?.newListingsThisWeek || 0} new
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats?.totalListings || 0}</p>
          <p className="text-sm text-slate-500">Total Listings</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-green-600">{stats?.activeListings || 0} active</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-600">{stats?.inactiveListings || 0} paused</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              +{stats?.newBookingsToday || 0} today
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats?.totalBookings || 0}</p>
          <p className="text-sm text-slate-500">Total Bookings</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-amber-600">{stats?.pendingBookings || 0} pending</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Revenue
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500">From {stats?.completedBookings || 0} completed</p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Users Growth Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">User Growth</h3>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
            <div className="inline-flex items-center gap-1 text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              Trending
            </div>
          </div>
          <div className="h-64">
            <Line data={usersChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Categories</h3>
            <p className="text-xs text-slate-500">Listings distribution</p>
          </div>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Bookings Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Bookings Trend</h3>
              <p className="text-xs text-slate-500">Daily bookings - Last 7 days</p>
            </div>
          </div>
          <div className="h-64">
            <Bar data={bookingsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-4">Booking Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm text-slate-700">Pending</span>
              </div>
              <span className="font-bold text-slate-900">{stats?.pendingBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-slate-700">Accepted</span>
              </div>
              <span className="font-bold text-slate-900">{stats?.acceptedBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm text-slate-700">Rejected</span>
              </div>
              <span className="font-bold text-slate-900">{stats?.rejectedBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-slate-700">Completed</span>
              </div>
              <span className="font-bold text-slate-900">{stats?.completedBookings || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
            <p className="text-xs text-slate-500">Latest platform events</p>
          </div>
        </div>
        
        {activity.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item, idx) => {
              const { icon: Icon, color, bg } = getActivityIcon(item.type);
              return (
                <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">{item.userName}</span>
                      <span className="text-slate-500"> — {item.description}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(item.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;