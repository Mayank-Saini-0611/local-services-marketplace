import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';

const LocationContext = createContext();

const DEFAULT_LOCATION = {
  city: 'Delhi',
  state: 'Delhi',
  country: 'India',
  latitude: 28.6139,
  longitude: 77.2090,
  detected: false,
};

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  // Auto-detect location via GPS (wrapped in useCallback for stable reference)
  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const coords = await locationService.getCurrentPosition();
      const geocoded = await locationService.reverseGeocode(
        coords.latitude,
        coords.longitude
      );

      const newLocation = {
        city: geocoded.city,
        state: geocoded.state,
        country: geocoded.country,
        latitude: coords.latitude,
        longitude: coords.longitude,
        detected: true,
      };

      setLocation(newLocation);
      locationService.saveLocation(newLocation);
    } catch (err) {
      console.warn('Location detection failed:', err.message);
      setError(err.message);
      setLocation(DEFAULT_LOCATION);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Manually set location (from city picker)
  const setManualLocation = useCallback(async (cityName, stateName) => {
    setIsDetecting(true);
    setError(null);

    try {
      const coords = await locationService.forwardGeocode(cityName);
      
      const newLocation = {
        city: cityName,
        state: stateName || '',
        country: 'India',
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        detected: false,
      };

      setLocation(newLocation);
      locationService.saveLocation(newLocation);
    } catch (err) {
      console.error('Failed to set location:', err);
      const newLocation = {
        city: cityName,
        state: stateName || '',
        country: 'India',
        latitude: null,
        longitude: null,
        detected: false,
      };
      setLocation(newLocation);
      locationService.saveLocation(newLocation);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Clear and re-detect
  const refreshLocation = useCallback(() => {
    locationService.clearLocation();
    detectLocation();
  }, [detectLocation]);

  // On mount: check for saved location, else try GPS
  useEffect(() => {
    const saved = locationService.getSavedLocation();
    if (saved) {
      setLocation(saved);
    } else {
      detectLocation();
    }
  }, [detectLocation]);

  const value = {
    location,
    isDetecting,
    error,
    detectLocation,
    setManualLocation,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}