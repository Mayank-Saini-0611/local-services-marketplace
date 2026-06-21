import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { 
  Briefcase,
  Search, 
  MapPin,
  IndianRupee,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  PauseCircle,
  PlayCircle,
  Filter,
  Tag,
  User
} from 'lucide-react';

function AdminListings() {
  const navigate = useNavigate();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      
      const data = await adminApi.getAllListings(params);
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      showToast('Failed to load listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleToggleActive = async (listing) => {
    try {
      await adminApi.toggleListingActive(listing.id);
      showToast(`Listing ${listing.isActive ? 'deactivated' : 'activated'}`);
      fetchListings();
    } catch (err) {
      console.error('Toggle error:', err);
      showToast('Failed to update listing', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminApi.deleteListing(deleteConfirm.id);
      showToast('Listing permanently deleted');
      setDeleteConfirm(null);
      fetchListings();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete listing', 'error');
    }
  };

  const activeCount = listings.filter(l => l.isActive).length;
  const inactiveCount = listings.filter(l => !l.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
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
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Listings Management</h1>
        <p className="text-slate-500 mt-1">View, moderate, and manage all platform listings</p>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'all' 
              ? 'bg-slate-900 border-slate-900 text-white' 
              : 'bg-white border-slate-100 hover:border-slate-300'
          }`}
        >
          <Briefcase className={`w-5 h-5 mb-2 ${statusFilter === 'all' ? 'text-orange-400' : 'text-slate-400'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>{listings.length}</p>
          <p className={`text-xs ${statusFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>All Listings</p>
        </button>
        
        <button
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'active' 
              ? 'bg-green-600 border-green-600 text-white' 
              : 'bg-white border-slate-100 hover:border-green-300'
          }`}
        >
          <PlayCircle className={`w-5 h-5 mb-2 ${statusFilter === 'active' ? 'text-green-200' : 'text-green-500'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'active' ? 'text-white' : 'text-slate-900'}`}>{activeCount}</p>
          <p className={`text-xs ${statusFilter === 'active' ? 'text-green-100' : 'text-slate-500'}`}>Active</p>
        </button>
        
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`p-4 rounded-xl border transition-all text-left ${
            statusFilter === 'inactive' 
              ? 'bg-amber-600 border-amber-600 text-white' 
              : 'bg-white border-slate-100 hover:border-amber-300'
          }`}
        >
          <PauseCircle className={`w-5 h-5 mb-2 ${statusFilter === 'inactive' ? 'text-amber-200' : 'text-amber-500'}`} />
          <p className={`text-2xl font-bold ${statusFilter === 'inactive' ? 'text-white' : 'text-slate-900'}`}>{inactiveCount}</p>
          <p className={`text-xs ${statusFilter === 'inactive' ? 'text-amber-100' : 'text-slate-500'}`}>Inactive</p>
        </button>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title or provider name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-32 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:shadow-lg"
        >
          Search
        </button>
      </form>

      {/* LISTINGS */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No listings found</h3>
          <p className="text-slate-500">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div
              key={listing.id}
              className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-all ${
                listing.isActive ? 'border-slate-100' : 'border-amber-200 bg-amber-50/30'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                
                {/* Listing Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                      <Tag className="w-3 h-3" />
                      {listing.categoryName}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      listing.isActive 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {listing.isActive ? <PlayCircle className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-slate-400">ID: {listing.id}</span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-2">{listing.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{listing.description}</p>

                  {/* Provider Info */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <User className="w-3 h-3" />
                      <span className="font-semibold uppercase tracking-wider">Provider</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{listing.providerName}</p>
                    <p className="text-xs text-slate-500 truncate">{listing.providerEmail}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      <span className="font-semibold text-slate-700">₹{listing.price}</span>
                    </span>
                    <span>Created {new Date(listing.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                  <button
                    onClick={() => navigate(`/dashboard/listing/${listing.id}`)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>

                  <button
                    onClick={() => handleToggleActive(listing)}
                    className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${
                      listing.isActive 
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' 
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                  >
                    {listing.isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    {listing.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(listing)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Listing?</h3>
              <p className="text-sm text-slate-600">
                Permanently delete <strong>"{deleteConfirm.title}"</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                ⚠️ This is a hard delete. All related bookings will also be removed. Cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminListings;