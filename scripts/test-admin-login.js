import { createClient } from '@supabase/supabase-js';

async function main(){
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const email = process.argv[2];
  const password = process.argv[3];
  if(!SUPABASE_URL || !ANON){ console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY'); process.exit(1); }
  if(!email || !password){ console.error('Usage: node scripts/test-admin-login.js <email> <password>'); process.exit(1); }

  const supabase = createClient(SUPABASE_URL, ANON);
  const res = await supabase.auth.signInWithPassword({ email, password });
  console.log('RESULT:', JSON.stringify(res, null, 2));
}

main().catch(e=>{ console.error(e); process.exit(1); });
