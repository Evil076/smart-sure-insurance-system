// API route for hospital account creation (Node.js, Express style)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
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
}
