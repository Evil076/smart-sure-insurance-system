import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

import fs from 'fs';
const schemaPath = './database_schema.sql';
let fullSchemaSQL = '';
try {
  fullSchemaSQL = fs.readFileSync(schemaPath, 'utf8');
} catch (err) {
  console.error('Error reading database_schema.sql:', err.message);
  process.exit(1);
}

async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id')
      .limit(1);
    
    if (!error) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function createUsersTable() {
  console.log('Checking if users table exists...');
  const exists = await checkTableExists();
  
  if (exists) {
    console.log('Users table already exists!');
    return true;
  }
  
  console.log('Users table does not exist.');
  // Try to apply full schema using Supabase RPC (execute_sql)
  try {
    const { error } = await supabase.rpc('execute_sql', { sql: fullSchemaSQL });
    if (error) {
      console.error('Error applying schema via RPC:', error.message);
      console.log('You may need to run the SQL manually in Supabase SQL Editor.');
      return false;
    }
    console.log('Full schema applied from database_schema.sql!');
    return true;
  } catch (e) {
    console.error('Exception applying schema:', e.message);
    return false;
  }
}

async function createAdminUser() {
  console.log('\n=== Creating Admin User ===');
  
  const email = 'Admin@gmail.com';
  const password = 'Admin@gmail.com';
  const fullName = 'System Admin';
  const role = 'admin';

  try {
    // Check if user exists in Auth
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!signInError) {
      console.log('Admin user already exists in Supabase Auth');
      console.log('  Email:', email);
      console.log('  Password:', password);
      return;
    }

    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: fullName, role },
      email_confirm: true
    });

    if (error) {
      console.error('Error creating admin:', error.message);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('  Email:', email);
    console.log('  Password:', password);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

async function insertAdminToUsersTable() {
  const email = 'Admin@gmail.com';
  const fullName = 'System Admin';
  const role = 'admin';

  try {
    const { error } = await supabase.from('users').insert([{
      full_name: fullName,
      email: email,
      password_hash: 'auth',
      role: role,
      phone_number: '+0000000000',
      age: 30,
      dependents: 0,
      monthly_budget: 5000,
      priority: 'cost',
      beneficiaries: []
    }]);

    if (error) {
      if (error.message.includes('duplicate')) {
        console.log('Admin already exists in users table');
      } else {
        console.log('Note: Could not insert admin into users table');
        console.log('Error:', error.message);
      }
    } else {
      console.log('Admin inserted into users table');
    }
  } catch (e) {
    console.log('Note: Could not insert into users table -', e.message);
  }
}

async function migrate() {
  console.log('=== SmartSure Database Migration ===\n');
  
  const tableCreated = await createUsersTable();
  await createAdminUser();
  
  if (tableCreated) {
    await insertAdminToUsersTable();
  }
  
  console.log('\n=== Migration Complete ===');
  console.log('\nYou can now log in with:');
  console.log('  Email: Admin@gmail.com');
  console.log('  Password: Admin@gmail.com');
  console.log('  Role: System (admin)');
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
