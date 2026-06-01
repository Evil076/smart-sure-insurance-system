// Pure JavaScript version to create the admin user in Supabase Auth and users table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureAdminUser() {
  const email = 'Admin@gmail.com';
  const password = 'Admin@gmail.com';
  const full_name = 'System Admin';
  const role = 'admin';

  // Check if user exists in Auth
  let { data: userList, error } = await supabase.auth.admin.listUsers({ email });
  let user;
  if (!userList || !userList.users || userList.users.length === 0) {
    // Create user in Auth
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: full_name, role },
      email_confirm: true
    });
    if (createError) {
      console.error('Error creating admin in Auth:', createError.message);
      return;
    }
    user = created.user;
    console.log('Admin created in Auth.');
  } else {
    user = userList.users[0];
    // Always reset password for existing admin
    const { error: pwError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { name: full_name, role }
    });
    if (pwError) {
      console.error('Error resetting admin password:', pwError.message);
    } else {
      console.log('Admin password reset in Auth.');
    }
    console.log('Admin already exists in Auth.');
  }

  // Check if user exists in users table
  const { data: dbUser } = await supabase.from('users').select('*').eq('email', email);
  if (!dbUser || dbUser.length === 0) {
    await supabase.from('users').insert([
      { full_name, email, password_hash: 'auth', role }
    ]);
    console.log('Admin inserted in users table.');
  } else {
    console.log('Admin already exists in users table.');
  }
}

ensureAdminUser().then(() => process.exit(0));
