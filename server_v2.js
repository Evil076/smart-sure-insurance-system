// Express server for API routes
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

app.post('/api/create-hospital-account', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).send('Missing required fields');
    return;
  }
  // Try to check if email exists
  try {
    const { data: existing } = await supabase.from('users').select('email').eq('email', email);
    if (existing && existing.length > 0) {
      res.status(409).send('Email already exists');
      return;
    }
  } catch (e) { /* table might not exist */ }
  
  // Create user in Supabase Auth
  const { error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: 'hospital_admin' },
    email_confirm: true
  });
  if (authError) {
    res.status(500).send(authError.message);
    return;
  }
  
  // Try to insert into users table
  try {
    await supabase.from('users').insert([
      { full_name: name, email, password_hash: 'auth', role: 'hospital_admin' }
    ]);
  } catch (e) { /* table might not exist */ }
  
  res.status(200).json({ success: true });
});

// Create insurance provider account
app.post('/api/create-insurance-provider-account', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).send('Missing required fields');
    return;
  }
  // Try to check if email exists
  try {
    const { data: existing } = await supabase.from('users').select('email').eq('email', email);
    if (existing && existing.length > 0) {
      res.status(409).send('Email already exists');
      return;
    }
  } catch (e) { /* table might not exist */ }
  
  // Create user in Supabase Auth
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
  
  // Try to insert into users table
  try {
    await supabase.from('users').insert([
      { full_name: name, email, password_hash: 'auth', role: 'insurance_provider' }
    ]);
  } catch (e) { /* table might not exist */ }
  
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 4000;

// Hospital Dashboard API Endpoints
app.get('/hospital/dashboard', async (req, res) => {
  try {
    const hospitalId = req.query.hospital_id || 'default-hospital';
    const { data: patients } = await supabase.from('patients').select('id').eq('hospital_id', hospitalId);
    const { data: claims } = await supabase.from('claims').select('id, status').eq('hospital_id', hospitalId);
    const { data: billing } = await supabase.from('billing').select('*').eq('hospital_id', hospitalId);
    const activePatients = patients?.length || 0;
    const claimsSubmitted = claims?.length || 0;
    const pendingClaims = claims?.filter(c => c.status === 'pending').length || 0;
    const approvedClaims = claims?.filter(c => c.status === 'approved').length || 0;
    const rejectedClaims = claims?.filter(c => c.status === 'rejected').length || 0;
    const outstandingBalances = billing?.reduce((sum, b) => sum + (b.outstanding_balance || 0), 0) || 0;
    const settlements = billing?.reduce((sum, b) => sum + (b.settlement || 0), 0) || 0;
    res.json({
      active_patients: activePatients,
      claims_submitted: claimsSubmitted,
      reimbursements: settlements,
      pending_claims: pendingClaims,
      approved_claims: approvedClaims,
      rejected_claims: rejectedClaims,
      outstanding_balances: outstandingBalances,
      settlements: settlements,
      notifications: [],
      fraud_alerts: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
