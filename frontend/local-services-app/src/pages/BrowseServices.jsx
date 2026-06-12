import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { listingApi } from '../api/listingApi';
import { categoryApi } from '../api/categoryApi';
import { useLocation as useAppLocation } from '../context/LocationContext';
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  MapPin, 
  Star, 
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Frown,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

// Category image mapping using Unsplash
const getCategoryImage = (categoryName) => {
  const imageMap = {
    'Plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
    'Tutor': 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=800&q=80',
    'Cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'Carpenter': 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=800&q=80',
    'Painter': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
    'AC Repair': 'https://images.unsplash.com/photo-1631545806609-073f5c39d2b9?w=800&q=80',
    'Gardener': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  };
  return imageMap[categoryName] || 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&q=80';
};

function BrowseServices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLocation } = useAppLocation();
  
  // Data states
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  
  // Filter states (initialize from URL)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Fetch categories on mount
  useEffect(() => {
    categoryApi.getAll()
      .then(setCategories)
      .catch(err => console.error('Categories error:', err));
  }, []);

  // Build query params and fetch listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: 12,
      };
      
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (selectedCategory) params.categoryId = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (userLocation?.city && userLocation.city !== 'Delhi') params.location = userLocation.city;

      const response = await listingApi.getAll(params);
      
      let data = response.data || [];
      
      // Client-side sorting (backend orders by newest by default)
      if (sortBy === 'priceLow') {
        data = [...data].sort((a, b) => a.price - b.price);
      } else if (sortBy === 'priceHigh') {
        data = [...data].sort((a, b) => b.price - a.price);
      }
      
      setListings(data);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false,
      });
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, minPrice, maxPrice, sortBy, searchParams, userLocation]);

  // Fetch listings whenever filters change
  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchListings]);




  // Update URL when filters change
  useEffect(() => {
    const params = {};
    if (searchInput) params.search = searchInput;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sortBy !== 'newest') params.sort = sortBy;
    if (currentPage > 1) params.page = currentPage;
    setSearchParams(params, { replace: true });
  }, [searchInput, selectedCategory, minPrice, maxPrice, sortBy, currentPage, setSearchParams]);

  // Debounced search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (searchInput) params.set('search', searchInput);
      else params.delete('search');
      params.delete('page');
      return params;
    });
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(selectedCategory === String(catId) ? '' : String(catId));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasActiveFilters = searchInput || selectedCategory || minPrice || maxPrice || sortBy !== 'newest';

  return (
    <div className="space-y-6">
      
      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Browse Services</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading...' : `${pagination.totalCount} services available in ${userLocation?.city || 'India'}`}
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* ===== SEARCH BAR ===== */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search services... (e.g., plumber, electrician, tutor)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-12 pr-32 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all text-slate-700 placeholder-slate-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        
        {/* ===== SIDEBAR FILTERS ===== */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4`}>
          
          {/* Categories Filter */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  !selectedCategory ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === String(cat.id) ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Price Range (₹)</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Max Price</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort By
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
            >
              <option value="newest">Newest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2.5 text-violet-600 hover:bg-violet-50 border border-violet-200 rounded-xl text-sm font-medium transition-all"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ===== LISTINGS GRID/LIST ===== */}
        <div>
          
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchInput && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                  Search: {searchInput}
                  <button onClick={() => setSearchInput('')} className="hover:bg-violet-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && categories.find(c => String(c.id) === selectedCategory) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                  Category: {categories.find(c => String(c.id) === selectedCategory).name}
                  <button onClick={() => setSelectedCategory('')} className="hover:bg-violet-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                  Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:bg-violet-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <Frown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No services found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters or search terms</p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            // Listings Display
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
              {listings.map(listing => (
                viewMode === 'grid' ? (
                  // GRID CARD
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/dashboard/listing/${listing.id}`)}
                    className="group bg-white rounded-2xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getCategoryImage(listing.categoryName)}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => toggleFavorite(listing.id, e)}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white"
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
                      </button>
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-xs font-semibold text-violet-700 rounded-full">
                        {listing.categoryName}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-violet-600 transition-colors mb-1">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">by {listing.providerName}</p>
                      <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-slate-700">4.8</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        {listing.location}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-lg font-bold text-slate-900">₹{listing.price}</span>
                        <button className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // LIST CARD
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/dashboard/listing/${listing.id}`)}
                    className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-all overflow-hidden cursor-pointer flex flex-col sm:flex-row"
                  >
                    <div className="relative h-48 sm:h-auto sm:w-64 overflow-hidden flex-shrink-0">
                      <img
                        src={getCategoryImage(listing.categoryName)}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-xs font-semibold text-violet-700 rounded-full">
                        {listing.categoryName}
                      </span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">by {listing.providerName}</p>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(listing.id, e)}
                          className="p-2 hover:bg-slate-50 rounded-full"
                        >
                          <Heart className={`w-5 h-5 ${favorites.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{listing.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-slate-700">4.8</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.location}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                        <span className="text-2xl font-bold text-slate-900">₹{listing.price}</span>
                        <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && listings.length > 0 && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevious}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[40px] h-10 rounded-lg font-medium text-sm transition-all ${
                      currentPage === page 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!pagination.hasNext}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowseServices;