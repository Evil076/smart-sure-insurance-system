import React, { useEffect, useRef, useState } from 'react';
import { Hospital } from '../types';
import { KISII_CENTER } from '../constants';

interface MapViewProps {
    hospitals: Hospital[];
    selectedInsuranceId: string;
    userLocation?: { lat: number; lng: number } | null;
    onSelectHospital: (h: Hospital) => void;
}

const MapView: React.FC<MapViewProps> = ({ hospitals, selectedInsuranceId, userLocation, onSelectHospital }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Initial center function
    const recenterMap = () => {
        if (mapRef.current) {
            mapRef.current.flyTo([KISII_CENTER.lat, KISII_CENTER.lng], 14, {
                animate: true,
                duration: 1.5
            });
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        };

        try {
            if (!mapContainerRef.current) return;

            // 1. Initialize Leaflet Map Instance (Singleton pattern within the ref)
            if (!mapRef.current) {
                const L = (window as any).L;
                if (!L) {
                    console.error("Leaflet not loaded");
                    return;
                }

                mapRef.current = L.map(mapContainerRef.current, {
                    zoomControl: true,
                    scrollWheelZoom: true
                }).setView([KISII_CENTER.lat, KISII_CENTER.lng], 14);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                }).addTo(mapRef.current);

                // Force-refresh map layout to fix the "gray tiles" issue
                // We use a longer timeout and multiple calls to handle the 700ms CSS transition in the parent
                const refresh = () => {
                    if (mapRef.current) {
                        mapRef.current.invalidateSize();
                    }
                };
                setTimeout(refresh, 300);
                setTimeout(refresh, 800);
                setTimeout(refresh, 1500);
            }

            const L = (window as any).L;

            // 2. Clear existing markers
            markersRef.current.forEach(marker => {
                mapRef.current.removeLayer(marker);
            });
            markersRef.current = [];

            // 3. Filter hospitals
            const filtered = hospitals.filter(h =>
                h.accreditedProviders.includes(selectedInsuranceId) &&
                h.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // 4. Draw markers
            filtered.forEach(h => {
                // Create "Navigate" link
                const navUrl = userLocation
                    ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${h.latitude},${h.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${h.latitude},${h.longitude}`;

                const isAvailable = h.resources.availableBeds > 0;
                const markerColor = isAvailable ? 'bg-emerald-500' : 'bg-red-500';
                const shadowColor = isAvailable ? 'shadow-emerald-200' : 'shadow-red-200';

                const customIcon = L.divIcon({
                    className: 'hospital-marker',
                    html: `<div class="w-5 h-5 ${markerColor} rounded-full border-2 border-white shadow-lg ${shadowColor} flex items-center justify-center">
                             <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                           </div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10], // Center the icon
                    popupAnchor: [0, -10]
                });

                const marker = L.marker([h.latitude, h.longitude], { icon: customIcon })
                    .addTo(mapRef.current)
                    .bindPopup(`
          <div class="p-3 min-w-[180px] font-sans">
            <h3 class="font-black text-slate-900 text-sm leading-tight mb-1">${h.name}</h3>
            <p class="text-[10px] text-slate-500 mb-3">${h.contact}</p>
            <div class="flex items-center justify-between border-t border-slate-100 pt-2 gap-2">
              <div class="flex flex-col">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Category</span>
                <span class="text-[9px] font-black text-blue-600">${h.level}</span>
              </div>
              <div class="flex gap-1">
                 <a 
                    href="${navUrl}"
                    target="_blank"
                    class="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center"
                    title="Get Directions"
                  >
                    Go
                  </a>
                  <button 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm" 
                    id="details-btn-${h.id}"
                  >
                    Details
                  </button>
              </div>
            </div>
          </div>
        `, {
                        className: 'custom-medical-popup',
                        closeButton: false
                    });

                // Bridge DOM to React key
                marker.on('popupopen', () => {
                    const btn = document.getElementById(`details-btn-${h.id}`);
                    if (btn) {
                        btn.onclick = (e: any) => {
                            e.preventDefault();
                            onSelectHospital(h);
                            marker.closePopup();
                        };
                    }
                });

                markersRef.current.push(marker);
            });

            // 5. User Location Marker
            if (userLocation) {
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: `<div class="relative w-6 h-6">
                             <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                             <div className="absolute inset-1 bg-blue-600 rounded-full border-2 border-white shadow-xl"></div>
                           </div>`,
                    iconSize: [24, 24]
                });
                const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                    .addTo(mapRef.current)
                    .bindPopup("You are here");
                markersRef.current.push(userMarker);

                // Optional: Force view to user location if it's the first load or significantly different (handled by consumer generally, but valid here too)
                // mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
            }

            // 6. Auto-pan (Search Priority)
            if (searchQuery && filtered.length === 1 && mapRef.current) {
                const h = filtered[0];
                mapRef.current.flyTo([h.latitude, h.longitude], 16, { animate: true, duration: 1 });
                markersRef.current[0].openPopup();
            } else if (userLocation && mapRef.current && !searchQuery) {
                // Auto-center on user if no active search
                // We use flyTo for smooth transition, but check distance to avoid jarring moves if already close
                const currentCenter = mapRef.current.getCenter();
                const dist = mapRef.current.distance(currentCenter, [userLocation.lat, userLocation.lng]);
                if (dist > 1000) { // Only fly if > 1km away
                    mapRef.current.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true, duration: 1.5 });
                }
            }

            window.addEventListener('resize', handleResize);

        } catch (e) {
            console.error("Map rendering error:", e);
        }

        // Cleanup: remove map instance when component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mapRef.current) {
                try {
                    mapRef.current.remove();
                } catch (e) { console.warn("Map cleanup failed", e); }
                mapRef.current = null;
            }
        };
    }, [hospitals, selectedInsuranceId, onSelectHospital, searchQuery, userLocation]);

    useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.invalidateSize();
        }
    }, [userLocation]);

    return (
        <div className="relative group overflow-hidden rounded-[2.5rem]">
            {/* Map Container */}
            <div
                ref={mapContainerRef}
                className="w-full h-[500px] shadow-2xl border-4 border-white z-0 bg-slate-100 transition-all duration-700"
            />

            {/* Search Bar Overlay */}
            <div className={`absolute top-6 right-6 z-[400] transition-all duration-300 ${isFocused ? 'w-64' : 'w-48'}`}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search hospitals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full bg-white/90 backdrop-blur-md pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 outline-none shadow-xl border border-white focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Recenter Button */}
            <button
                onClick={recenterMap}
                className="absolute bottom-20 right-6 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white text-slate-600 hover:text-indigo-600 hover:bg-white transition-all group/center"
                title="Recenter Map"
            >
                <svg className="w-5 h-5 group-hover/center:animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {/* Map Overlay Badge */}
            <div className="absolute top-6 left-6 flex space-x-2 pointer-events-none z-[400] hidden sm:flex">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Kisii Region Node</span>
                </div>
            </div>

            {/* Map Controls Tip */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[400]">
                <p className="text-[9px] font-bold text-white uppercase tracking-widest">Scroll to zoom • Click markers for details</p>
            </div>
        </div>
    );
};

export default MapView;
