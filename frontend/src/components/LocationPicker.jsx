import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom styles to prevent map from overlaying content and style custom markers
const mapStyles = `
  .leaflet-container {
    z-index: 0 !important;
    font-family: inherit;
  }
  .leaflet-pane {
    z-index: 0 !important;
  }
  .leaflet-marker-pane {
    z-index: 1 !important;
  }
  .leaflet-popup-pane {
    z-index: 2 !important;
  }
  .custom-map-pin {
    animation: bounce 0.5s ease-out infinite alternate;
  }
  @keyframes bounce {
    0% { transform: translateY(0); }
    100% { transform: translateY(-5px); }
  }
  .loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(2px);
    z-index: 999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #f59e0b; /* Amber */
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Professional Modern Map Marker (Red Pin with drop shadow)
const pinSVG = `
<svg width="46" height="46" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#E11D48" stroke="#FFFFFF" stroke-width="1.5"/>
  <circle cx="12" cy="9" r="3.5" fill="#FFFFFF"/>
</svg>
`;

const modernIcon = new L.divIcon({
  className: 'bg-transparent border-0',
  html: `<div style="transform: translate(-50%, -100%); filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.15)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)); cursor: grab;">${pinSVG}</div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});


const LocationPicker = ({ onLocationSelect, initialPosition = null }) => {
  const [position, setPosition] = useState(initialPosition || [24.7136, 46.6753]); // Default: Riyadh
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [address, setAddress] = useState('');
  const [buildingDetails, setBuildingDetails] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = mapStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
         document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Geocoding function using OpenStreetMap Nominatim
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
        return data.display_name;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return '';
  }, []);

  // Professional 2-Step Location Fetching
  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setLoadingMsg('جاري الاتصال بالأقمار الصناعية (GPS)...');

    if (!navigator.geolocation) {
      setLoading(false);
      alert('متصفحك لا يدعم تحديد الموقع التلقائي. يرجى تحديد الموقع يدوياً على الخريطة.');
      return;
    }

    const handleSuccess = async (pos) => {
      const { latitude, longitude } = pos.coords;
      const newPos = [latitude, longitude];
      setPosition(newPos);
      
      setLoadingMsg('جاري تحديد اسم الشارع والعنوان...');
      const formattedAddress = await reverseGeocode(latitude, longitude);
      
      onLocationSelect({
        latitude,
        longitude,
        formatted_address: formattedAddress,
        building_details: buildingDetails
      });
      
      setLoading(false);
    };

    const handleLowAccuracyFallback = () => {
      setLoadingMsg('نجري محاولة أخيرة عبر شبكة الإنترنت المتاحة...');
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (error) => {
          setLoading(false);
          alert('تعذر تحديد موقعك بدقة. الرجاء تحديد موقعك يدوياً عبر سحب الدبوس على الخريطة لمكانك.');
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: Infinity }
      );
    };

    // Step 1: Try High Accuracy GPS first
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (error) => {
        // High accuracy failed or timed out. Let's try low accuracy fallback!
        console.warn('High Accuracy GPS failed. Falling back to IP/Wifi based location...', error);
        handleLowAccuracyFallback();
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 } // wait 6 secs max for real GPS
    );

  }, [reverseGeocode, onLocationSelect, buildingDetails]);

  // Handle map clicks
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const newPos = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        reverseGeocode(newPos[0], newPos[1]).then(formattedAddress => {
          onLocationSelect({
            latitude: newPos[0],
            longitude: newPos[1],
            formatted_address: formattedAddress,
            building_details: buildingDetails
          });
        });
      }
    });
    return null;
  };

  // FlyTo animation when position changes programmatically
  const MapCenterUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (position && position.length === 2 && !isNaN(position[0]) && !isNaN(position[1])) {
        // Fly smoothly to exactly Street/Neighborhood Level (zoom: 16)
        map.flyTo(position, 16, { animate: true, duration: 1.5 });
      }
    }, [position, map]);
    return null;
  };

  const eventHandlers = React.useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          const latLngArr = [newPos.lat, newPos.lng];
          setPosition(latLngArr);
          
          const formattedAddress = await reverseGeocode(newPos.lat, newPos.lng);
          onLocationSelect({
            latitude: newPos.lat,
            longitude: newPos.lng,
            formatted_address: formattedAddress,
            building_details: buildingDetails
          });
        }
      },
    }),
    [reverseGeocode, onLocationSelect, buildingDetails]
  );

  const handleBuildingDetailsChange = (e) => {
    const details = e.target.value;
    setBuildingDetails(details);
    onLocationSelect({
      latitude: position[0],
      longitude: position[1],
      formatted_address: address,
      building_details: details
    });
  };

  return (
    <div className="space-y-4 relative">
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-medium text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {loading ? 'جاري التحقق...' : 'تحديد موقعي التلقائي (GPS)'}
        </button>
        <span className="text-xs text-gray-500">
          (يمكنك سحب الدبوس للحصول على عنوان دقيق جداً)
        </span>
      </div>

      <div className="h-[420px] rounded-xl overflow-hidden border-2 border-gray-200 relative z-0 shadow-inner group">
        
        {loading && (
          <div className="loading-overlay">
            <div className="spinner mb-4"></div>
            <p className="text-sm font-semibold text-gray-800">{loadingMsg}</p>
          </div>
        )}

        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          className="z-0"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="z-0"
          />
          <MapEvents />
          <MapCenterUpdater />
          <Marker 
            position={position} 
            draggable={!loading}
            icon={modernIcon}
            ref={markerRef}
            eventHandlers={eventHandlers}
          >
          </Marker>
        </MapContainer>
        
        {/* Helper Badge Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 z-[9] pointer-events-none transition-opacity text-xs font-semibold text-gray-700 flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          يمكنك النقر على أي مساحة!
        </div>
      </div>

      <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
       <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            العنوان المقروء من الخريطة
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium text-gray-800"
            placeholder="سيتم كتابة العنوان تلقائياً عند وضع الدبوس..."
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            تفاصيل إضافية للوصول للمتجر (اختياري)
          </label>
          <input
            type="text"
            value={buildingDetails}
            onChange={handleBuildingDetailsChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white placeholder-gray-400 text-sm"
            placeholder="مثال: بالقرب من مستشفى الثورة، خلف بقالة الحمد... إلخ"
          />
        </div>

        <div className="text-xs text-gray-500 font-mono mt-2 bg-gray-100 px-3 py-2 rounded flex justify-between">
          <p>Latitude: <span className="text-gray-800 font-bold">{position[0].toFixed(6)}</span></p>
          <p>Longitude: <span className="text-gray-800 font-bold">{position[1].toFixed(6)}</span></p>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
