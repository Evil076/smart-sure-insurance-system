import React, { useState, useEffect } from 'react';
import { generateBlockhash } from '../services/blockchainService';
import { INSURANCE_PROVIDERS } from '../constants';
import { UserProfile } from '../types';

interface Props {
  userProfile: UserProfile;
}

const UserWallet: React.FC<Props> = ({ userProfile }) => {
  const [activeMember, setActiveMember] = useState('Principal');
  const [hash, setHash] = useState<string>('');
  const [showMpesa, setShowMpesa] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pushing' | 'success'>('idle');

  // Payment Logic
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const baseRate = 800; // Updated to match screenshot
  const dependentRate = 0; // Screenshot implies 800 includes dependents or is flat
  const monthlyTotal = baseRate;
  const totalAmount = period === 'monthly' ? monthlyTotal : monthlyTotal * 10; // 2 months discount

  // Generate Dependents List
  const dependentsList = userProfile.beneficiaries?.length > 0
    ? userProfile.beneficiaries.map(b => `${b.id} (${b.relation})`)
    : Array.from({ length: userProfile.dependents }, (_, i) => `Dependent ${i + 1} (Child)`);

  const allMembers = ['Principal', ...dependentsList];

  useEffect(() => {
    const updateHash = async () => {
      const walletData = {
        userId: userProfile.id,
        insuranceId: "p1",
        membershipNumber: `NHIF-${userProfile.id.toUpperCase()}`,
        status: "Active",
        lastPaymentDate: new Date().toISOString().split('T')[0],
        dependents: dependentsList
      };
      const h = await generateBlockhash(walletData);
      setHash(h);
    };
    updateHash();
  }, [userProfile, dependentsList]);

  const provider = INSURANCE_PROVIDERS[0];

  const handlePay = () => {
    setShowMpesa(true);
    setMpesaStatus('pushing');
    setTimeout(() => {
      setMpesaStatus('success');
    }, 3000);
  };

  return (
    <div className="relative group perspective-1000">
      <div className="bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#172554] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-700 hover:shadow-indigo-500/20 border border-white/5 ring-1 ring-white/10">

        {/* Holographic Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-500/10 via-transparent to-indigo-500/10 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {allMembers.map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMember(m)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeMember === m ? 'bg-white text-blue-900 shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                  >
                    {m.split(' ')[0]}
                  </button>
                ))}
              </div>
              <p className="text-blue-200 text-[10px] uppercase tracking-[0.2em] font-black mb-1 opacity-70">SmartSure Digital ID</p>
              <h2 className="text-3xl font-black tracking-tighter drop-shadow-md">
                {provider?.name} <span className="text-xl font-medium opacity-50 ml-2">(Standard)</span>
              </h2>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-inner">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Active
              </div>
              <div className="w-16 h-16 bg-white p-1.5 rounded-2xl shadow-2xl transform hover:rotate-6 transition-transform group-hover:scale-105 cursor-help overflow-hidden border border-blue-200">
                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SMARTSURE-VAL')] bg-cover opacity-80"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div className="space-y-8">
              <div>
                <p className="text-blue-200 text-[10px] uppercase font-black tracking-widest mb-2 opacity-60">Member Number</p>
                <p className="text-2xl font-mono tracking-[0.2em] font-black group-hover:text-blue-100 transition-colors">
                  {activeMember === 'Principal'
                    ? `NHIF-WAQ06Q3MT`
                    : `NHIF-WAQ06Q3MT-0${allMembers.indexOf(activeMember)}`}
                </p>
              </div>
              <div className="flex -space-x-2">
                {dependentsList.map((d, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-blue-800 border-2 border-indigo-900 flex items-center justify-center text-[10px] font-black text-blue-200 shadow-lg hover:z-10 hover:-translate-y-1 transition-all cursor-help" title={d}>
                    {d.charAt(0)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/40">
                  +{userProfile.dependents}
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 ring-1 ring-white/5 shadow-inner relative overflow-hidden group/premium">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest opacity-60">Contribution Premium</span>
                <div className="flex bg-blue-950/80 rounded-xl p-0.5 shadow-2xl">
                  <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${period === 'monthly' ? 'bg-white text-blue-900' : 'text-blue-400'}`}>MO</button>
                  <button onClick={() => setPeriod('yearly')} className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${period === 'yearly' ? 'bg-white text-blue-900' : 'text-blue-400'}`}>YR</button>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter">KES {totalAmount.toLocaleString()}</span>
                <span className="text-sm font-bold text-blue-300/50">/{period === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <p className="mt-3 text-[10px] font-bold text-blue-300 opacity-80 decoration-indigo-500">
                Includes {userProfile.dependents} Dependents Managed
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="w-full md:w-1/2">
              <p className="text-blue-200 text-[10px] uppercase font-black tracking-widest mb-2 opacity-60">Blockchain Ledger Hash</p>
              <div className="bg-black/20 rounded-xl px-4 py-2 font-mono text-[9px] text-blue-200/50 truncate border border-white/5">
                {hash}
              </div>
            </div>
            <button
              onClick={handlePay}
              className="w-full md:w-auto bg-white text-blue-900 px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group/btn"
            >
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Pay Now
              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      {showMpesa && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-slate-800 text-center animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-500 w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center text-white font-black text-3xl mb-8 shadow-2xl shadow-emerald-200">M</div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">M-Pesa STK Push</h3>

            {mpesaStatus === 'pushing' ? (
              <div className="py-6">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Please check your phone for the M-Pesa prompt and enter your PIN.</p>
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
                  <p className="text-xl font-black text-slate-800 font-mono">KES {totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-2xl font-black text-emerald-600 mb-2">Payment Recieved</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Your digital ID has been updated on the blockchain.</p>
              </div>
            )}

            <button onClick={() => setShowMpesa(false)} className="mt-6 w-full py-4 text-xs font-black text-slate-400 hover:text-slate-800 uppercase tracking-[0.2em] transition-colors border-t border-slate-50">Done</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
};

export default UserWallet;
