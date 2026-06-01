import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'users',
  'insurance_providers',
  'hospitals',
  'accreditations',
  'user_wallets',
  'query_logs',
  'feedback'
];

(async () => {
  console.log('Verifying existence of tables...');
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table missing: ${table}`);
      } else {
        console.log(`✅ Table exists: ${table}`);
      }
    } catch (e) {
      console.log(`❌ Error checking table ${table}: ${e.message}`);
    }
  }
})();
