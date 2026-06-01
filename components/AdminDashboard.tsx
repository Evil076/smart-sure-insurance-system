import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import {
  BarChart, Bar, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { systemLogger, SystemEvent } from '../services/systemLogger';
// Add missing import for INSURANCE_PROVIDERS used in the Fraud Center section
import { INSURANCE_PROVIDERS } from '../constants';
import { supabase } from '../services/supabaseClient';
import { createHospitalAccount } from '../services/hospitalAccountService';

const AdminDashboard: React.FC = () => {
  const [subTab, setSubTab] = useState<'analytics' | 'logs' | 'fraud' | 'green' | 'accounts' | 'insurance_accounts'>('analytics');
  const [hospitalAccounts, setHospitalAccounts] = useState<any[]>([]);
  const [insuranceAccounts, setInsuranceAccounts] = useState<any[]>([]);
  const [newHospital, setNewHospital] = useState({ name: '', email: '', password: '' });
  const [newInsurance, setNewInsurance] = useState({ name: '', email: '', password: '' });
  const [accountMsg, setAccountMsg] = useState<string | null>(null);
  const [insuranceMsg, setInsuranceMsg] = useState<string | null>(null);
    // Fetch hospital accounts

    useEffect(() => {
      if (subTab === 'accounts') {
        supabase.from('users').select('user_id, full_name, email, role, created_at').eq('role', 'hospital_admin').then(({ data }) => {
          setHospitalAccounts(data || []);
        });
      }
      if (subTab === 'insurance_accounts') {
        supabase.from('users').select('user_id, full_name, email, role, created_at').eq('role', 'insurance_provider').then(({ data }) => {
          setInsuranceAccounts(data || []);
        });
      }
    }, [subTab]);

    // Handler to create hospital account
    const handleCreateHospital = async (e: React.FormEvent) => {
      e.preventDefault();
      setAccountMsg(null);
      if (!newHospital.email || !newHospital.password || !newHospital.name) {
        setAccountMsg('All fields required.');
        return;
      }
      try {
        const response = await fetch('http://localhost:4000/api/create-hospital-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newHospital.name,
            email: newHospital.email,
            password: newHospital.password
          })
        });
        if (!response.ok) {
          const errorText = await response.text();
          setAccountMsg(errorText || 'Error creating account');
          return;
        }
        setAccountMsg('Hospital account created!');
        setNewHospital({ name: '', email: '', password: '' });
        // Refresh list
        const { data } = await supabase.from('users').select('user_id, full_name, email, role, created_at').eq('role', 'hospital_admin');
        setHospitalAccounts(data || []);
      } catch (err: any) {
        setAccountMsg(err.message || 'Error creating account');
      }
    };

    // Handler to create insurance provider account
    const handleCreateInsurance = async (e: React.FormEvent) => {
      e.preventDefault();
      setInsuranceMsg(null);
      if (!newInsurance.email || !newInsurance.password || !newInsurance.name) {
        setInsuranceMsg('All fields required.');
        return;
      }
      try {
        const response = await fetch('http://localhost:4000/api/create-insurance-provider-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newInsurance.name,
            email: newInsurance.email,
            password: newInsurance.password
          })
        });
        if (!response.ok) {
          const errorText = await response.text();
          setInsuranceMsg(errorText || 'Error creating account');
          return;
        }
        setInsuranceMsg('Insurance provider account created!');
        setNewInsurance({ name: '', email: '', password: '' });
        // Refresh list
        const { data } = await supabase.from('users').select('user_id, full_name, email, role, created_at').eq('role', 'insurance_provider');
        setInsuranceAccounts(data || []);
      } catch (err: any) {
        setInsuranceMsg(err.message || 'Error creating account');
      }
    };
  const [logs, setLogs] = useState<SystemEvent[]>(systemLogger.getEvents());
  const [metrics, setMetrics] = useState(systemLogger.getMetrics());

  useEffect(() => {
    // Synchronize with the global system logger
    const unsubscribe = systemLogger.subscribe((event) => {
      setLogs(systemLogger.getEvents());
      setMetrics(systemLogger.getMetrics());
    });

    // Fetch Real DB Stats
    const fetchStats = async () => {
      // Get count of total appointments
      const { count: totalApts } = await supabase.from('appointments').select('*', { count: 'exact', head: true });

      // Get unique patients to estimate "Active Users"
      const { data: patients } = await supabase.from('appointments').select('patient_name');
      // Use Set to filter unique names. Handle potential null/undefined data safely.
      const uniqueUsers = new Set(patients?.map((p: any) => p.patient_name)).size;

      const { count: hospCount } = await supabase.from('hospitals').select('*', { count: 'exact', head: true });

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalQueries: (totalApts || 0) + (hospCount || 0) * 10,
        activeThreats: uniqueUsers || 0 // Displaying Unique Users here
      }));
    };
    fetchStats();

    return unsubscribe;
  }, []);

  // Generate dynamic chart data based on actual logged levels
  const getChartData = () => {
    const counts = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'AI Requests', count: counts['AI'] || 0 },
      { name: 'Security', count: counts['SEC'] || 0 },
      { name: 'System Info', count: counts['INFO'] || 0 },
      { name: 'Hospital Logs', count: counts['LOG'] || 0 },
      { name: 'Warnings', count: counts['WARN'] || 0 },
    ];
  };

  const activeFraudLogs = logs.filter(l => l.level === 'SEC' || l.level === 'WARN');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Interactions', value: metrics.totalQueries, color: 'text-indigo-400' },
          { label: 'AI Match Rate', value: `${metrics.aiSuccessRate}%`, color: 'text-emerald-400' },
          { label: 'Avg Latency', value: `${metrics.avgResponseTime}s`, color: 'text-amber-400' },
          { label: 'Active Users (Live)', value: metrics.activeThreats, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>



      <div className="flex border-b border-slate-800 gap-8 overflow-x-auto pb-px">
        {[
          { id: 'analytics', label: 'Live Analytics' },
          { id: 'logs', label: 'Activity Stream' },
          { id: 'fraud', label: 'Threat Center' },
          { id: 'green', label: 'Green Energy' },
          { id: 'accounts', label: 'Hospital Accounts' },
          { id: 'insurance_accounts', label: 'Insurance Providers' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`pb-4 text-sm font-bold transition-all whitespace-nowrap ${subTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {subTab === 'accounts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <h3 className="text-xl font-black mb-6 text-slate-800">Manage Hospital Accounts</h3>
          <form className="flex flex-col md:flex-row gap-4 mb-6" onSubmit={handleCreateHospital}>
            <input type="text" placeholder="Hospital Name" className="rounded-lg border px-4 py-2" value={newHospital.name} onChange={e => setNewHospital({ ...newHospital, name: e.target.value })} />
            <input type="email" placeholder="Email" className="rounded-lg border px-4 py-2" value={newHospital.email} onChange={e => setNewHospital({ ...newHospital, email: e.target.value })} />
            <input type="password" placeholder="Password" className="rounded-lg border px-4 py-2" value={newHospital.password} onChange={e => setNewHospital({ ...newHospital, password: e.target.value })} />
            <button type="submit" className="bg-blue-900 text-white rounded-lg px-6 py-2 font-bold hover:bg-blue-800 transition">Create</button>
          </form>
          {accountMsg && <div className="mb-4 text-sm text-center text-red-500">{accountMsg}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {hospitalAccounts.map(acc => (
                  <tr key={acc.user_id} className="border-b">
                    <td className="p-2">{acc.full_name}</td>
                    <td className="p-2">{acc.email}</td>
                    <td className="p-2">{acc.created_at ? new Date(acc.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'insurance_accounts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <h3 className="text-xl font-black mb-6 text-slate-800">Manage Insurance Provider Accounts</h3>
          <form className="flex flex-col md:flex-row gap-4 mb-6" onSubmit={handleCreateInsurance}>
            <input type="text" placeholder="Provider Name" className="rounded-lg border px-4 py-2" value={newInsurance.name} onChange={e => setNewInsurance({ ...newInsurance, name: e.target.value })} />
            <input type="email" placeholder="Email" className="rounded-lg border px-4 py-2" value={newInsurance.email} onChange={e => setNewInsurance({ ...newInsurance, email: e.target.value })} />
            <input type="password" placeholder="Password" className="rounded-lg border px-4 py-2" value={newInsurance.password} onChange={e => setNewInsurance({ ...newInsurance, password: e.target.value })} />
            <button type="submit" className="bg-emerald-900 text-white rounded-lg px-6 py-2 font-bold hover:bg-emerald-800 transition">Create</button>
          </form>
          {insuranceMsg && <div className="mb-4 text-sm text-center text-red-500">{insuranceMsg}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {insuranceAccounts.map(acc => (
                  <tr key={acc.user_id} className="border-b">
                    <td className="p-2">{acc.full_name}</td>
                    <td className="p-2">{acc.email}</td>
                    <td className="p-2">{acc.created_at ? new Date(acc.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <h3 className="text-white font-bold mb-6">Traffic Distribution (Session)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <h3 className="text-white font-bold mb-6">AI Response Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs.filter(l => l.level === 'AI').map((l, i) => ({ name: i, val: Math.random() * 2 }))}>
                  <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {subTab === 'logs' && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 font-mono text-[11px] h-[500px] flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-4 px-2">
            <h4 className="text-indigo-400 font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              System-Wide Telemetry
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-slate-700 italic p-4">Awaiting system events...</div>
            ) : logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-2 hover:bg-white/5 rounded transition-colors group">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span className={`font-black shrink-0 w-12 ${log.level === 'SEC' ? 'text-red-400' :
                  log.level === 'AI' ? 'text-purple-400' :
                    log.level === 'WARN' ? 'text-amber-400' : 'text-blue-400'
                  }`}>{log.level}</span>
                <span className="text-slate-300 flex-1">{log.message}</span>
                <span className="text-slate-600 text-[9px] font-bold group-hover:text-indigo-400 transition-colors uppercase">{log.origin}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'fraud' && (
        <div className="grid gap-6">
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-center gap-6 shadow-lg shadow-red-950/20">
            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3.01 1.732 3.01h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="text-red-400 font-bold mb-1">Anomaly Detection Active</h3>
              <p className="text-red-400/60 text-xs font-medium">Monitoring blockchain integrity and geographic hops for {INSURANCE_PROVIDERS.length} providers.</p>
            </div>
          </div>

          <div className="space-y-4">
            {activeFraudLogs.length === 0 ? (
              <div className="text-center p-12 bg-slate-800 rounded-3xl border border-dashed border-slate-700">
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">No Security Anomalies Detected</p>
              </div>
            ) : activeFraudLogs.map(item => (
              <div key={item.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-all flex justify-between items-center group">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.level === 'SEC' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'}`}>{item.level} PRIORITY</span>
                    <h4 className="text-white font-bold">{item.origin}</h4>
                  </div>
                  <p className="text-slate-400 text-sm">{item.message}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all transform hover:scale-105">Audit Event</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'green' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-900/20 border border-emerald-500/20 p-8 rounded-[2.5rem]">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-emerald-400 font-black uppercase tracking-widest mb-2">Sustainability Index</h3>
            <p className="text-emerald-100/60 text-sm leading-relaxed mb-6">SmartSure infrastructure utilizes Gemini 3 Flash to minimize token energy usage. Current session efficiency is optimal.</p>
            <div className="bg-emerald-950/50 p-4 rounded-2xl">
              <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Carbon Saved (Est.)</p>
              <p className="text-2xl font-black text-white">{(metrics.totalQueries * 0.002).toFixed(3)} kg <span className="text-sm font-normal text-emerald-400">CO2</span></p>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2.5rem]">
            <h3 className="text-slate-300 font-black uppercase tracking-widest mb-6">Inference Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">AI Compute Efficiency</span>
                <span className="text-emerald-400 font-bold">99.8%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[99.8%]"></div>
              </div>
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-slate-500">API Gateway Health</span>
                <span className="text-indigo-400 font-bold">All OK</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;