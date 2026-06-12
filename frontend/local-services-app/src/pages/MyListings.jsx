import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingApi } from '../api/listingApi';
import { categoryApi } from '../api/categoryApi';
import { tokenStorage } from '../utils/tokenStorage';
import { 
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  MapPin,
  Tag,
  IndianRupee,
  FileText,
  Save,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

function MyListings() {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    location: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Redirect if not provider
  useEffect(() => {
    if (user && user.role !== 'provider') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingsData, categoriesData] = await Promise.all([
        listingApi.getMyListings(),
        categoryApi.getAll(),
      ]);
      setListings(listingsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to load listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setEditingListing(null);
    setFormData({
      categoryId: '',
      title: '',
      description: '',
      price: '',
      location: '',
      isActive: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (listing) => {
    setEditingListing(listing);
    setFormData({
      categoryId: String(listing.categoryId),
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      location: listing.location,
      isActive: listing.isActive,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingListing(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.categoryId) errors.categoryId = 'Please select a category';
    if (!formData.title.trim()) errors.title = 'Title is required';
    else if (formData.title.length < 5) errors.title = 'Title must be at least 5 characters';
    else if (formData.title.length > 150) errors.title = 'Title must be under 150 characters';
    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.length < 20) errors.description = 'Description must be at least 20 characters';
    if (!formData.price) errors.price = 'Price is required';
    else if (parseFloat(formData.price) < 0) errors.price = 'Price must be positive';
    if (!formData.location.trim()) errors.location = 'Location is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId: parseInt(formData.categoryId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        isActive: formData.isActive,
      };

      if (editingListing) {
        await listingApi.update(editingListing.id, payload);
        showToast('Listing updated successfully!');
      } else {
        await listingApi.create(payload);
        showToast('Listing created successfully!');
      }

      closeModal();
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save listing';
      setFormErrors({ general: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (listing) => {
    try {
      await listingApi.update(listing.id, {
        categoryId: listing.categoryId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        isActive: !listing.isActive,
      });
      showToast(`Listing ${listing.isActive ? 'paused' : 'activated'} successfully!`);
      fetchData();
    } catch (error) {
      console.error('Toggle error:', error);
      showToast('Failed to update listing', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await listingApi.delete(deleteConfirm.id);
      showToast('Listing deleted successfully!');
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete listing', 'error');
    }
  };

  const activeCount = listings.filter(l => l.isActive).length;
  const inactiveCount = listings.length - activeCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ===== TOAST ===== */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up ${
          toast.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-500 mt-1">Manage all your service listings</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg shadow-violet-200 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Listing
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{listings.length}</p>
              <p className="text-sm text-slate-500">Total Listings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <PauseCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{inactiveCount}</p>
              <p className="text-sm text-slate-500">Paused</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LISTINGS TABLE ===== */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No listings yet</h3>
          <p className="text-slate-500 mb-6">Start by creating your first service listing</p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div
              key={listing.id}
              className={`bg-white rounded-2xl border ${listing.isActive ? 'border-slate-100' : 'border-amber-200 bg-amber-50/30'} p-5 hover:shadow-lg transition-all`}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                
                {/* Listing Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 flex-1">{listing.title}</h3>
                    <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      listing.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {listing.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{listing.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-full font-medium">
                      <Tag className="w-3 h-3" />
                      {listing.categoryName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      <span className="font-semibold text-slate-700">₹{listing.price}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                  <button
                    onClick={() => navigate(`/dashboard/listing/${listing.id}`)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  <button
                    onClick={() => openEditModal(listing)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggleActive(listing)}
                    className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      listing.isActive 
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' 
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                  >
                    {listing.isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    <span className="hidden sm:inline">{listing.isActive ? 'Pause' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(listing)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* CREATE/EDIT MODAL */}
      {/* ============================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingListing ? 'Edit Listing' : 'Create New Listing'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {editingListing ? 'Update your service details' : 'Fill in the details to list your service'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {formErrors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{formErrors.general}</p>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border ${formErrors.categoryId ? 'border-red-400' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {formErrors.categoryId && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.categoryId}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Listing Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Expert Plumbing Service - 10 Years Experience"
                  maxLength="150"
                  className={`w-full px-4 py-3 bg-white border ${formErrors.title ? 'border-red-400' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                />
                <div className="flex justify-between mt-1">
                  {formErrors.title ? (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.title}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-xs text-slate-400">{formData.title.length}/150</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="5"
                  placeholder="Describe your service in detail - experience, specialties, what's included, etc. Minimum 20 characters."
                  className={`w-full px-4 py-3 bg-white border ${formErrors.description ? 'border-red-400' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Price + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Starting Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="500"
                      min="0"
                      className={`w-full pl-9 pr-4 py-3 bg-white border ${formErrors.price ? 'border-red-400' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                    />
                  </div>
                  {formErrors.price && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Service Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Delhi NCR"
                      className={`w-full pl-9 pr-4 py-3 bg-white border ${formErrors.location ? 'border-red-400' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100`}
                    />
                  </div>
                  {formErrors.location && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Active Toggle (only when editing) */}
              {editingListing && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Listing Status</p>
                    <p className="text-xs text-slate-500">Active listings are visible to customers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingListing ? 'Update Listing' : 'Create Listing'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Listing?</h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.
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

export default MyListings;