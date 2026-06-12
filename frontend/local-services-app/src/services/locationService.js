// ============================================
// Location Service
// Handles GPS detection, reverse geocoding, and storage
// ============================================

const LOCATION_STORAGE_KEY = 'userLocation';

export const locationService = {
  // Get user's current GPS coordinates
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let message = 'Unable to retrieve your location';
          if (error.code === 1) message = 'Location permission denied';
          if (error.code === 2) message = 'Location unavailable';
          if (error.code === 3) message = 'Location request timeout';
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },

  // Convert coordinates to city name using OpenStreetMap Nominatim API (FREE)
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
        {
          headers: {
            'User-Agent': 'LocalServicesMarketplace/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      const address = data.address || {};

      // Build city name from available fields
      const city = address.city 
                || address.town 
                || address.village 
                || address.suburb 
                || address.county 
                || 'Unknown';

      const state = address.state || '';
      const country = address.country || 'India';

      return {
        city,
        state,
        country,
        fullAddress: data.display_name,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  },

  // Forward geocode: city name → coordinates (for manual city selection)
  forwardGeocode: async (cityName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName + ', India')}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'LocalServicesMarketplace/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      if (data.length === 0) return null;

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    } catch (error) {
      console.error('Forward geocoding error:', error);
      return null;
    }
  },

  // Save location to localStorage
  saveLocation: (location) => {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  },

  // Get saved location from localStorage
  getSavedLocation: () => {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  // Clear saved location
  clearLocation: () => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  },

  // Calculate distance between two coordinates (Haversine formula in km)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  },
};