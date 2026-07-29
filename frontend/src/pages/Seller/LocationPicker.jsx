import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { showErrorNotification } from '../../store/slices/uiSlice';

// Fix Leaflet's default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationUpdater({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom() < 15 ? 15 : map.getZoom());
        }
    }, [position, map]);
    return null;
}

const LocationPicker = ({ formData, setFormData }) => {
    // defaults to Riyadh if null
    const [position, setPosition] = useState(
        formData.latitude && formData.longitude 
        ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } 
        : { lat: 24.7136, lng: 46.6753 }
    );
    const [initialLoad, setInitialLoad] = useState(true);

    const fetchLocationDetails = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
            const data = await response.json();
            if (data && data.address) {
                return {
                    seller_city: data.address.city || data.address.town || data.address.village || data.address.region || data.address.state || '',
                    city: data.address.city || data.address.town || data.address.village || '',
                    state: data.address.state || '',
                    country: data.address.country || '',
                    postal_code: data.address.postcode || ''
                    // We explicitly exclude street/detailed address as requested
                };
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        }
        return {};
    };

    const markerRef = useRef(null)
    const eventHandlers = useMemo(
        () => ({
        async dragend() {
            const marker = markerRef.current
            if (marker != null) {
                const newPos = marker.getLatLng();
                setPosition(newPos);
                
                const locationDetails = await fetchLocationDetails(newPos.lat, newPos.lng);
                
                setFormData(prev => ({
                    ...prev,
                    latitude: newPos.lat,
                    longitude: newPos.lng,
                    ...locationDetails
                }));
            }
        },
        }),
        [setFormData],
    )

    useEffect(() => {
        // Only run geolocation automatically if latitude/longitude are null on initial load
        if (initialLoad && (!formData.latitude || !formData.longitude)) {
            requestLocation();
        }
        setInitialLoad(false);
    }, [formData.latitude, formData.longitude, initialLoad]);

    const requestLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const newPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    setPosition(newPos);
                    
                    const locationDetails = await fetchLocationDetails(newPos.lat, newPos.lng);
                    
                    setFormData(prev => ({
                        ...prev,
                        latitude: newPos.lat,
                        longitude: newPos.lng,
                        ...locationDetails
                    }));
                },
                (err) => {
                    console.error("Error getting location: ", err);
                    showErrorNotification('يرجى تحديد الموقع يدوياً. رفض المتصفح الوصول للموقع.');
                }
            );
        } else {
            showErrorNotification('متصفحك لا يدعم تحديد الموقع.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                     <p className="text-sm font-medium text-gray-700">تحديد موقع المستودع الجغرافي</p>
                     <p className="text-xs text-gray-500">قم بسحب الدبوس للحصول على اختيار دقيق</p>
                </div>
                <button
                    type="button"
                    onClick={requestLocation}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition shadow-sm"
                >
                    <MapPinIcon className="h-4 w-4" />
                    تحديد موقعي الحالي
                </button>
            </div>
            <div className="h-80 w-full rounded-lg border border-gray-300 relative z-0" style={{ isolation: 'isolate' }}>
                <MapContainer center={position} zoom={formData.latitude ? 15 : 6} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0, borderRadius: '0.5rem' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker 
                        position={position} 
                        draggable={true} 
                        eventHandlers={eventHandlers}
                        ref={markerRef}
                    >
                    </Marker>
                    <LocationUpdater position={position} />
                </MapContainer>
            </div>
            
            {formData.latitude && formData.longitude && (
                <div className="text-xs text-gray-500 flex gap-4 bg-gray-50 p-2 rounded w-fit">
                    <span>خط العرض: {Number(formData.latitude).toFixed(6)}</span>
                    <span>خط الطول: {Number(formData.longitude).toFixed(6)}</span>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
