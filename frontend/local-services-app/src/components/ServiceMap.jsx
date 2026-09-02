import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star } from 'lucide-react';

// --- FIX FOR LEAFLET ICONS IN REACT ---
// React-Leaflet has a known bug where default marker icons don't load correctly via Webpack/Vite.
// This overrides the default URLs to pull directly from the unpkg CDN.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom icon for the USER'S location (Red Pin)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Rough coordinates for major Indian cities (Used since we store city names as strings)
const CITY_COORDINATES = {
  'Delhi NCR': [28.6139, 77.2090],
  'Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Bangalore': [12.9716, 77.5946],
  'Pune': [18.5204, 73.8567],
  'Hyderabad': [17.3850, 78.4867],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873]
};

const DEFAULT_CENTER = [20.5937, 78.9629];

// Helper to get category image (matching BrowseServices)
const getListingImage = (listing) => {
  if (listing.imageUrls && listing.imageUrls.length > 0) return listing.imageUrls[0];
  const imageMap = {
    'Plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80',
    'Electrician': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80',
    'Tutor': 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=400&q=80',
    'Cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
    'Carpenter': 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=400&q=80',
    'Painter': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
    'AC Repair': 'https://images.unsplash.com/photo-1631545806609-073f5c39d2b9?w=400&q=80',
    'Gardener': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
  };
  return imageMap[listing.categoryName] || 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&q=80';
};

function ServiceMap({ listings, userLocation }) {
  const navigate = useNavigate();

  const center = userLocation?.latitude && userLocation?.longitude
    ? [userLocation.latitude, userLocation.longitude]
    : (CITY_COORDINATES[userLocation?.city] || DEFAULT_CENTER);

  const zoomLevel = userLocation?.city ? 11 : 5;

  // Coordinates are derived data. Memoizing them keeps marker positions stable between renders
  // and avoids an effect-driven render loop when the parent updates unrelated state.
  const mapListings = useMemo(() => listings.map((listing) => {
    const baseCoords = CITY_COORDINATES[listing.location] || DEFAULT_CENTER;

    // Add a small stable offset (approx 1-3 km scatter) so pins do not overlap.
    const offsetSeed = Number(listing.id) || 0;
    const offsetLat = ((offsetSeed % 11) - 5) * 0.005;
    const offsetLng = ((Math.floor(offsetSeed / 11) % 11) - 5) * 0.005;

    return {
      ...listing,
      mapLat: baseCoords[0] + offsetLat,
      mapLng: baseCoords[1] + offsetLng
    };
  }), [listings]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative z-0">
      <MapContainer
        center={center}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Display User's Current Location with a Radius Circle */}
        {userLocation?.latitude && userLocation?.longitude && (
          <>
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>
                <div className="font-bold text-slate-900">Your Location</div>
                <div className="text-xs text-slate-500">Searching nearby services</div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={15000}
              pathOptions={{ fillColor: '#8b5cf6', color: '#7c3aed', fillOpacity: 0.1, weight: 1 }}
            />
          </>
        )}

        {/* Display Providers */}
        {mapListings.map(listing => (
          <Marker key={listing.id} position={[listing.mapLat, listing.mapLng]}>
            <Popup className="custom-popup">
              <div className="w-48 overflow-hidden rounded-xl">
                <img
                  src={getListingImage(listing)}
                  alt={listing.title}
                  className="w-full h-24 object-cover rounded-t-lg"
                />
                <div className="p-3">
                  <span className="inline-block px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-bold rounded-full mb-1">
                    {listing.categoryName}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight mb-1">
                    {listing.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}
                    </div>
                    <div className="flex items-center text-sm font-bold text-slate-900">
                      ₹{listing.price}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/listing/${listing.id}`)}
                    className="w-full mt-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-lg hover:shadow-md transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default ServiceMap;
