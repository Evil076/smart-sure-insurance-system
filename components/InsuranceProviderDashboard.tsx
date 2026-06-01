import React, { useState, useEffect } from 'react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'policies', label: 'Policies' },
  { id: 'claims', label: 'Claims' },
  { id: 'fraud', label: 'Fraud Detection' },
  { id: 'customers', label: 'Customers' },
  { id: 'payments', label: 'Payments & Billing' },
  { id: 'reports', label: 'Reports & Analytics' },
  { id: 'compliance', label: 'Compliance & Audit' },
  { id: 'admin', label: 'Admin & Settings' }
];

const API_BASE = 'http://localhost:4000/api/insurance';

const InsuranceProviderDashboard: React.FC<{ provider?: any }> = ({ provider }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="w-64 bg-emerald-900 text-white flex flex-col py-8 px-2 min-h-screen fixed">
          <div className="font-black text-2xl px-6 mb-8">Insurance Hub</div>
          <nav className="flex-1 flex flex-col gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-6 py-3 rounded-lg font-bold text-lg transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl' : 'hover:bg-emerald-800 text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-10 ml-64">
          {activeTab === 'dashboard' && <DashboardTab provider={provider} />}
          {activeTab === 'policies' && <PoliciesTab provider={provider} />}
          {activeTab === 'claims' && <ClaimsTab provider={provider} />}
          {activeTab === 'fraud' && <FraudTab provider={provider} />}
          {activeTab === 'customers' && <CustomersTab provider={provider} />}
          {activeTab === 'payments' && <PaymentsTab provider={provider} />}
          {activeTab === 'reports' && <ReportsTab provider={provider} />}
          {activeTab === 'compliance' && <ComplianceTab provider={provider} />}
          {activeTab === 'admin' && <AdminTab provider={provider} />}
        </main>
      </div>
    </div>
  );
};

const DashboardTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/dashboard?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(() => setMetrics({}))
      .finally(() => setLoading(false));
  }, [provider]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-indigo-50 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-indigo-700">{metrics.activePolicies ?? 0}</div>
            <div className="text-xs text-slate-500">Active Policies</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-emerald-700">{metrics.claimsInProgress ?? 0}</div>
            <div className="text-xs text-slate-500">Claims In Progress</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-red-700">{metrics.flaggedClaims ?? 0}</div>
            <div className="text-xs text-slate-500">Flagged Claims</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-blue-700">{metrics.partneredHospitals ?? 0}</div>
            <div className="text-xs text-slate-500">Partnered Hospitals</div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Claims Summary</h3>
        <div className="flex gap-4">
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-xl font-bold">Pending: {metrics.claimsInProgress ?? 0}</span>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-xl font-bold">Approved: {metrics.approvedClaims ?? 0}</span>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl font-bold">Rejected: {metrics.rejectedClaims ?? 0}</span>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Enrolled Patients</h3>
        <div className="text-3xl font-black text-slate-700">{metrics.enrolledPatients ?? 0}</div>
      </section>
    </div>
  );
};


const PoliciesTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', premium: '', coverage: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [policyDocUrl, setPolicyDocUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/policies?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setPolicies(data.policies || []))
      .catch(() => setPolicies([]))
      .finally(() => setLoading(false));

    // Fetch policy document URL
    if (provider?.id) {
      fetch(`/api/policy-document/${provider.id}`)
        .then(res => res.json())
        .then(data => setPolicyDocUrl(data.url))
        .catch(() => setPolicyDocUrl(null));
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `${API_BASE}/policies/${editId}` : `${API_BASE}/policies`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, provider_id: provider?.id || 'default' })
    });
    setShowForm(false);
    setEditId(null);
    setFormData({ name: '', type: '', premium: '', coverage: '' });
    const res = await fetch(`${API_BASE}/policies?provider_id=${provider?.id || 'default'}`);
    const data = await res.json();
    setPolicies(data.policies || []);
  };

  const handlePolicyDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !provider?.id) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    const res = await fetch(`/api/policy-document/${provider.id}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.url) setPolicyDocUrl(data.url);
    setUploading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Policies</h2>
        <button 
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold"
          onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: '', type: '', premium: '', coverage: '' }); }}
        >
          Add Policy
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">Policy Document (PDF/Word)</h3>
        {policyDocUrl ? (
          <a href={policyDocUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">View Current Policy Document</a>
        ) : (
          <span className="text-slate-500">No policy document uploaded.</span>
        )}
        <div className="mt-2">
          <input type="file" accept=".pdf,.doc,.docx" onChange={handlePolicyDocUpload} disabled={uploading} />
          {uploading && <span className="ml-2 text-xs text-slate-500">Uploading...</span>}
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : policies.length === 0 ? (
        <div className="text-slate-500">No policies found.</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Premium</th>
              <th className="p-3 text-left">Coverage</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p: any) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.type}</td>
                <td className="p-3">{p.premium}</td>
                <td className="p-3">{p.coverage}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">
                  <button 
                    className="text-emerald-600 font-bold mr-2"
                    onClick={() => { setEditId(p.id); setFormData(p); setShowForm(true); }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl">
            <h3 className="text-xl font-black mb-4 text-slate-800">{editId ? 'Edit Policy' : 'Add Policy'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full border rounded-lg px-4 py-2" placeholder="Policy Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              <input className="w-full border rounded-lg px-4 py-2" placeholder="Type (Individual/Family/Corporate)" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required />
              <input className="w-full border rounded-lg px-4 py-2" placeholder="Premium" type="number" value={formData.premium} onChange={e => setFormData({ ...formData, premium: e.target.value })} required />
              <input className="w-full border rounded-lg px-4 py-2" placeholder="Coverage" type="number" value={formData.coverage} onChange={e => setFormData({ ...formData, coverage: e.target.value })} required />
              <div className="flex gap-2 justify-end">
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">{editId ? ' Update' : ' Create'}</button>
                <button type="button" className="bg-slate-400 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ClaimsTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/claims?provider_id=${provider?.id || 'default'}&status=${filter}`)
      .then(res => res.json())
      .then(data => setClaims(data.claims || []))
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, [provider, filter]);

  const updateClaimStatus = async (id: string, status: string) => {
    await fetch(`${API_BASE}/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    const res = await fetch(`${API_BASE}/claims?provider_id=${provider?.id || 'default'}&status=${filter}`);
    const data = await res.json();
    setClaims(data.claims || []);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">Claims</h2>
        <select 
          className="border rounded-lg px-4 py-2"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : claims.length === 0 ? (
        <div className="text-slate-500">No claims found.</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Treatment</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Fraud Score</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c: any) => (
              <tr key={c.id} className="border-b">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.patient_name}</td>
                <td className="p-3">{c.amount}</td>
                <td className="p-3">{c.treatment}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-3">{c.fraud_score}</td>
                <td className="p-3">
                  {c.status === 'pending' && (
                    <>
                      <button className="text-emerald-600 font-bold mr-2" onClick={() => updateClaimStatus(c.id, 'approved')}>Approve</button>
                      <button className="text-red-600 font-bold mr-2" onClick={() => updateClaimStatus(c.id, 'rejected')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const FraudTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/fraud/alerts?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setAlerts(data.alerts || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Fraud Detection</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="text-slate-500">No fraud alerts.</div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert: any) => (
            <div key={alert.id} className="bg-white rounded-xl p-6 shadow border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">Claim: {alert.id}</div>
                  <div className="text-slate-600">Fraud Score: {alert.fraud_score}</div>
                </div>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">High Risk</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomersTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/customers?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setCustomers(data.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Customers</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : customers.length === 0 ? (
        <div className="text-slate-500">No customers found.</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.id} className="border-b">
                <td className="p-3">{c.full_name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone_number}</td>
                <td className="p-3">{c.created_at?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const PaymentsTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/payments?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setPayments(data.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Payments & Billing</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : payments.length === 0 ? (
        <div className="text-slate-500">No payments found.</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.patient_id}</td>
                <td className="p-3">{p.amount}</td>
                <td className="p-3">{p.type}</td>
                <td className="p-3">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const ReportsTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [reports, setReports] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/reports?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setReports(data.reports || {}))
      .catch(() => setReports({}))
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Reports & Analytics</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-black text-slate-700">{reports.totalPolicies ?? 0}</div>
            <div className="text-sm text-slate-500">Total Policies</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-black text-emerald-700">{reports.approvedClaims ?? 0}</div>
            <div className="text-sm text-slate-500">Approved Claims</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-black text-red-700">{reports.rejectedClaims ?? 0}</div>
            <div className="text-sm text-slate-500">Rejected Claims</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-black text-amber-700">{reports.activeClaims ?? 0}</div>
            <div className="text-sm text-slate-500">Active Claims</div>
          </div>
        </div>
      )}
    </div>
  );
};

const ComplianceTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/compliance?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setLogs(data.compliance || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Compliance & Audit</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-slate-500">No audit logs found.</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-b">
                <td className="p-3">{log.action}</td>
                <td className="p-3">{log.user}</td>
                <td className="p-3">{log.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const AdminTab: React.FC<{ provider?: any }> = ({ provider }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/users?provider_id=${provider?.id || 'default'}`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Admin & Settings</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-slate-500">No admin users found.</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.status || 'active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InsuranceProviderDashboard;
