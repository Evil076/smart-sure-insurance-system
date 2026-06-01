import React from 'react';

const InsuranceProviderPolicyManagement: React.FC = () => {
  // Policy Management Tab Implementation
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* 1. Policy Overview */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-4">Policy Overview</h2>
        <div className="flex gap-4 mb-4">
          <button className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold">Individual</button>
          <button className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold">Family</button>
          <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold">Corporate</button>
        </div>
        <input type="text" placeholder="Search by Policy ID, Patient, Hospital" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 text-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="font-bold">Active Policies</div>
            <div className="text-3xl font-black text-indigo-700">1,800</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl">
            <div className="font-bold">Expired Policies</div>
            <div className="text-3xl font-black text-amber-700">120</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="font-bold">Pending Policies</div>
            <div className="text-3xl font-black text-blue-700">80</div>
          </div>
        </div>
      </section>

      {/* 2. Policy Creation */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Create New Policy</h3>
        <form className="space-y-4">
          <input type="text" placeholder="Policy ID" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
            <option>Individual</option>
            <option>Family</option>
            <option>Corporate</option>
          </select>
          <input type="text" placeholder="Coverage Details" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          <input type="text" placeholder="Exclusions" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          <input type="text" placeholder="Co-pays" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          <input type="text" placeholder="Premium Schedule" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-indigo-700">Create Policy</button>
        </form>
        <div className="mt-4 flex gap-4">
          <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold">Link Patient/Member</button>
          <button className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold">Link Hospital/Provider</button>
        </div>
        <div className="mt-2 text-sm text-red-600">Compliance check required before activation.</div>
      </section>

      {/* 3. Policy Editing & Renewal */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Edit & Renewal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-2">Edit Policy</div>
            <div className="text-sm text-slate-600">Coverage, Premiums, Exclusions</div>
            <button className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold mt-2">Edit</button>
          </div>
          <div>
            <div className="font-bold mb-2">Renewal & Cancellation</div>
            <div className="text-sm text-slate-600">Renewal reminders enabled</div>
            <div className="text-sm text-slate-600">Audit logging for cancellations</div>
            <button className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold mt-2">Renew</button>
            <button className="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold mt-2">Cancel</button>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-600">Version history available for all policy changes.</div>
      </section>

      {/* 4. Coverage Details */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Coverage Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-2">Limits</div>
            <div className="text-sm text-slate-600">Annual: KES 1M</div>
            <div className="text-sm text-slate-600">Lifetime: KES 5M</div>
          </div>
          <div>
            <div className="font-bold mb-2">Exclusions</div>
            <div className="text-sm text-slate-600">Pre-existing conditions, Cosmetic, Dental</div>
            <div className="font-bold mb-2 mt-4">Co-pay & Deductible</div>
            <div className="text-sm text-slate-600">Co-pay: 10%</div>
            <div className="text-sm text-slate-600">Deductible: KES 5,000</div>
            <div className="font-bold mb-2 mt-4">Linked Benefits</div>
            <div className="text-sm text-slate-600">Wellness, Preventive Care</div>
          </div>
        </div>
      </section>

      {/* 5. Fraud Detection Integration (Grok Agent) */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Fraud Detection (Grok Agent)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-2">Real-time Monitoring</div>
            <div className="text-sm text-slate-600">Risk scoring for unusual activity</div>
            <div className="text-sm text-slate-600">Explainable AI: Duplicate enrollments flagged</div>
          </div>
          <div>
            <div className="font-bold mb-2">Alerts & Escalation</div>
            <div className="text-sm text-red-600">2 policies flagged for review</div>
            <div className="text-sm text-slate-600">Escalation workflow active</div>
          </div>
        </div>
      </section>

      {/* 6. Hospital & Provider Linking */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Hospital & Provider Linking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-2">Linked Hospitals/Clinics</div>
            <div className="text-sm text-slate-600">Kisii County Hospital, Aga Khan, Nairobi Hospital</div>
            <div className="text-sm text-slate-600">Accreditation: All valid</div>
          </div>
          <div>
            <div className="font-bold mb-2">Provider Verification</div>
            <button className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold mb-2">Verify Provider</button>
            <div className="text-sm text-slate-600">Eligibility: Passed</div>
          </div>
        </div>
      </section>

      {/* 7. Patient/Member Linking */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Patient/Member Linking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-2">Enrolled Patients & Dependents</div>
            <div className="text-sm text-slate-600">Patient: Jane Doe</div>
            <div className="text-sm text-slate-600">Dependents: 2</div>
          </div>
          <div>
            <div className="font-bold mb-2">Claim History</div>
            <div className="text-sm text-slate-600">Claims: 5 submitted, 4 approved</div>
            <div className="text-sm text-red-600">Fraud Alerts: 1 flagged</div>
          </div>
        </div>
      </section>

      {/* 8. Compliance & Audit */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Compliance & Audit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-2">Regulatory Checklist</div>
            <div className="text-sm text-slate-600">All requirements met</div>
            <div className="text-sm text-slate-600">KYC/AML: Verified</div>
          </div>
          <div>
            <div className="font-bold mb-2">Audit Logs & Consent</div>
            <div className="text-sm text-slate-600">Audit logs available</div>
            <div className="text-sm text-slate-600">Patient/Provider agreements: 98% signed</div>
          </div>
        </div>
      </section>

      {/* 9. Analytics & Reports */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4">Analytics & Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-2">Performance Metrics</div>
            <div className="text-sm text-slate-600">Loss Ratio: 0.67</div>
            <div className="text-sm text-slate-600">Profitability: KES 4M</div>
            <div className="text-sm text-slate-600">Renewal Rate: 92%</div>
          </div>
          <div>
            <div className="font-bold mb-2">Claim Success/Reject Rates</div>
            <div className="text-sm text-slate-600">Success: 88%</div>
            <div className="text-sm text-slate-600">Reject: 12%</div>
            <div className="font-bold mb-2 mt-4">Fraud Detection</div>
            <div className="text-sm text-red-600">2 policies flagged</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InsuranceProviderPolicyManagement;
