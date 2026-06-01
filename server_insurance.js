// Express server for Insurance Provider API routes - Real Data Only
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env.local' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 4000;

// ============ Dashboard API ============
app.get('/api/insurance/dashboard', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    
    const { data: policies } = await supabase.from('policies').select('id, status').eq('provider_id', providerId);
    const { data: claims } = await supabase.from('claims').select('id, status, amount').eq('provider_id', providerId);
    const { data: hospitals } = await supabase.from('hospitals').select('id');
    const { data: customers } = await supabase.from('users').select('id').eq('role', 'patient');
    
    const activePolicies = policies?.filter(p => p.status === 'active').length || 0;
    const claimsInProgress = claims?.filter(c => c.status === 'pending').length || 0;
    const approvedClaims = claims?.filter(c => c.status === 'approved').length || 0;
    const rejectedClaims = claims?.filter(c => c.status === 'rejected').length || 0;
    const flaggedClaims = claims?.filter(c => c.fraud_score > 70).length || 0;
    const premiumsCollected = claims?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
    
    res.json({
      activePolicies,
      claimsInProgress,
      approvedClaims,
      rejectedClaims,
      flaggedClaims,
      premiumsCollected,
      partneredHospitals: hospitals?.length || 0,
      enrolledPatients: customers?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Policies API ============
app.get('/api/insurance/policies', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const { data, error } = await supabase.from('policies').select('*').eq('provider_id', providerId);
    if (error) throw error;
    res.json({ policies: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/insurance/policies', async (req, res) => {
  try {
    const { name, type, premium, coverage, provider_id } = req.body;
    const { data, error } = await supabase.from('policies').insert([{
      name, type, premium, coverage, provider_id, status: 'active'
    }]).select();
    if (error) throw error;
    res.json({ success: true, policy: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/insurance/policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, premium, coverage, status } = req.body;
    const { data, error } = await supabase.from('policies').update({ name, premium, coverage, status }).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, policy: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Claims API ============
app.get('/api/insurance/claims', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const status = req.query.status;
    
    let query = supabase.from('claims').select('*').eq('provider_id', providerId);
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ claims: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/insurance/claims', async (req, res) => {
  try {
    const { patient_name, amount, treatment, hospital, diagnosis, provider_id } = req.body;
    const { data, error } = await supabase.from('claims').insert([{
      patient_name, amount, treatment, hospital, diagnosis, provider_id, status: 'pending', fraud_score: 0
    }]).select();
    if (error) throw error;
    res.json({ success: true, claim: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/insurance/claims/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const { data, error } = await supabase.from('claims').update({ status, notes }).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, claim: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Fraud Detection API ============
app.get('/api/insurance/fraud/alerts', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const { data, error } = await supabase.from('claims')
      .select('id, patient_name, fraud_score, status')
      .eq('provider_id', providerId)
      .gt('fraud_score', 70);
    if (error) throw error;
    res.json({ alerts: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/insurance/fraud/score', async (req, res) => {
  try {
    const { claim_id } = req.body;
    const { data, error } = await supabase.from('claims').select('fraud_score').eq('id', claim_id).single();
    if (error) throw error;
    res.json({ score: data?.fraud_score || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Customers API ============
app.get('/api/insurance/customers', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const { data, error } = await supabase.from('users')
      .select('id, full_name, email, phone_number, created_at')
      .eq('role', 'patient');
    if (error) throw error;
    res.json({ customers: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/insurance/customers', async (req, res) => {
  try {
    const { full_name, email, phone_number, provider_id } = req.body;
    const { data, error } = await supabase.from('users').insert([{
      full_name, email, phone_number, provider_id, role: 'patient'
    }]).select();
    if (error) throw error;
    res.json({ success: true, customer: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Payments API ============
app.get('/api/insurance/payments', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const { data, error } = await supabase.from('billing')
      .select('*')
      .eq('provider_id', providerId);
    if (error) throw error;
    res.json({ payments: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/insurance/payments', async (req, res) => {
  try {
    const { patient_id, amount, type, provider_id } = req.body;
    const { data, error } = await supabase.from('billing').insert([{
      patient_id, amount, type, provider_id, status: 'pending'
    }]).select();
    if (error) throw error;
    res.json({ success: true, payment: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Reports API ============
app.get('/api/insurance/reports', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const type = req.query.type || 'summary';
    
    const { data: policies } = await supabase.from('policies').select('status').eq('provider_id', providerId);
    const { data: claims } = await supabase.from('claims').select('status').eq('provider_id', providerId);
    
    const reports = {
      totalPolicies: policies?.length || 0,
      activeClaims: claims?.filter(c => c.status === 'pending').length || 0,
      approvedClaims: claims?.filter(c => c.status === 'approved').length || 0,
      rejectedClaims: claims?.filter(c => c.status === 'rejected').length || 0
    };
    
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Compliance API ============
app.get('/api/insurance/compliance', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const { data, error } = await supabase.from('audit_logs')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ compliance: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Admin API ============
app.get('/api/insurance/admin/users', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const { data, error } = await supabase.from('users')
      .select('*')
      .eq('provider_id', providerId)
      .in('role', ['admin', 'insurance_provider']);
    if (error) throw error;
    res.json({ users: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/insurance/admin/users', async (req, res) => {
  try {
    const { full_name, email, role, provider_id } = req.body;
    const { data, error } = await supabase.from('users').insert([{
      full_name, email, role, provider_id
    }]).select();
    if (error) throw error;
    res.json({ success: true, user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/insurance/settings', async (req, res) => {
  try {
    const providerId = req.query.provider_id || 'default';
    const { data, error } = await supabase.from('insurance_providers')
      .select('*')
      .eq('provider_id', providerId)
      .single();
    if (error) throw error;
    res.json({ settings: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Hospitals API ============
app.get('/api/insurance/hospitals', async (req, res) => {
  try {
    const { data, error } = await supabase.from('hospitals').select('*');
    if (error) throw error;
    res.json({ hospitals: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Create insurance provider account ============
app.post('/api/create-insurance-provider-account', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).send('Missing required fields');
    return;
  }
  
  const { error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: 'insurance_provider' },
    email_confirm: true
  });
  if (authError) {
    res.status(500).send(authError.message);
    return;
  }
  
  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Insurance Provider API server running on port ${PORT}`);
});
