import React, { useState } from 'react';
import { sortHospitalsByDistance } from '../services/geoService';
import { KISII_HOSPITALS } from '../constants';
import { Hospital } from '../types';

const EmergencySOS: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [nearest, setNearest] = useState<(Hospital & { distance: number })[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);

    const handleEmergency = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        const success = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            setUserLoc({ lat: latitude, lng: longitude });
            // Sort all hospitals by distance, ignoring insurance filter for emergency
            const sorted = sortHospitalsByDistance(latitude, longitude, KISII_HOSPITALS);
            // Take top 3
            setNearest(sorted.slice(0, 3));
            setLoading(false);
        };

        const errorHighAcc = (err: GeolocationPositionError) => {
            console.warn("High accuracy GPS failed, trying low accuracy...", err);
            // Fallback to low accuracy (IP/Wifi based)
            navigator.geolocation.getCurrentPosition(
                success,
                (errLow) => {
                    console.error("Low accuracy GPS failed", errLow);
                    setError("Unable to access your location. Please check your device settings.");
                    setLoading(false);
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
            );
        };

        // First attempt: High Accuracy (GPS)
        navigator.geolocation.getCurrentPosition(
            success,
            errorHighAcc,
            { enableHighAccuracy: true, timeout: 2500, maximumAge: 60000 }
        );
    };

    const handleClose = () => {
        setNearest(null);
    };

    return (
        <>
            <div className="bg-red-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-red-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-11h2v2h-2V9zm0 4h2v5h-2v-5z" /></svg>
                </div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                    <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                    Emergency SOS
                </h3>
                <p className="text-xs font-bold text-red-100 mb-6 leading-relaxed">Instantly locate the nearest help. We'll find the closest facilities to your current GPS location.</p>
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/20 mb-2">
                        <p className="text-[10px] font-bold text-red-100 uppercase tracking-widest mb-1">Your Current Location</p>
                        {userLoc ? (
                            <p className="text-white font-mono text-xs">Lat: {userLoc.lat.toFixed(4)}, Lng: {userLoc.lng.toFixed(4)} <span className="text-red-300">(GPS High-Accuracy)</span></p>
                        ) : (
                            <p className="text-white/50 text-xs italic">Waiting for GPS signal...</p>
                        )}
                    </div>

                    <button
                        onClick={handleEmergency}
                        disabled={loading}
                        className="w-full bg-white text-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m8-8h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
                                Acquiring Satellite Lock...
                            </>
                        ) : (
                            "Find Nearest Help Now"
                        )}
                    </button>
                    <a href="tel:999" className="w-full bg-red-700/50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-800 transition-all text-center block">
                        Call Ambulance (999)
                    </a>
                </div>
                {error && <p className="mt-4 text-xs font-bold text-red-200 bg-red-800/20 p-2 rounded-lg">{error}</p>}
            </div>

            {/* Results Modal */}
            {nearest && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nearest Help</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Based on your GPS location</p>
                            </div>
                            <button onClick={handleClose} className="bg-slate-100 p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {nearest.map((h, index) => (
                                <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                    {index === 0 && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Closest</div>}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{h.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{h.level}</p>
                                        </div>
                                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">{h.distance.toFixed(1)} KM</span>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <a href={`tel:${h.contact}`} className="flex-1 bg-red-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-red-100 hover:bg-red-700 transition-colors">
                                            Call Now
                                        </a>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-200 transition-colors"
                                        >
                                            Navigate
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] text-slate-400 font-medium">Always call 999 for life-threatening emergencies.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmergencySOS;
