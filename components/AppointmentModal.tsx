import React, { useState } from 'react';
import { Appointment } from '../types';
import { generateAppointmentHash } from '../services/blockchainLedger';

interface Props {
    hospitalId: string;
    hospitalName: string;
    userName: string;
    onClose: () => void;
    onSubmit: (apt: Appointment) => void;
}

const AppointmentModal: React.FC<Props> = ({ hospitalId, hospitalName, userName, onClose, onSubmit }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Generate Blockchain Hash
            const baseData = { p: userName, h: hospitalId, d: `${date} at ${time}`, r: reason };
            const hash = await generateAppointmentHash(baseData);

            const newAppointment: Appointment = {
                id: Date.now().toString(),
                patientName: userName,
                hospitalId,
                date: `${date} at ${time}`,
                reason,
                status: 'pending',
                blockchainHash: hash
            };

            // Wait for parent to confirm insert (throws if RLS fails)
            await onSubmit(newAppointment);

            alert("Request Sent! The facility will see your request immediately.");
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(`Booking Failed: ${err.message || 'Unknown Error'}. \n\nTip: Contact the admin if this persists.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Book Appointment</h2>
                    <p className="text-sm font-medium text-indigo-600 mt-1">at {hospitalName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Time</label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Reason for Visit</label>
                        <textarea
                            rows={3}
                            required
                            placeholder="e.g. Mild fever and headache..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m8-8h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
                                    Booking...
                                </>
                            ) : "Confirm Booking"}
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-4 font-medium">Your request will be sent to the facility admin immediately.</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
