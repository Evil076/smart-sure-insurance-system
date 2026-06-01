// PDF text extraction for policy documents
const fs = require('fs');
let pdfParse;
try { pdfParse = require('pdf-parse'); } catch (e) { pdfParse = null; }

// GET /api/policy-document/:providerId/text
app.get('/api/policy-document/:providerId/text', async (req, res) => {
  if (!pdfParse) return res.status(500).json({ error: 'pdf-parse not installed' });
  const providerId = req.params.providerId;
  const { data, error } = await supabase.from('insurance_providers').select('policy_doc_url').eq('provider_id', providerId).single();
  if (error || !data || !data.policy_doc_url) return res.status(404).json({ error: 'No policy document found' });
  const filePath = path.join(__dirname, data.policy_doc_url.replace(/^\/uploads/, 'uploads'));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(buffer);
    res.json({ text: pdfData.text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract PDF text' });
  }
});
// --- Policy Document Upload (per insurance provider) ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or Word documents allowed!'));
    }
  }
});

// POST /api/policy-document/:providerId
app.post('/api/policy-document/:providerId', upload.single('file'), async (req, res) => {
  const { providerId } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  // Store file URL in insurance_providers table
  const { error } = await supabase.from('insurance_providers').update({ policy_doc_url: fileUrl }).eq('provider_id', providerId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, url: fileUrl });
});

