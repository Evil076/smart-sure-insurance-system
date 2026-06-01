import React, { useState, useEffect } from 'react';
import { AppMode, Language, UserRole, UserProfile, Hospital } from './types';
import { INSURANCE_PROVIDERS, KISII_HOSPITALS } from './constants';
import HospitalFinder from './components/HospitalFinder';
import PolicyAdvisor from './components/PolicyAdvisor';
import UserWallet from './components/UserWallet';
import USSDSimulator from './components/USSDSimulator';
import AdminDashboard from './components/AdminDashboard';
import PredictiveAdvisor from './components/PredictiveAdvisor';
import ProfileSettings from './components/ProfileSettings';
import HospitalDashboard from './components/HospitalDashboard';
import InsuranceProviderDashboard from './components/InsuranceProviderDashboard';
import BenefitPreAuth from './components/BenefitPreAuth';
import Login from './components/Login';
import SupportChat from './components/SupportChat';
import EmergencySOS from './components/EmergencySOS';
import PatientAppointments from './components/PatientAppointments';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [lang, setLang] = useState<Language>('en');
  const [selectedInsurance, setSelectedInsurance] = useState<string>("p1");
  const [showConsent, setShowConsent] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [dbHospitals, setDbHospitals] = useState<Hospital[]>([]);

  // Fetch Hospitals globally to avoid re-fetching on tab switch
  useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase.from('hospitals').select('*');
      if (data && data.length > 0) {
        const mappedData: Hospital[] = data.map((h: any) => ({
          ...h,
          accreditedProviders: h.accredited_providers || [],
          resources: {
            availableBeds: h.resources?.availableBeds || 0,
            specialists: h.resources?.specialists || []
          }
        }));
        setDbHospitals(mappedData);
      } else {
        setDbHospitals(KISII_HOSPITALS);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    // Check Supabase auth session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        // 1. Try to load rich profile from localStorage first
        const stored = localStorage.getItem('smartsure_user');
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.id === session.user.id) {
            setUserProfile(profile);
            setRole(profile.role);
            return;
          }
        }

        // 2. If not in localStorage, fetch from DB
        const { data: userRows } = await supabase.from('users').select('*').eq('email', session.user.email).single();
        if (userRows) {
          const profile: UserProfile = {
            id: session.user.id,
            name: userRows.full_name || session.user.email || 'User',
            role: userRows.role as UserRole,
            age: userRows.age ?? 30,
            dependents: userRows.dependents ?? 0,
            monthlyBudget: userRows.monthly_budget ?? 5000,
            priority: (userRows.priority as any) ?? 'cost',
            beneficiaries: userRows.beneficiaries ?? [],
            hospitalId: userRows.hospital_id
          };
          setUserProfile(profile);
          setRole(profile.role);
          localStorage.setItem('smartsure_user', JSON.stringify(profile));
          return;
        }

        // 3. Fallback to basic profile
        const basicProfile: any = { id: session.user.id, name: session.user.email, role: 'patient' };
        setUserProfile(basicProfile);
        setRole('patient');
      } else {
        setUserProfile(null);
        setRole(null);
      }
    };
    checkSession();
    const hasConsented = localStorage.getItem('smart-sure-consent');
    if (!hasConsented) setShowConsent(true);
  }, []);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        // Priority: LocalStorage -> Supabase DB -> Basic
        const stored = localStorage.getItem('smartsure_user');
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.id === session.user.id) {
            setUserProfile(profile);
            setRole(profile.role);
            return;
          }
        }

        const { data: userRows } = await supabase.from('users').select('*').eq('email', session.user.email).single();
        if (userRows) {
          const profile: any = {
            id: session.user.id,
            name: userRows.full_name || session.user.email || 'User',
            role: userRows.role,
            age: userRows.age ?? 30,
            dependents: userRows.dependents ?? 0,
            monthlyBudget: userRows.monthly_budget ?? 5000,
            priority: userRows.priority ?? 'cost',
            beneficiaries: userRows.beneficiaries ?? [],
            hospitalId: userRows.hospital_id
          };
          setUserProfile(profile);
          setRole(profile.role);
          localStorage.setItem('smartsure_user', JSON.stringify(profile));
        } else {
          const userProfile: any = { id: session.user.id, name: session.user.email, role: 'patient' };
          setUserProfile(userProfile);
          setRole('patient');
        }
      } else {
        setUserProfile(null);
        setRole(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    localStorage.setItem('smartsure_user', JSON.stringify(newProfile));
  };

  const handleLogin = (selectedRole: UserRole, profile: UserProfile) => {
    setRole(selectedRole);
    setUserProfile(profile);
    setActiveTab(selectedRole === 'admin' ? 'admin' : selectedRole === 'hospital_admin' ? 'hospital' : 'home');
  };

  const handleLogout = () => {
    localStorage.removeItem('smartsure_user');
    setRole(null);
    setUserProfile(null);
    setActiveTab('home');
  };

  if (!role || !userProfile) return <Login onLogin={handleLogin} />;

  const PatientPortal = (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 lg:pb-0 lg:pl-64 animate-in fade-in duration-500">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col p-8 z-40">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-indigo-100 rotate-3">S</div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter">SmartSure</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3' },
            { id: 'appointments', label: 'My Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'hospitals', label: 'Facility Finder', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
            { id: 'preauth', label: 'Approval AI', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04' },
            { id: 'advisor', label: 'Policy Expert', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2' },
            { id: 'predict', label: 'Benefit Match', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'settings', label: 'My Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'ussd', label: 'Dialer Demo', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // Trigger resize for Leaflet map visibility
                setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-700 text-white shadow-xl shadow-indigo-100 font-bold' : 'text-slate-400 hover:text-slate-600 font-bold'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Powered By</p>
          <p className="text-xs font-black text-slate-700">Smart Tech Ltd</p>
        </div>
      </aside>

      <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 p-5 lg:p-7 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('settings')} className="lg:hidden w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none hidden lg:block">Personal Health Command</h1>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none lg:hidden">SmartSure</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase mt-1 tracking-widest">{userProfile.name} • Kisii County</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select value={selectedInsurance} onChange={(e) => setSelectedInsurance(e.target.value)} className="bg-slate-100 border-none rounded-2xl px-5 py-3 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer">
            {INSURANCE_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={handleLogout} className="text-red-500 p-3 rounded-2xl bg-red-50 hover:bg-red-100 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <div className="bg-indigo-700 text-white overflow-hidden whitespace-nowrap py-3 relative border-b border-indigo-800">
        <div className="animate-marquee inline-block flex gap-12 items-center">
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> NHIF / SHA Server Status: Normal</span>
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> NHIF / SHA Server Status: Normal</span>
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> Kisii Blood Drive: Friday, Kisii Primary</span>
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> NHIF / SHA Server Status: Normal</span>
        </div>
      </div>

      <main className="p-4 lg:p-10 max-w-7xl mx-auto space-y-10">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <UserWallet userProfile={userProfile} />
              <HospitalFinder mode={AppMode.STANDARD} selectedInsuranceId={selectedInsurance} userProfile={userProfile} dbHospitals={dbHospitals} />
            </div>
            <div className="space-y-10">
              <EmergencySOS />
              <BenefitPreAuth selectedInsuranceId={selectedInsurance} />
              <PolicyAdvisor selectedInsuranceId={selectedInsurance} lang={lang} />
            </div>
          </div>
        )}
        {activeTab === 'hospitals' && <HospitalFinder mode={AppMode.STANDARD} selectedInsuranceId={selectedInsurance} userProfile={userProfile} dbHospitals={dbHospitals} />}
        {activeTab === 'appointments' && <PatientAppointments patientName={userProfile.name} />}
        {activeTab === 'preauth' && <div className="max-w-2xl mx-auto"><BenefitPreAuth selectedInsuranceId={selectedInsurance} /></div>}
        {activeTab === 'advisor' && <PolicyAdvisor selectedInsuranceId={selectedInsurance} lang={lang} />}
        {activeTab === 'predict' && <PredictiveAdvisor profile={userProfile} />}
        {activeTab === 'settings' && <ProfileSettings profile={userProfile} onUpdate={handleUpdateProfile} />}
        {activeTab === 'ussd' && <div className="max-w-md mx-auto py-12"><USSDSimulator /></div>}
      </main>

      <button
        onClick={() => setShowSupport(!showSupport)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-white text-indigo-700 rounded-full shadow-2xl flex items-center justify-center border border-slate-100 hover:scale-110 transition-all group z-50">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        <div className="absolute right-20 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Smart Support</div>
      </button>

      {showSupport && <SupportChat onClose={() => setShowSupport(false)} />}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />
    </div>
  );

  const HospitalPortal = (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-emerald-950 flex flex-col p-8 z-40">
        <div className="flex items-center gap-3 mb-12 text-white">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center font-black shadow-lg">H</div>
          <span className="text-2xl font-black tracking-tight">Staff Hub</span>
        </div>
        <button onClick={() => setActiveTab('hospital')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'hospital' ? 'bg-emerald-800 text-white shadow-xl' : 'text-emerald-400 hover:bg-emerald-900'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          <span className="font-bold text-sm">Facility Admin</span>
        </button>
        <div className="mt-auto pt-6 border-t border-emerald-900/50 text-center">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-1">Managed By</p>
          <p className="text-xs font-black text-white/50">Smart Tech Ltd</p>
        </div>
        <button onClick={handleLogout} className="mt-4 text-emerald-400 text-xs font-black uppercase tracking-widest text-left px-4 flex items-center gap-3 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
      </aside>
      <header className="sticky top-0 bg-white/80 border-b border-slate-100 p-7 z-30 flex justify-between items-center backdrop-blur-md">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em]">Resource Control Center</h1>
        <button onClick={handleLogout} className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-3">
          Switch Account
        </button>
      </header>
      <main className="p-10 max-w-7xl mx-auto">
        <HospitalDashboard hospital={KISII_HOSPITALS.find(h => h.id === userProfile.hospitalId) || KISII_HOSPITALS[0]} />
      </main>
    </div>
  );

  const SystemAdminPortal = (
    <div className="min-h-screen bg-slate-900 lg:pl-64 animate-in fade-in duration-500">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-8 z-40">
        <div className="flex items-center gap-3 mb-12 text-white">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black shadow-lg">A</div>
          <span className="text-2xl font-black tracking-tighter">Admin Root</span>
        </div>
        <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'admin' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:bg-slate-900'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
          <span className="font-bold text-sm">Dashboard</span>
        </button>
        <div className="mt-auto pt-6 border-t border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Corporate Infrastructure</p>
          <p className="text-xs font-black text-white/40">Smart Tech Ltd</p>
        </div>
        <button onClick={handleLogout} className="mt-4 text-slate-500 text-xs font-black uppercase tracking-widest text-left px-4 flex items-center gap-3 hover:text-white transition-colors">
          Sign Out
        </button>
      </aside>
      <header className="sticky top-0 bg-slate-900/80 border-b border-slate-800 p-7 z-30 flex justify-between items-center backdrop-blur-md">
        <h1 className="text-xl font-black text-white tracking-widest uppercase">Global Oversight</h1>
        <button onClick={handleLogout} className="bg-red-500/10 text-red-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20">
          Terminate Session
        </button>
      </header>
      <main className="p-10 max-w-7xl mx-auto"><AdminDashboard /></main>
    </div>
  );

  // Insurance Provider Portal
  const InsuranceProviderPortal = (
    <div className="min-h-screen bg-emerald-50 lg:pl-64">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-emerald-900 flex flex-col p-8 z-40">
        <div className="flex items-center gap-3 mb-12 text-white">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center font-black shadow-lg">I</div>
          <span className="text-2xl font-black tracking-tight">Insurance Hub</span>
        </div>
        <button onClick={() => setActiveTab('insurance')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'insurance' ? 'bg-emerald-800 text-white shadow-xl' : 'text-emerald-400 hover:bg-emerald-900'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
          <span className="font-bold text-sm">Provider Dashboard</span>
        </button>
        <div className="mt-auto pt-6 border-t border-emerald-900/50 text-center">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-1">Managed By</p>
          <p className="text-xs font-black text-white/50">Smart Tech Ltd</p>
        </div>
        <button onClick={handleLogout} className="mt-4 text-emerald-400 text-xs font-black uppercase tracking-widest text-left px-4 flex items-center gap-3 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
      </aside>
      <header className="sticky top-0 bg-white/80 border-b border-slate-100 p-7 z-30 flex justify-between items-center backdrop-blur-md">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em]">Insurance Provider Center</h1>
        <button onClick={handleLogout} className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-3">
          Switch Account
        </button>
      </header>
      <main className="p-10 max-w-7xl mx-auto">
        <InsuranceProviderDashboard provider={userProfile} />
      </main>
    </div>
  );

  return (
    <div className="min-h-screen">
      {role === 'admin' ? SystemAdminPortal : role === 'hospital_admin' ? HospitalPortal : role === 'insurance_provider' ? InsuranceProviderPortal : PatientPortal}
      {showConsent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
          <div className="bg-white rounded-[3rem] p-12 max-w-lg shadow-2xl border border-slate-100">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.48V22" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter text-center">Privacy Commitment</h2>
            <p className="text-slate-500 text-base mb-10 leading-relaxed text-center font-medium">SmartSure is fully compliant with the <b>Kenya Data Protection Act (2019)</b>. We only process your medical and geographic data to provide life-saving health matching.</p>
            <div className="space-y-4">
              <button onClick={() => { localStorage.setItem('smart-sure-consent', 'true'); setShowConsent(false); }} className="w-full bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-800 transition-all">Securely Authorize</button>
              <button onClick={() => window.location.href = "https://odpc.go.ke"} className="w-full text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-all">Read Data Act Policies</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
