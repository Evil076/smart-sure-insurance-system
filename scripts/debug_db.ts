
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
    console.log("--- HOSPITALS IN DB ---");
    const { data: hospitals, error: hErr } = await supabase.from('hospitals').select('id, name');
    if (hErr) console.error(hErr);
    else console.table(hospitals);

    console.log("\n--- RECENT APPOINTMENTS ---");
    const { data: appts, error: aErr } = await supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5);
    if (aErr) console.error(aErr);
    else console.table(appts);
}

inspectData();