// GET /api/policy-document/:providerId
app.get('/api/policy-document/:providerId', async (req, res) => {
  const { providerId } = req.params;
  const { data, error } = await supabase.from('insurance_providers').select('policy_doc_url').eq('provider_id', providerId).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data || !data.policy_doc_url) return res.status(404).json({ error: 'No policy document found' });
  res.json({ url: data.policy_doc_url });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// --- Insurance Provider Dashboard APIs ---
// Dashboard metrics and notifications
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    // Example: Replace with real Supabase queries
    const { data: policies } = await supabase.from('policies').select('*');
    const { data: claims } = await supabase.from('claims').select('*');
    const { data: frauds } = await supabase.from('claims').select('id').eq('status', 'flagged');
    const { data: payments } = await supabase.from('payments').select('amount');
    const { data: reimbursements } = await supabase.from('billing').select('settlement');

    const activePolicies = policies?.filter(p => p.status === 'Active').length || 0;
    const claimsInProgress = claims?.filter(c => c.status === 'Pending').length || 0;
    const fraudAlerts = frauds?.length || 0;
    const premiumsCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const reimbursementsTotal = reimbursements?.reduce((sum, b) => sum + (b.settlement || 0), 0) || 0;

    res.json({
      activePolicies,
      claimsInProgress,
      fraudAlerts,
      premiumsCollected: `KES ${premiumsCollected}`,
      reimbursements: `KES ${reimbursementsTotal}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/notifications', async (req, res) => {
  try {
    // Example: Fetch notifications from Supabase (replace with your table)
    const { data: notifications } = await supabase.from('notifications').select('*');
    if (!notifications || notifications.length === 0) {
      res.json([
        'Compliance deadline March 15, 2026',
        'Suspicious activity detected',
        'New claim submitted by Jane Doe'
      ]);
    } else {
      res.json(notifications.map(n => n.message));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Policies CRUD
app.get('/api/policies', async (req, res) => {
  const { data, error } = await supabase.from('policies').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ policies: data || [] });
});
app.post('/api/policies', async (req, res) => {
  const { policy_number, holder, type, status } = req.body;
  const { error } = await supabase.from('policies').insert([{ policy_number, holder, type, status }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.put('/api/policies/:id', async (req, res) => {
  const { policy_number, holder, type, status } = req.body;
  const { id } = req.params;
  const { error } = await supabase.from('policies').update({ policy_number, holder, type, status }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.get('/api/policies/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('policies').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ policy: data });
});


// Claims CRUD
app.get('/api/claims', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('claims').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ claims: data || [] });
});
app.post('/api/claims', requireAuth, async (req, res) => {
  const { claim_number, policy_number, status, amount } = req.body;
  const { error } = await supabase.from('claims').insert([{ claim_number, policy_number, status, amount }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.put('/api/claims/:id', requireAuth, async (req, res) => {
  const { claim_number, policy_number, status, amount } = req.body;
  const { id } = req.params;
  const { error } = await supabase.from('claims').update({ claim_number, policy_number, status, amount }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.get('/api/claims/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('claims').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ claim: data });
});


// Fraud Detection
app.post('/api/fraud/score', requireAuth, async (req, res) => {
  // Example: You can implement real scoring logic here
  res.json({ score: 55, flags: ['duplicate claim'] });
});
app.get('/api/fraud/alerts', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('fraud_alerts').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ alerts: data || [] });
});
app.get('/api/fraud/audit/:claimId', requireAuth, async (req, res) => {
  const { claimId } = req.params;
  const { data, error } = await supabase.from('fraud_audit').select('*').eq('claim_id', claimId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ audit: data || [] });
});


// Customers CRUD
app.get('/api/customers', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ customers: data || [] });
});
app.post('/api/customers', requireAuth, async (req, res) => {
  const { name, email, phone } = req.body;
  const { error } = await supabase.from('customers').insert([{ name, email, phone }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.put('/api/customers/:id', requireAuth, async (req, res) => {
  const { name, email, phone } = req.body;
  const { id } = req.params;
  const { error } = await supabase.from('customers').update({ name, email, phone }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.get('/api/customers/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ customer: data });
});


// Payments
app.get('/api/payments', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('payments').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ payments: data || [] });
});
app.post('/api/payments', requireAuth, async (req, res) => {
  const { payment_number, customer, amount, date } = req.body;
  const { error } = await supabase.from('payments').insert([{ payment_number, customer, amount, date }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.get('/api/payments/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ payment: data });
});


// Reports
app.get('/api/reports/policies', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('policies').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reports: data || [] });
});
app.get('/api/reports/claims', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('claims').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reports: data || [] });
});
app.get('/api/reports/fraud', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('fraud_alerts').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reports: data || [] });
});


// Compliance & Audit
app.get('/api/audit/logs', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('audit_logs').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ logs: data || [] });
});
app.get('/api/compliance/checklist', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('compliance_checklist').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ checklist: data || [] });
});


// Admin
app.get('/api/admin/users', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('users').select('email, id, role');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data || [] });
});
app.post('/api/admin/users', requireAuth, async (req, res) => {
  const { email, role } = req.body;
  const { error } = await supabase.from('users').insert([{ email, role }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.put('/api/admin/users/:id', requireAuth, async (req, res) => {
  const { email, role } = req.body;
  const { id } = req.params;
  const { error } = await supabase.from('users').update({ email, role }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.get('/api/admin/settings', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ settings: data || {} });
});
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
  // Check if email exists
  const { data: existing } = await supabase.from('users').select('email').eq('email', email);
  if (existing && existing.length > 0) {
    res.status(409).send('Email already exists');
    return;
  }
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
  // Insert into users table
  const { error: dbError } = await supabase.from('users').insert([
    { full_name: name, email, password_hash: 'auth', role: 'hospital_admin' }
  ]);
  if (dbError) {
    res.status(500).send(dbError.message);
    return;
  }
  res.status(200).json({ success: true });
});

// Create insurance provider account
app.post('/api/create-insurance-provider-account', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).send('Missing required fields');
    return;
  }
  const { data: existing } = await supabase.from('users').select('email').eq('email', email);
  if (existing && existing.length > 0) {
    res.status(409).send('Email already exists');
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
  const { error: dbError } = await supabase.from('users').insert([
    { full_name: name, email, password_hash: 'auth', role: 'insurance_provider' }
  ]);
  if (dbError) {
    res.status(500).send(dbError.message);
    return;
  }
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 4000;
// Hospital Dashboard API Endpoints
app.get('/hospital/dashboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // Get hospital_id from token or use default
    const hospitalId = req.query.hospital_id || 'default-hospital';
    
    // Fetch stats from database
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

app.get('/hospital/claims/:hospitalId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { hospitalId } = req.params;
    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .eq('hospital_id', hospitalId);
    
    if (error) throw error;
    res.json({ claims: claims || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/hospital/claims', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { patient_id, treatment, amount, diagnosis, policy_id, hospital_id } = req.body;
    const { data, error } = await supabase
      .from('claims')
      .insert([{
        patient_id,
        treatment_details: treatment,
        amount,
        diagnosis,
        policy_id,
        hospital_id,
        status: 'pending',
        fraud_score: 0
      }])
      .select();
    
    if (error) throw error;
    
    // Return updated claims list
    const { data: claims } = await supabase.from('claims').select('*').eq('hospital_id', hospital_id);
    res.json({ claims: claims || [], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/hospital/patients/:hospitalId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { hospitalId } = req.params;
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('hospital_id', hospitalId);
    
    if (error) throw error;
    res.json({ patients: patients || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/hospital/patients', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { name, dob, gender, contact, insurance_policy_id, emergency_contact, hospital_id } = req.body;
    const { data, error } = await supabase
      .from('patients')
      .insert([{
        full_name: name,
        dob,
        gender,
        phone_number: contact,
        insurance_policy: insurance_policy_id,
        emergency_contact,
        hospital_id
      }])
      .select();
    
    if (error) throw error;
    
    // Return updated patients list
    const { data: patients } = await supabase.from('patients').select('*').eq('hospital_id', hospital_id);
    res.json({ patients: patients || [], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/hospital/patients/:patientId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { patientId } = req.params;
    const { medical_history, allergies, admission_summary, discharge_summary, hospital_id } = req.body;
    const { data, error } = await supabase
      .from('patients')
      .update({
        medical_history,
        allergies,
        admission_summary,
        discharge_summary
      })
      .eq('id', patientId)
      .select();
    
    if (error) throw error;
    
    // Return updated patients list
    const { data: patients } = await supabase.from('patients').select('*').eq('hospital_id', hospital_id);
    res.json({ patients: patients || [], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/hospital/billing/:hospitalId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { hospitalId } = req.params;
    const { data: billing, error } = await supabase
      .from('billing')
      .select('*')
      .eq('hospital_id', hospitalId);
    
    if (error) throw error;
    res.json({ billing: billing || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/hospital/billing', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { patient_id, amount, description, due_date, hospital_id } = req.body;
    const { data, error } = await supabase
      .from('billing')
      .insert([{
        patient_id,
        amount,
        description,
        due_date,
        hospital_id,
        status: 'pending',
        outstanding_balance: amount,
        settlement: 0
      }])
      .select();
    
    if (error) throw error;
    
    // Return updated billing list
    const { data: billing } = await supabase.from('billing').select('*').eq('hospital_id', hospital_id);
    res.json({ billing: billing || [], success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
