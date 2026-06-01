import React, { useState, useEffect } from 'react';
import { KISII_HOSPITALS, INSURANCE_PROVIDERS, KISII_CENTER } from '../constants';
import { sortHospitalsByDistance } from '../services/geoService';
import { AppMode, Appointment, Hospital, UserProfile } from '../types';
import MapView from './MapView';
import AppointmentModal from './AppointmentModal';
import { supabase } from '../services/supabaseClient';

interface Props {
  mode: AppMode;
  selectedInsuranceId: string;
  userProfile?: UserProfile | null;
  dbHospitals: Hospital[];
}

const HospitalFinder: React.FC<Props> = ({ mode, selectedInsuranceId, userProfile, dbHospitals }) => {
  const [userLoc, setUserLoc] = useState<{ lat: number, lng: number }>(KISII_CENTER);
  const [nearby, setNearby] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<{ id: string, name: string } | null>(null);


  const handleBookAppointment = async (apt: Appointment) => {
    // Insert into Supabase
    // MVP: Store blockchain hash in reason field since we can't alter schema
    const reasonWithHash = apt.blockchainHash
      ? `${apt.reason} || HASH:${apt.blockchainHash}`
      : apt.reason;

    const { error } = await supabase.from('appointments').insert([{
      hospital_id: apt.hospitalId,
      patient_name: apt.patientName,
      date_time: apt.date,
      reason: reasonWithHash,
      status: 'pending'
    }]);

    if (error) throw error;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      const success = (pos: GeolocationPosition) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      };

      const errorHighAcc = (err: GeolocationPositionError) => {
        console.warn("High accuracy GPS failed in Finder, trying low accuracy...", err);
        navigator.geolocation.getCurrentPosition(
          success,
          (errLow) => console.warn("Location completely failed, using default", errLow),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      };

      navigator.geolocation.getCurrentPosition(
        success,
        errorHighAcc,
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (userLoc && dbHospitals.length > 0) {
      const sorted = sortHospitalsByDistance(userLoc.lat, userLoc.lng, dbHospitals, selectedInsuranceId);
      setNearby(sorted);
    }
  }, [userLoc, selectedInsuranceId, mode, dbHospitals]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Facilities Map</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Bed & Specialist Audit</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-2 rounded-xl uppercase border border-emerald-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Network Online
          </span>
        </div>
      </div>

      {mode === AppMode.STANDARD && (
        <MapView
          hospitals={nearby}
          selectedInsuranceId={selectedInsuranceId}
          userLocation={userLoc}
          onSelectHospital={(h) => alert(`Selected: ${h.name}`)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nearby.map(h => (
          <div key={h.id} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-indigo-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="max-w-[75%]">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-lg text-slate-800 leading-tight">{h.name}</h3>
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{h.level}</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-[10px] font-black">4.8</span>
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" /></svg>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${h.resources.availableBeds > 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}>
                  {h.resources.availableBeds} BEDS
                </div>
                <p className="text-[9px] text-slate-400 font-black mt-2 uppercase tracking-[0.2em]">{h.distance.toFixed(1)} km</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {h.resources.specialists.filter((s: any) => s.isOnDuty).map((s: any, i: number) => (
                <span key={i} className="bg-slate-50 text-slate-600 text-[9px] font-black px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  {s.field}
                </span>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4">
              <a href={`tel:${h.contact}`} className="bg-slate-900 text-white text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Call Now</a>
              <button
                onClick={() => setSelectedHospital({ id: h.id, name: h.name })}
                className="bg-indigo-50 text-indigo-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
              >
                Book Visit
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedHospital && (
        <AppointmentModal
          hospitalId={selectedHospital.id}
          hospitalName={selectedHospital.name}
          userName={userProfile?.name || "Guest Patient"}
          onClose={() => setSelectedHospital(null)}
          onSubmit={handleBookAppointment}
        />
      )}
    </div>
  );
};

export default HospitalFinder;
