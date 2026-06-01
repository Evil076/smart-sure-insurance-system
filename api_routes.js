// Insurance Provider Dashboard API Endpoints

// Dashboard Metrics
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const { data: policies } = await supabase.from('policies').select('id, status');
    const { data: claims } = await supabase.from('claims').select('id, status, fraud_score');
    const activePolicies = policies?.filter(p => p.status === 'active').length || 0;
    const pendingClaims = claims?.filter(c => c.status === 'pending').length || 0;
    const fraudAlerts = claims?.filter(c => c.fraud_score > 70).length || 0;
    res.json({ activePolicies, pendingClaims, fraudAlerts, totalClaims: claims?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/notifications', async (req, res) => {
  res.json({ notifications: [] });
});

// Policies Endpoints
app.get('/api/policies', async (req, res) => {
  try {
    const { data, error } = await supabase.from('policies').select('*');
    res.json({ policies: data || [], total: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/policies/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('policies').select('*').eq('id', req.params.id).single();
    res.json({ policy: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/policies', async (req, res) => {
  try {
    const { data, error } = await supabase.from('policies').insert([req.body]).select();
    res.json({ policy: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/policies/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('policies').update(req.body).eq('id', req.params.id).select();
    res.json({ policy: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claims Endpoints
app.get('/api/claims', async (req, res) => {
  try {
    const { data, error } = await supabase.from('claims').select('*');
    res.json({ claims: data || [], total: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/claims/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('claims').select('*').eq('id', req.params.id).single();
    res.json({ claim: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/claims', async (req, res) => {
  try {
    const { data, error } = await supabase.from('claims').insert([{ ...req.body, status: 'pending' }]).select();
    res.json({ claim: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/claims/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('claims').update(req.body).eq('id', req.params.id).select();
    res.json({ claim: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fraud Detection Endpoints
app.post('/api/fraud/score', async (req, res) => {
  try {
    const { claim_id } = req.body;
    const { data: claim } = await supabase.from('claims').select('*').eq('id', claim_id).single();
    if (!claim) { res.status(404).json({ error: 'Claim not found' }); return; }
    let score = 0;
    const flags = [];
    if (claim.amount > 500000) { score += 25; flags.push('abnormal_amount_high'); }
    if (claim.amount < 1000) { score += 10; flags.push('abnormal_amount_low'); }
    await supabase.from('claims').update({ fraud_score: score }).eq('id', claim_id);
    res.json({ claim_id, score, flags, decision: score < 40 ? 'auto_approve' : score <= 70 ? 'manual_review' : 'auto_flag' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fraud/alerts', async (req, res) => {
  try {
    const { data } = await supabase.from('claims').select('*').gt('fraud_score', 70);
    const alerts = data?.map(c => ({ claim_id: c.id, score: c.fraud_score, amount: c.amount })) || [];
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fraud/audit/:claimId', async (req, res) => {
  try {
    const { data } = await supabase.from('audit_logs').select('*').eq('claim_id', req.params.claimId);
    res.json({ audit_logs: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers Endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('role', 'patient');
    res.json({ customers: data || [], total: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { data: customer } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    const { data: policies } = await supabase.from('policies').select('*').eq('holder_id', req.params.id);
    const { data: claims } = await supabase.from('claims').select('*').eq('patient_id', req.params.id);
    res.json({ customer, policies: policies || [], claims: claims || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').insert([{ ...req.body, role: 'patient' }]).select();
    res.json({ customer: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').update(req.body).eq('id', req.params.id).select();
    res.json({ customer: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments Endpoints
app.get('/api/payments', async (req, res) => {
  try {
    const { data } = await supabase.from('payments').select('*');
    res.json({ payments: data || [], total: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payments/:id', async (req, res) => {
  try {
    const { data } = await supabase.from('payments').select('*').eq('id', req.params.id).single();
    res.json({ payment: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payments').insert([{ ...req.body, status: 'completed' }]).select();
    res.json({ payment: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reports Endpoints
app.get('/api/reports/policies', async (req, res) => {
  try {
    const { data } = await supabase.from('policies').select('*');
    res.json({ total: data?.length || 0, active: data?.filter(p => p.status === 'active').length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/claims', async (req, res) => {
  try {
    const { data } = await supabase.from('claims').select('*');
    res.json({ total: data?.length || 0, pending: data?.filter(c => c.status === 'pending').length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/fraud', async (req, res) => {
  try {
    const { data } = await supabase.from('claims').select('*');
    const highRisk = data?.filter(c => c.fraud_score > 70).length || 0;
    res.json({ totalScored: data?.length || 0, highRisk, fraudRate: data?.length ? ((highRisk / data.length) * 100).toFixed(2) : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compliance & Audit Endpoints
app.get('/api/audit/logs', async (req, res) => {
  try {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    res.json({ audit_logs: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/compliance/checklist', async (req, res) => {
  res.json({ checklist: [
    { id: 'kyc', name: 'KYC/AML Compliance', status: 'active' },
    { id: 'data_protection', name: 'Data Protection', status: 'active' },
    { id: 'financial_reporting', name: 'Financial Reporting', status: 'pending' }
  ]});
});

// Admin & Settings Endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const { data } = await supabase.from('users').select('*');
    res.json({ users: data || [], total: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').insert([req.body]).select();
    res.json({ user: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').update(req.body).eq('id', req.params.id).select();
    res.json({ user: data[0], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/settings', async (req, res) => {
  res.json({ companyName: 'SmartSure Insurance', fraudThresholdAutoApprove: 40, fraudThresholdManualReview: 70 });
});
