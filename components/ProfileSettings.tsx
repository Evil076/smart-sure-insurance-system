
import React from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

const ProfileSettings: React.FC<Props> = ({ profile, onUpdate }) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Profile & Preferences</h2>
        <p className="text-sm text-slate-500">Keep your details updated for better AI recommendations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={e => onUpdate({ age: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Number of Dependents</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, '4+'].map(num => (
                <button
                  key={num}
                  onClick={() => onUpdate({ dependents: typeof num === 'string' ? 5 : num })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${(profile.dependents === num || (num === '4+' && profile.dependents >= 4))
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Monthly Budget (KES: {(profile.monthlyBudget ?? 5000).toLocaleString()})</label>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={profile.monthlyBudget ?? 5000}
              onChange={e => onUpdate({ monthlyBudget: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold">
              <span>500</span>
              <span>10,000</span>
              <span>20,000+</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Insurance Priority</label>
            <select
              value={profile.priority ?? 'cost'}
              onChange={e => onUpdate({ priority: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
            >
              <option value="cost">Lowest Premiums (Save Money)</option>
              <option value="coverage">Maximum Hospital Network</option>
              <option value="maternity">Maternity & Childcare Focus</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Major Life Event (Predictive)</label>
            <select
              value={profile.lifeEvent ?? 'none'}
              onChange={e => onUpdate({ lifeEvent: e.target.value as any })}
              className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900 transition-all"
            >
              <option value="none">No Major Events Planned</option>
              <option value="pregnancy">Planning Pregnancy (12 Months)</option>
              <option value="surgery">Scheduled Surgery</option>
              <option value="elderly_care">Elderly Parent Under Care</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Employment Type (Impacts SHA Cost)</label>
            <select
              value={profile.employmentType ?? 'formal'}
              onChange={e => onUpdate({ employmentType: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
            >
              <option value="formal">Formal Employment (Payslip)</option>
              <option value="informal">Informal / Self-Employed</option>
              <option value="student">Student / Dependent</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Preferred Hospital Tier</label>
            <select
              value={profile.preferredHospitalTier ?? 'mid-tier'}
              onChange={e => onUpdate({ preferredHospitalTier: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
            >
              <option value="public">Public Hospitals (Level 2-5)</option>
              <option value="mid-tier">Private Mid-Tier (Mission/Local)</option>
              <option value="premium">Premium Facilities (Global Care)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-50 space-y-6">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-4">Chronic Health Markers (Impacts AI Priority)</label>

          <div className="space-y-6">
            {[
              { label: 'Metabolic & Cardiac', items: ['Diabetes', 'Hypertension', 'Cardiac Condition', 'Obesity'] },
              { label: 'Respiratory & Immune', items: ['Asthma', 'COPD', 'HIV/AIDS Care', 'Autoimmune'] },
              { label: 'Specialized Care', items: ['Cancer (Oncology)', 'Renal (Kidney)', 'Mental Health', 'Arthritis'] }
            ].map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(condition => {
                    const isSelected = profile.chronicConditions?.includes(condition);
                    return (
                      <button
                        key={condition}
                        onClick={() => {
                          const current = profile.chronicConditions ?? [];
                          const next = isSelected
                            ? current.filter(c => c !== condition)
                            : [...current, condition];
                          onUpdate({ chronicConditions: next });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${isSelected
                          ? 'bg-red-50 border-red-200 text-red-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        {isSelected && <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>}
                        {condition}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-50">
        <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            Real-world Note: Changes here will automatically retrain your <b>Predictive Match AI</b> results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
