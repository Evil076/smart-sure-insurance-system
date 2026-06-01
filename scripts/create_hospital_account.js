// Node.js script to securely create a hospital account using Supabase service role key
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createHospitalAccount({ name, email, password }) {
  // Check if email already exists
  const { data: existing } = await supabase.from('users').select('email').eq('email', email);
  if (existing && existing.length > 0) {
    console.error('Email already exists.');
    return;
  }

  // Create user in Supabase Auth
  const { data, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: 'hospital_admin' },
    email_confirm: true
  });
  if (authError) {
    console.error('Error creating user in Auth:', authError.message);
    return;
  }

  // Insert into users table
  const { error: dbError } = await supabase.from('users').insert([
    { full_name: name, email, password_hash: 'auth', role: 'hospital_admin' }
  ]);
  if (dbError) {
    console.error('Error inserting into users table:', dbError.message);
    return;
  }

  console.log('Hospital account created successfully!');
}

// Example usage: node scripts/create_hospital_account.js "Hospital Name" "email@domain.com" "password123"
const [,, name, email, password] = process.argv;
if (!name || !email || !password) {
  console.error('Usage: node scripts/create_hospital_account.js "Hospital Name" "email@domain.com" "password123"');
  process.exit(1);
}

createHospitalAccount({ name, email, password });
