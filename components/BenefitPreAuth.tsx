
import React, { useState } from 'react';
import { simulatePreAuth } from '../services/geminiService';
import { INSURANCE_PROVIDERS } from '../constants';
import { HospitalLevel } from '../types';

interface Props {
  selectedInsuranceId: string;
}

const BenefitPreAuth: React.FC<Props> = ({ selectedInsuranceId }) => {
  const [procedure, setProcedure] = useState('');
  const [hospitalLevel, setHospitalLevel] = useState(HospitalLevel.LEVEL_4);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedure) return;
    setLoading(true);
    const provider = INSURANCE_PROVIDERS.find(p => p.id === selectedInsuranceId)?.name || "NHIF";
    const res = await simulatePreAuth(procedure, provider, hospitalLevel);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.48V22" /></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Pre-Authorization Simulator</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Claims Logic</p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Intended Procedure</label>
          <input 
            type="text" 
            placeholder="e.g. Brain MRI, Hernia Surgery"
            value={procedure}
            onChange={e => setProcedure(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Hospital Referral Level</label>
          <select 
            value={hospitalLevel}
            onChange={e => setHospitalLevel(e.target.value as HospitalLevel)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 appearance-none"
          >
            {Object.values(HospitalLevel).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <button 
          disabled={loading}
          className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Analyzing Policy Rules..." : "Check Coverage Likelihood"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-100 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-3">
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${result.isCovered ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
               {result.isCovered ? 'LIKELY COVERED' : 'EXCLUSION WARNING'}
            </span>
            <span className="text-xs font-bold text-slate-400">{result.estimatedApprovalRate}% Confidence</span>
          </div>
          <p className="text-sm text-slate-700 mb-4">{result.reasoning}</p>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
             <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Recommended Action</p>
             <p className="text-xs font-bold text-slate-800">{result.actionRequired}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenefitPreAuth;
