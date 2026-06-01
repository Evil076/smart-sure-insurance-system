
import React, { useState } from 'react';
import { getPredictiveRecommendation } from '../services/geminiService';
import { UserProfile } from '../types';
import { INSURANCE_PROVIDERS } from '../constants';

interface Props {
  profile: UserProfile;
}

const PredictiveAdvisor: React.FC<Props> = ({ profile }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    const rec = await getPredictiveRecommendation(profile);
    setResult(rec);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">AI Predictive Match</h2>
        <p className="text-sm text-slate-500">Analyzes your profile ({profile.age} yrs, {profile.dependents} dependents) to find the optimal insurance tier.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex items-center justify-between border border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Current Profile Sync</p>
          <p className="text-sm font-bold text-slate-700">Budget: KES {profile.monthlyBudget?.toLocaleString() ?? '5,000'}/mo</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Priority</p>
          <p className="text-sm font-bold text-indigo-600 capitalize">{profile.priority ?? 'cost'}</p>
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Running Data Models...</span>
          </>
        ) : "Regenerate AI Prediction"}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Recommended Plan</p>
              <h3 className="text-xl font-bold text-emerald-900">{INSURANCE_PROVIDERS.find(p => p.id === result.providerId)?.name}</h3>
            </div>
            <div className="bg-white px-3 py-1 rounded-full border border-emerald-100">
              <p className="text-[8px] font-black text-emerald-400 uppercase leading-none mb-0.5">Match</p>
              <p className="text-lg font-black text-emerald-600 leading-none">{result.matchScore}%</p>
            </div>
          </div>
          <p className="text-emerald-800 text-sm leading-relaxed bg-white/50 p-4 rounded-xl border border-emerald-100/50 italic">
            "{result.reasoning}"
          </p>
        </div>
      )}

      {!result && !loading && (
        <div className="mt-8 text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-400 font-medium italic">"Click the button to run a predictive analysis on your profile data."</p>
        </div>
      )}
    </div>
  );
};

export default PredictiveAdvisor;
