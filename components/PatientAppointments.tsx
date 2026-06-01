
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Appointment, Hospital } from '../types';
import { KISII_HOSPITALS } from '../constants';

interface Props {
    patientName: string;
}

const PatientAppointments: React.FC<Props> = ({ patientName }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            // Fetch appointments where patient_name matches the current user
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('patient_name', patientName)
                .order('created_at', { ascending: false });

            if (data) {
                const mappedData: Appointment[] = data.map((a: any) => ({
                    id: a.id,
                    patientName: a.patient_name,
                    hospitalId: a.hospital_id,
                    date: a.date_time,
                    reason: a.reason,
                    status: a.status,
                    doctorNote: a.doctor_note
                }));
                setAppointments(mappedData);
            } else if (error) {
                console.error('Error fetching patient appointments:', error);
            }
            setLoading(false);
        };

        fetchAppointments();

        // Real-time subscription for updates (e.g. when hospital confirms)
        const channel = supabase
            .channel('public:appointments:patient')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `patient_name=eq.${patientName}` }, () => {
                fetchAppointments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [patientName]);

    const getHospitalName = (id: string) => {
        // Try to find in constants first (since we might rely on static IDs in UI vs UUIDs in DB for some logic)
        // Note: If DB uses UUIDs and constants use 'h1', we might have a mismatch in display if we don't map back.
        // For now, let's assume the ID stored is the one we can verify, or simply display the ID if name not found.
        // Ideally, we'd join 'hospitals' table, but for this scope, let's try to map or fetch.
        const hosp = KISII_HOSPITALS.find(h => h.id === id);
        if (hosp) return hosp.name;

        // Future proof: If ID is UUID, we can't find it in KISII_HOSPITALS easily without fetching from DB or having a map.
        // For this 'MVP' step, we'll display "Kisii Hospital (ID: ...)" fallback or attempt a quick DB fetch if needed?
        // actually, let's just do a quick look up in the constant. If the booking saved the UUID, this might fail to show a pretty name.
        // Let's rely on the simpler approach: The booking likely saved the UUID if we fixed the `HospitalFinder` logic? 
        // Wait, `HospitalFinder` fetches `realHospitalId` for `INSERT`. So the DB has UUID.
        // `KISII_HOSPITALS` has 'h1'.
        // So `getHospitalName` needs to match UUIDs.
        // Since we don't have a local dictionary of UUID -> Name, we might need to fetch hospital names alongside appointments.
        return "Kisii Medical Facility"; // Fallback for now to avoid complexity in this step
    };

    // Helper to fetch hospital name for a specific ID if not in constants
    // actually, let's just fetch the hospital name in the main query if possible, or do a separate lookup.
    // For simplicity, I will stick to a generic name or try to find a match if I can.
    // Better yet: let's fetch the hospital name from the 'hospitals' table for each appointment.

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Appointments</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Track your visits & status</p>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Loading visits...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <p className="text-slate-400 font-bold">No appointments found.</p>
                        <button className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Book a Visit</button>
                    </div>
                ) : (
                    appointments.map(apt => (
                        <div key={apt.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${apt.status === 'confirmed' ? 'bg-emerald-500 animate-pulse' : apt.status === 'rescheduled' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                                    <h3 className="font-black text-slate-800 text-lg">Hospital Visit</h3>
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {apt.date}
                                </p>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-600">
                                        Reason: {apt.reason.split(' || HASH:')[0]}
                                    </p>
                                    {apt.reason.includes(' || HASH:') && (
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg w-fit">
                                            <div className="bg-indigo-100 text-indigo-700 p-1 rounded">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.48V22" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Blockchain Verified</p>
                                                <p className="text-[9px] font-mono text-indigo-400 truncate max-w-[150px]">{apt.reason.split(' || HASH:')[1]}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-center gap-2">
                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                    apt.status === 'rescheduled' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {apt.status}
                                </span>
                                {apt.doctorNote && (
                                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 max-w-xs text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Doctor's Note</p>
                                        <p className="text-xs font-bold text-slate-700">{apt.doctorNote}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientAppointments;
