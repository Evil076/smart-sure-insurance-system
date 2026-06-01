

import React, { useState } from 'react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'Patient Records' },
  { id: 'claims', label: 'Claims Management' },
  { id: 'billing', label: 'Billing & Invoices' },
  { id: 'insurance', label: 'Insurance Provider Integration' },
  { id: 'compliance', label: 'Compliance & Accreditation' },
  { id: 'appointments', label: 'Appointments & Scheduling' },
  { id: 'analytics', label: 'Analytics & Reports' },
  { id: 'logs', label: 'System Logs' },
];

const HospitalDashboard: React.FC<{ hospital: any }> = ({ hospital }) => {

  // Active tab state (must be declared before any useEffect that uses it)
  const [activeTab, setActiveTab] = useState('dashboard');

  // System Logs tab state
  const [logs, setLogs] = React.useState<any[]>([]);
  const [logSearch, setLogSearch] = React.useState('');
  React.useEffect(() => {
    async function fetchLogs() {
      if (activeTab !== 'logs') return;
      const { supabase } = await import('../services/supabaseClient');
      // Fetch audit logs for this hospital
      const { data } = await supabase.from('audit_logs').select('*').eq('hospital_id', hospital.id);
      setLogs(data || []);
    }
    fetchLogs();
  }, [activeTab, hospital.id]);

  // Analytics & Reports tab state
  const [analytics, setAnalytics] = React.useState<any>({});
  const [showReportBuilder, setShowReportBuilder] = React.useState(false);
  React.useEffect(() => {
    async function fetchAnalytics() {
      if (activeTab !== 'analytics') return;
      const { supabase } = await import('../services/supabaseClient');
      // Example: fetch claim stats, fraud metrics, treatment outcomes
      const { data: claims } = await supabase.from('claims').select('status, fraud_score').eq('hospital_id', hospital.id);
      const approved = claims ? claims.filter(c => c.status === 'approved').length : 0;
      const rejected = claims ? claims.filter(c => c.status === 'rejected').length : 0;
      const flagged = claims ? claims.filter(c => c.fraud_score > 70).length : 0;
      const total = claims ? claims.length : 0;
      setAnalytics({
        claimSuccess: total ? Math.round((approved / total) * 100) : 0,
        claimReject: total ? Math.round((rejected / total) * 100) : 0,
        fraudFlagged: flagged,
        totalClaims: total
      });
    }
    fetchAnalytics();
  }, [activeTab, hospital.id]);

  // Appointments & Scheduling tab state
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = React.useState(false);
  React.useEffect(() => {
    async function fetchAppointments() {
      if (activeTab !== 'appointments') return;
      const { supabase } = await import('../services/supabaseClient');
      // Fetch appointments for this hospital
      const { data } = await supabase.from('appointments').select('*').eq('hospital_id', hospital.id);
      setAppointments(data || []);
    }
    fetchAppointments();
  }, [activeTab, hospital.id]);

  // Compliance & Accreditation tab state
  const [compliance, setCompliance] = React.useState<any[]>([]);
  const [showLicenseForm, setShowLicenseForm] = React.useState(false);
  const [showConsentForm, setShowConsentForm] = React.useState(false);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  React.useEffect(() => {
    async function fetchCompliance() {
      if (activeTab !== 'compliance') return;
      const { supabase } = await import('../services/supabaseClient');
      // Fetch compliance records for this hospital
      const { data } = await supabase.from('compliance').select('*').eq('hospital_id', hospital.id);
      setCompliance(data || []);
      // Fetch audit logs
      const { data: logs } = await supabase.from('audit_logs').select('*').eq('hospital_id', hospital.id);
      setAuditLogs(logs || []);
    }
    fetchCompliance();
  }, [activeTab, hospital.id]);

  // Insurance Provider Integration tab state
  const [providers, setProviders] = React.useState<any[]>([]);
  const [providerSearch, setProviderSearch] = React.useState('');
  const [showPolicyForm, setShowPolicyForm] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<any | null>(null);
  React.useEffect(() => {
    async function fetchProviders() {
      if (activeTab !== 'insurance') return;
      const { supabase } = await import('../services/supabaseClient');
      // Fetch insurance providers and accreditation status
      const { data } = await supabase.from('insurance_providers').select('*');
      setProviders(data || []);
    }
    fetchProviders();
  }, [activeTab]);

  // Billing & Invoices tab state
  const [billing, setBilling] = React.useState<any[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = React.useState(false);
  React.useEffect(() => {
    async function fetchBilling() {
      if (activeTab !== 'billing') return;
      try {
        const token = localStorage.getItem('smartsure_token');
        const res = await fetch(`/hospital/billing/${hospital.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Error fetching billing records');
        const data = await res.json();
        setBilling(data.billing || []);
      } catch {
        setBilling([]);
      }
    }
    fetchBilling();
  }, [activeTab, hospital.id]);

  // Claims Management tab state
  const [claims, setClaims] = React.useState<any[]>([]);
  const [showClaimForm, setShowClaimForm] = React.useState(false);
  const [selectedClaim, setSelectedClaim] = React.useState<any | null>(null);
  React.useEffect(() => {
      async function fetchClaims() {
        if (activeTab !== 'claims') return;
        try {
          const token = localStorage.getItem('smartsure_token');
          const res = await fetch(`/hospital/claims/${hospital.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (!res.ok) throw new Error('Error fetching claims');
          const data = await res.json();
          setClaims(data.claims || []);
        } catch {
          setClaims([]);
        }
      }
      fetchClaims();
  }, [activeTab, hospital.id]);

  // Patient Records tab state
  const [patients, setPatients] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState<any | null>(null);
  const [showIntakeForm, setShowIntakeForm] = React.useState(false);
  const [showHistoryForm, setShowHistoryForm] = React.useState(false);
  React.useEffect(() => {
    async function fetchPatients() {
      if (activeTab !== 'patients') return;
      try {
        const token = localStorage.getItem('smartsure_token');
        const res = await fetch(`/hospital/patients/${hospital.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Error fetching patients');
        const data = await res.json();
        setPatients(data.patients || []);
      } catch {
        setPatients([]);
      }
    }
    fetchPatients();
  }, [activeTab, hospital.id]);

  // Live data state for Dashboard tab
  const [dashboardStats, setDashboardStats] = React.useState({
    activePatients: 0,
    claimsSubmitted: 0,
    reimbursements: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    outstandingBalances: 0,
    settlements: 0,
    notifications: [] as string[],
    fraudAlerts: 0
  });

  React.useEffect(() => {
    async function fetchDashboardStats() {
      if (activeTab !== 'dashboard') return;
      try {
        // Assume JWT or session token is available for auth
        const token = localStorage.getItem('smartsure_token');
        const res = await fetch('/hospital/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Access denied or error fetching dashboard');
        const data = await res.json();
        setDashboardStats({
          activePatients: data.active_patients,
          claimsSubmitted: data.claims_submitted,
          reimbursements: data.reimbursements,
          pendingClaims: data.pending_claims,
          approvedClaims: data.approved_claims,
          rejectedClaims: data.rejected_claims,
          outstandingBalances: data.outstanding_balances,
          settlements: data.settlements,
          notifications: data.notifications || [],
          fraudAlerts: data.fraud_alerts || 0
        });
      } catch (err) {
        setDashboardStats(prev => ({ ...prev, notifications: ['Error loading dashboard data.'] }));
      }
    }
    fetchDashboardStats();
  }, [activeTab]);
  const demoPatient = {
    name: 'Jane Doe', dob: '1990-05-12', gender: 'Female', contact: '0712345678', emergency: 'John Doe (Brother)',
    conditions: 'Hypertension', allergies: 'Penicillin', medications: 'Atenolol', treatments: 'Appendectomy (2015)',
    insurance: 'NHIF Standard', admission: '2026-02-28', discharge: '2026-03-01'
  };
  const demoClaims = [
    { id: 'c1', patient: 'Jane Doe', status: 'Pending', risk: 'Low', flagged: false },
    { id: 'c2', patient: 'John Smith', status: 'Approved', risk: 'Low', flagged: false },
    { id: 'c3', patient: 'Alice Kim', status: 'Rejected', risk: 'High', flagged: true }
  ];
  const demoProviders = [
    { name: 'NHIF', code: 'NHIF-001', accredited: true },
    { name: 'Britam', code: 'BRIT-002', accredited: true },
    { name: 'APA', code: 'APA-004', accredited: false }
  ];
  const demoAppointments = [
    { patient: 'Jane Doe', date: '2026-03-02', doctor: 'Dr. Nyasani', status: 'Scheduled' },
    { patient: 'John Smith', date: '2026-03-03', doctor: 'Dr. Mogaka', status: 'Scheduled' }
  ];
  const demoLogs = [
    { action: 'Claim submitted by user123', role: 'Doctor', time: '2026-03-01' },
    { action: 'Patient record accessed by nurseA', role: 'Nurse', time: '2026-03-01' },
    { action: 'Appointment booked by patient456', role: 'Patient', time: '2026-03-01' },
    { action: 'License uploaded by admin', role: 'Admin', time: '2026-03-01' },
    { action: 'Claim flagged for fraud by system', role: 'System', time: '2026-03-01' }
  ];

  return (
    <div className="flex min-h-screen animate-in fade-in duration-500 pb-20">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-8 space-y-2">
        <h2 className="text-xl font-black text-white mb-8">Hospital Portal</h2>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`text-left px-4 py-3 rounded-lg font-bold text-base transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Main Content */}
      <main className="flex-1 p-10">
        {activeTab === 'dashboard' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Dashboard Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-indigo-50 p-4 rounded-xl text-center">
                <div className="text-3xl font-black text-indigo-700">{dashboardStats.activePatients}</div>
                <div className="text-xs text-slate-500">Active Patients</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl text-center">
                <div className="text-3xl font-black text-emerald-700">{dashboardStats.claimsSubmitted}</div>
                <div className="text-xs text-slate-500">Claims Submitted</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-3xl font-black text-blue-700">{dashboardStats.reimbursements}</div>
                <div className="text-xs text-slate-500">Reimbursements Received</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl text-center">
                <div className="text-3xl font-black text-amber-700">{dashboardStats.pendingClaims}</div>
                <div className="text-xs text-slate-500">Pending Claims</div>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold">Approved: {dashboardStats.approvedClaims}</div>
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold">Rejected: {dashboardStats.rejectedClaims}</div>
              <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold">Pending: {dashboardStats.pendingClaims}</div>
            </div>
            {/* Notification Panel */}
            {dashboardStats.notifications.map((note, i) => (
              <div key={i} className={`p-4 rounded-xl font-medium mb-2 ${note.toLowerCase().includes('fraud') ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>{note}</div>
            ))}
            <div className="mt-6 text-slate-700 font-bold">Financial Snapshot</div>
            <div className="flex gap-6 mt-2">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-lg font-black text-blue-700">KES {dashboardStats.outstandingBalances}</div>
                <div className="text-xs text-slate-500">Outstanding Balances</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl text-center">
                <div className="text-lg font-black text-emerald-700">KES {dashboardStats.settlements}</div>
                <div className="text-xs text-slate-500">Settlements</div>
              </div>
            </div>
            {/* TODO: Add interactive charts for KPIs using recharts */}
          </section>
        )}

        {activeTab === 'patients' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Patient Records</h2>
            <div className="mb-4 flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                className="rounded-lg border px-4 py-2 w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowIntakeForm(true)}>Add Patient</button>
            </div>
            <table className="min-w-full text-sm mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">DOB</th>
                  <th className="p-2 text-left">Gender</th>
                  <th className="p-2 text-left">Contact</th>
                  <th className="p-2 text-left">Insurance</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {showClaimForm && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                      <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                        <h3 className="text-xl font-black mb-4 text-slate-800">Submit New Claim</h3>
                        <form onSubmit={async e => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const patient_id = (form.elements.namedItem('patient_id') as HTMLInputElement).value;
                          const treatment = (form.elements.namedItem('treatment') as HTMLInputElement).value;
                          const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
                          const diagnosis = (form.elements.namedItem('diagnosis') as HTMLInputElement).value;
                          const policy_id = (form.elements.namedItem('policy_id') as HTMLInputElement).value;
                          if (!patient_id || !treatment || !amount || !policy_id) {
                            alert('All fields are required.');
                            return;
                          }
                          const token = localStorage.getItem('smartsure_token');
                          const res = await fetch('/hospital/claims', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                            },
                            body: JSON.stringify({
                              patient_id,
                              treatment,
                              amount: parseFloat(amount),
                              diagnosis,
                              policy_id,
                              hospital_id: hospital.id
                            })
                          });
                          if (!res.ok) {
                            alert('Error submitting claim');
                            return;
                          }
                          setShowClaimForm(false);
                          // Refresh claims list
                          const data = await res.json();
                          setClaims(data.claims || []);
                        }}>
                          <input name="patient_id" type="text" placeholder="Patient ID" className="mb-2 w-full rounded-lg border px-4 py-2" />
                          <input name="treatment" type="text" placeholder="Treatment" className="mb-2 w-full rounded-lg border px-4 py-2" />
                          <input name="amount" type="number" placeholder="Amount" className="mb-2 w-full rounded-lg border px-4 py-2" />
                          <input name="diagnosis" type="text" placeholder="Diagnosis" className="mb-2 w-full rounded-lg border px-4 py-2" />
                          <input name="policy_id" type="text" placeholder="Policy ID" className="mb-2 w-full rounded-lg border px-4 py-2" />
                          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Submit Claim</button>
                          <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowClaimForm(false)}>Cancel</button>
                        </form>
                      </div>
                    </div>
                  )}
              </tbody>
            </table>
            {/* Patient Details Modal */}
            {selectedPatient && !showHistoryForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Patient Details</h3>
                  <div className="mb-2 text-slate-700">Name: {selectedPatient.full_name}</div>
                  <div className="mb-2 text-slate-700">DOB: {selectedPatient.dob || '-'}</div>
                  <div className="mb-2 text-slate-700">Gender: {selectedPatient.gender || '-'}</div>
                  <div className="mb-2 text-slate-700">Contact: {selectedPatient.phone_number}</div>
                  <div className="mb-2 text-slate-700">Insurance: {selectedPatient.insurance_policy || '-'}</div>
                  <div className="mb-2 text-slate-700">Medical History: {selectedPatient.medical_history || '-'}</div>
                  <div className="mb-2 text-slate-700">Allergies: {selectedPatient.allergies || '-'}</div>
                  <div className="mb-2 text-slate-700">Emergency Contact: {selectedPatient.emergency_contact || '-'}</div>
                  <div className="mb-2 text-slate-700">Admission: {selectedPatient.admission_summary || '-'}</div>
                  <div className="mb-2 text-slate-700">Discharge: {selectedPatient.discharge_summary || '-'}</div>
                  <button className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setSelectedPatient(null)}>Close</button>
                </div>
              </div>
            )}
            {/* Patient Intake Form Modal */}
            {showIntakeForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Add New Patient</h3>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                    const dob = (form.elements.namedItem('dob') as HTMLInputElement).value;
                    const gender = (form.elements.namedItem('gender') as HTMLInputElement).value;
                    const contact = (form.elements.namedItem('contact') as HTMLInputElement).value;
                    const insurance_policy_id = (form.elements.namedItem('insurance_policy_id') as HTMLInputElement).value;
                    const emergency_contact = (form.elements.namedItem('emergency_contact') as HTMLInputElement).value;
                    if (!name || !dob || !insurance_policy_id) {
                      alert('Name, DOB, and Insurance Policy are required.');
                      return;
                    }
                    const token = localStorage.getItem('smartsure_token');
                    const res = await fetch('/hospital/patients', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                      },
                      body: JSON.stringify({
                        name,
                        dob,
                        gender,
                        contact,
                        insurance_policy_id,
                        emergency_contact,
                        hospital_id: hospital.id
                      })
                    });
                    if (!res.ok) {
                      alert('Error adding patient');
                      return;
                    }
                    setShowIntakeForm(false);
                    // Refresh patient list
                    const data = await res.json();
                    setPatients(data.patients || []);
                  }}>
                    <input name="name" type="text" placeholder="Full Name" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="dob" type="date" placeholder="DOB" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="gender" type="text" placeholder="Gender" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="contact" type="text" placeholder="Contact" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="insurance_policy_id" type="text" placeholder="Insurance Policy" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="emergency_contact" type="text" placeholder="Emergency Contact" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Add Patient</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowIntakeForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
            {/* Medical History Update Form Modal */}
            {showHistoryForm && selectedPatient && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Update Medical History</h3>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const medical_history = (form.elements.namedItem('medical_history') as HTMLInputElement).value;
                    const allergies = (form.elements.namedItem('allergies') as HTMLInputElement).value;
                    const admission_summary = (form.elements.namedItem('admission_summary') as HTMLInputElement).value;
                    const discharge_summary = (form.elements.namedItem('discharge_summary') as HTMLInputElement).value;
                    const token = localStorage.getItem('smartsure_token');
                    const res = await fetch(`/hospital/patients/${selectedPatient.user_id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                      },
                      body: JSON.stringify({
                        medical_history,
                        allergies,
                        admission_summary,
                        discharge_summary
                      })
                    });
                    if (!res.ok) {
                      alert('Error updating history');
                      return;
                    }
                    setShowHistoryForm(false);
                    setSelectedPatient(null);
                    // Refresh patient list
                    const data = await res.json();
                    setPatients(data.patients || []);
                  }}>
                    <input name="medical_history" type="text" placeholder="Medical History" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="allergies" type="text" placeholder="Allergies" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="admission_summary" type="text" placeholder="Admission Summary" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="discharge_summary" type="text" placeholder="Discharge Summary" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Update History</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => { setShowHistoryForm(false); setSelectedPatient(null); }}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'claims' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Claims Management</h2>
            <div className="mb-4">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-indigo-700" onClick={() => setShowClaimForm(true)}>Submit New Claim</button>
            </div>
            <table className="min-w-full text-sm mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Claim ID</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Fraud Score</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.id} className={`border-b ${claim.fraud_score > 70 ? 'bg-red-50' : ''}`}>
                    <td className="p-2">{claim.id}</td>
                    <td className="p-2">{claim.patient_name || claim.patient_id}</td>
                    <td className="p-2">{claim.status}</td>
                    <td className="p-2">{claim.fraud_score || 0}</td>
                    <td className="p-2">
                      <button className="text-blue-700 font-bold mr-2" onClick={() => setSelectedClaim(claim)}>View</button>
                      <button className="text-emerald-700 font-bold mr-2">Approve</button>
                      <button className="text-red-700 font-bold mr-2">Reject</button>
                      <button className="text-amber-700 font-bold">Escalate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold mb-2">Export Claim Report</button>
            <div className="text-sm text-red-600 mt-2">Fraud Alerts: {claims.filter(c => c.fraud_score > 70).length} flagged</div>
            {/* Claim Details Modal */}
            {selectedClaim && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Claim Details</h3>
                  <div className="mb-2 text-slate-700">Claim ID: {selectedClaim.id}</div>
                  <div className="mb-2 text-slate-700">Patient: {selectedClaim.patient_name || selectedClaim.patient_id}</div>
                  <div className="mb-2 text-slate-700">Status: {selectedClaim.status}</div>
                  <div className="mb-2 text-slate-700">Fraud Score: {selectedClaim.fraud_score || 0}</div>
                  <div className="mb-2 text-slate-700">Treatment: {selectedClaim.treatment_details || '-'}</div>
                  <div className="mb-2 text-slate-700">Invoice: {selectedClaim.invoice_url ? <a href={selectedClaim.invoice_url} className="text-blue-700 underline">Download</a> : '-'}</div>
                  <button className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setSelectedClaim(null)}>Close</button>
                </div>
              </div>
            )}
            {/* Claim Submission Form Modal */}
            {showClaimForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Submit New Claim</h3>
                  {/* TODO: Implement form fields and submission logic */}
                  <form>
                    <input type="text" placeholder="Patient ID" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="text" placeholder="Treatment Details" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="file" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Submit Claim</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowClaimForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'billing' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Billing & Invoices</h2>
            <div className="mb-4 flex gap-4 items-center">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowInvoiceForm(true)}>Generate Invoice</button>
            </div>
            <table className="min-w-full text-sm mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Invoice ID</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Outstanding</th>
                  <th className="p-2 text-left">Settlement</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billing.map(bill => (
                  <tr key={bill.invoice_id} className="border-b">
                    <td className="p-2">{bill.invoice_id}</td>
                    <td className="p-2">{bill.patient_name || bill.patient_id}</td>
                    <td className="p-2">KES {bill.amount}</td>
                    <td className="p-2">KES {bill.outstanding_balance}</td>
                    <td className="p-2">KES {bill.settlement}</td>
                    <td className="p-2">{bill.status}</td>
                    <td className="p-2">
                      <button className="text-blue-700 font-bold mr-2">Track Payment</button>
                      <button className="text-emerald-700 font-bold">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 text-slate-700 font-bold">Outstanding Balances</div>
            <div className="flex gap-6 mt-2">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-lg font-black text-blue-700">KES {billing.reduce((sum, b) => sum + (b.outstanding_balance || 0), 0)}</div>
                <div className="text-xs text-slate-500">Outstanding (Insurance)</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl text-center">
                <div className="text-lg font-black text-emerald-700">KES {billing.reduce((sum, b) => sum + (b.settlement || 0), 0)}</div>
                <div className="text-xs text-slate-500">Settlements</div>
              </div>
            </div>
            {/* Invoice Generation Modal */}
            {showInvoiceForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Generate Invoice</h3>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const patient_id = (form.elements.namedItem('patient_id') as HTMLInputElement).value;
                    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
                    const description = (form.elements.namedItem('description') as HTMLInputElement).value;
                    const due_date = (form.elements.namedItem('due_date') as HTMLInputElement).value;
                    if (!patient_id || !amount || !description || !due_date) {
                      alert('All fields are required.');
                      return;
                    }
                    const token = localStorage.getItem('smartsure_token');
                    const res = await fetch('/hospital/billing', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                      },
                      body: JSON.stringify({
                        patient_id,
                        amount: parseFloat(amount),
                        description,
                        due_date,
                        hospital_id: hospital.id
                      })
                    });
                    if (!res.ok) {
                      alert('Error generating invoice');
                      return;
                    }
                    setShowInvoiceForm(false);
                    // Refresh billing list
                    const data = await res.json();
                    setBilling(data.billing || []);
                  }}>
                    <input name="patient_id" type="text" placeholder="Patient ID" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="amount" type="number" placeholder="Amount" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="description" type="text" placeholder="Description" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input name="due_date" type="date" placeholder="Due Date" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Generate Invoice</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowInvoiceForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'insurance' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Insurance Provider Integration</h2>
            <div className="mb-4 flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search providers..."
                className="rounded-lg border px-4 py-2 w-64"
                value={providerSearch}
                onChange={e => setProviderSearch(e.target.value)}
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowPolicyForm(true)}>Verify Policy</button>
            </div>
            <table className="min-w-full text-sm mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Provider</th>
                  <th className="p-2 text-left">Tier</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-left">Accredited</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.filter(p =>
                  p.provider_name?.toLowerCase().includes(providerSearch.toLowerCase()) ||
                  p.tier?.toLowerCase().includes(providerSearch.toLowerCase())
                ).map(p => (
                  <tr key={p.provider_id} className="border-b">
                    <td className="p-2">{p.provider_name}</td>
                    <td className="p-2">{p.tier}</td>
                    <td className="p-2">{p.provider_id}</td>
                    <td className="p-2">{p.accredited ? 'Yes' : 'No'}</td>
                    <td className="p-2">
                      <button className="text-blue-700 font-bold mr-2" onClick={() => setSelectedProvider(p)}>Message</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Policy Verification Form Modal */}
            {showPolicyForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Verify Policy</h3>
                  {/* TODO: Implement form fields and submission logic */}
                  <form>
                    <input type="text" placeholder="Patient ID" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="text" placeholder="Provider ID" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Verify</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowPolicyForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
            {/* Secure Messaging Modal */}
            {selectedProvider && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Message {selectedProvider.provider_name}</h3>
                  {/* TODO: Implement messaging UI and logic */}
                  <textarea className="w-full rounded-lg border px-4 py-2 mb-2" rows={4} placeholder="Type your message..." />
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Send</button>
                  <button className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setSelectedProvider(null)}>Close</button>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'compliance' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Compliance & Accreditation</h2>
            <div className="mb-4 flex gap-4 items-center">
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowLicenseForm(true)}>Upload License</button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowConsentForm(true)}>Upload Consent</button>
            </div>
            <div className="mb-6">
              <div className="font-bold mb-2">Compliance Checklist</div>
              <ul className="list-disc ml-6 text-sm text-slate-700">
                <li>KYC/AML Compliance: {compliance.find(c => c.type === 'kyc_aml')?.status || 'Pending'}</li>
                <li>Licenses Uploaded: {compliance.filter(c => c.type === 'license').length}</li>
                <li>Consent Agreements: {compliance.filter(c => c.type === 'consent').length}</li>
                <li>Last Audit: {compliance.find(c => c.type === 'audit')?.date || '-'}</li>
              </ul>
            </div>
            <div className="mb-6">
              <div className="font-bold mb-2">Renewal Notifications</div>
              <ul className="list-disc ml-6 text-sm text-amber-700">
                {compliance.filter(c => c.renewal_due).map((c, i) => (
                  <li key={i}>{c.type} renewal due: {c.renewal_due}</li>
                ))}
                {compliance.filter(c => c.renewal_due).length === 0 && <li>No renewals due.</li>}
              </ul>
            </div>
            <div className="mb-6">
              <div className="font-bold mb-2">Audit Trail</div>
              <table className="min-w-full text-sm mb-2">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 text-left">Action</th>
                    <th className="p-2 text-left">User</th>
                    <th className="p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} className="border-b">
                      <td className="p-2">{log.action}</td>
                      <td className="p-2">{log.user}</td>
                      <td className="p-2">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* License Upload Form Modal */}
            {showLicenseForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Upload License</h3>
                  {/* TODO: Implement form fields and submission logic */}
                  <form>
                    <input type="text" placeholder="License Type" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="file" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Upload</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowLicenseForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
            {/* Consent Upload Form Modal */}
            {showConsentForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Upload Consent Agreement</h3>
                  {/* TODO: Implement form fields and submission logic */}
                  <form>
                    <input type="text" placeholder="Agreement Type" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="file" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Upload</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowConsentForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'appointments' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Appointments & Scheduling</h2>
            <div className="mb-4 flex gap-4 items-center">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowBookingForm(true)}>Book Appointment</button>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowAvailabilityForm(true)}>Update Doctor Availability</button>
            </div>
            <table className="min-w-full text-sm mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Doctor</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2">{a.patient_name || a.patient_id}</td>
                    <td className="p-2">{a.date}</td>
                    <td className="p-2">{a.doctor_name || '-'}</td>
                    <td className="p-2">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 text-slate-700 font-bold">Upcoming Appointments</div>
            <ul className="list-disc ml-6 text-sm text-slate-600">
              {appointments.filter(a => a.status === 'scheduled').map(a => (
                <li key={a.id}>{a.patient_name || a.patient_id} with {a.doctor_name || '-'} on {a.date}</li>
              ))}
              {appointments.filter(a => a.status === 'scheduled').length === 0 && <li>No upcoming appointments.</li>}
            </ul>
            {/* Appointment Booking Form Modal */}
            {showBookingForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Book Appointment</h3>
                  {/* TODO: Implement form fields and submission logic */}
                  <form>
                    <input type="text" placeholder="Patient ID" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="date" placeholder="Date" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="text" placeholder="Doctor Name" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Book</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowBookingForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
            {/* Doctor Availability Update Form Modal */}
            {showAvailabilityForm && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Update Doctor Availability</h3>
                  {/* TODO: Implement form fields and submission logic */}
                  <form>
                    <input type="text" placeholder="Doctor Name" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <input type="text" placeholder="Available Days" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Update</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowAvailabilityForm(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'analytics' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Analytics & Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="font-bold mb-2">Claim Success Rate</div>
                <div className="text-3xl font-black text-emerald-700">{analytics.claimSuccess}%</div>
                <div className="font-bold mb-2 mt-6">Claim Rejection Rate</div>
                <div className="text-3xl font-black text-red-700">{analytics.claimReject}%</div>
                <div className="font-bold mb-2 mt-6">Fraud Detection</div>
                <div className="text-3xl font-black text-amber-700">{analytics.fraudFlagged} flagged</div>
                <div className="font-bold mb-2 mt-6">Total Claims</div>
                <div className="text-3xl font-black text-blue-700">{analytics.totalClaims}</div>
              </div>
              <div>
                {/* TODO: Add interactive charts using recharts */}
                <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold mb-2" onClick={() => setShowReportBuilder(true)}>Custom Report Builder</button>
                <button className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold mb-2">Download Operational Report</button>
                <div className="text-sm text-slate-600">Exportable reports available</div>
              </div>
            </div>
            {/* Custom Report Builder Modal */}
            {showReportBuilder && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-[500px] shadow-xl">
                  <h3 className="text-xl font-black mb-4 text-slate-800">Custom Report Builder</h3>
                  {/* TODO: Implement report builder UI and logic */}
                  <form>
                    <input type="text" placeholder="Report Name" className="mb-2 w-full rounded-lg border px-4 py-2" />
                    <select className="mb-2 w-full rounded-lg border px-4 py-2">
                      <option>Claims</option>
                      <option>Fraud</option>
                      <option>Outcomes</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold mt-2">Generate</button>
                    <button type="button" className="ml-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold mt-2" onClick={() => setShowReportBuilder(false)}>Cancel</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'logs' && (
          <section>
            <h2 className="text-2xl font-black mb-6 text-slate-800">System Logs</h2>
            <div className="mb-4 flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search logs..."
                className="rounded-lg border px-4 py-2 w-64"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Export Logs</button>
            </div>
            <table className="min-w-full text-sm mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left">Action</th>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Alert</th>
                </tr>
              </thead>
              <tbody>
                {logs.filter(log =>
                  log.action?.toLowerCase().includes(logSearch.toLowerCase()) ||
                  log.user?.toLowerCase().includes(logSearch.toLowerCase()) ||
                  log.role?.toLowerCase().includes(logSearch.toLowerCase())
                ).map(log => (
                  <tr key={log.id} className={`border-b ${log.alert ? 'bg-red-50' : ''}`}>
                    <td className="p-2">{log.action}</td>
                    <td className="p-2">{log.user}</td>
                    <td className="p-2">{log.role}</td>
                    <td className="p-2">{log.date}</td>
                    <td className="p-2">{log.alert ? <span className="text-red-700 font-bold">{log.alert}</span> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 text-slate-700 font-bold">Compliance Alerts</div>
            <ul className="list-disc ml-6 text-sm text-red-700">
              {logs.filter(log => log.alert).map(log => (
                <li key={log.id}>{log.alert} ({log.action}, {log.date})</li>
              ))}
              {logs.filter(log => log.alert).length === 0 && <li>No compliance alerts.</li>}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default HospitalDashboard;
