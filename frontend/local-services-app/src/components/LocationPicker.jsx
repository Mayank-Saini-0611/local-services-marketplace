import { useState, useRef, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { indianCities } from '../data/indianCities';
import { 
  MapPin, 
  ChevronDown, 
  Search, 
  Navigation, 
  Loader2,
  Check,
  X
} from 'lucide-react';

function LocationPicker() {
  const { location, isDetecting, detectLocation, setManualLocation, error } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on search
  const filteredCities = searchQuery.trim()
    ? indianCities.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 50) // Limit to 50 results for performance
    : indianCities.slice(0, 20); // Show top 20 by default

  const handleSelectCity = (city) => {
    setManualLocation(city.name, city.state);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleDetectGPS = () => {
    detectLocation();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-xl transition-colors group max-w-[200px]"
      >
        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-violet-600" />
        </div>
        <div className="text-left min-w-0 hidden sm:block">
          <p className="text-xs text-slate-500 leading-tight">Location</p>
          <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
            {isDetecting ? 'Detecting...' : location.city}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
          
          {/* Header with Current Location */}
          <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-violet-100">Current Location</p>
                <p className="font-semibold truncate">{location.city}{location.state && `, ${location.state}`}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Detecting your location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Use Current Location (GPS)
                </>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search city or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* City List */}
          <div className="max-h-72 overflow-y-auto">
            {!searchQuery && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">
                Popular Cities
              </p>
            )}
            
            {filteredCities.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">No cities found for "{searchQuery}"</p>
                <p className="text-xs text-slate-400 mt-1">Try a different search</p>
              </div>
            ) : (
              filteredCities.map((city, idx) => (
                <button
                  key={`${city.name}-${city.state}-${idx}`}
                  onClick={() => handleSelectCity(city)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-violet-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{city.name}</p>
                      <p className="text-xs text-slate-500 truncate">{city.state}</p>
                    </div>
                  </div>
                  {location.city === city.name && (
                    <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-amber-50 border-t border-amber-200">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> {error}. Using default location.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationPicker;