import { createClient } from '@supabase/supabase-js';

async function main(){
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;
  const email = process.argv[2];
  const password = process.argv[3] || Math.random().toString(36).slice(2,12);
  const name = process.argv[4] || 'Admin';

  if(!SUPABASE_URL || !SERVICE_ROLE){
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE environment variables.\nSet SUPABASE_URL and SUPABASE_SERVICE_ROLE and re-run.');
    process.exit(1);
  }
  if(!email){
    console.error('Usage: node scripts/create-admin.js <email> [password] [name]');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false }
  });

  try{
    // 1) create auth user (if not exists)
    let existingUsers = null;
    if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.listUsersFromAdmin === 'function') {
      const resp = await supabase.auth.admin.listUsersFromAdmin({ email });
      existingUsers = resp?.data ?? null;
    }

    let user = null;
    try{
      const res = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if(res.data) user = res.data;
      if(res.error && res.error.message && /User already exists/i.test(res.error.message)){
        // ignore
      }
    }catch(err){
      // ignore creation errors and continue to upsert admin row
    }

    // 2) upsert into public.admins
    const payload = {
      email,
      name,
      is_active: true,
      // if we have a user id, use it as id
      id: user?.id ?? undefined
    };

    const { data, error } = await supabase.from('admins').upsert(payload, { onConflict: 'email' }).select().maybeSingle();
    if(error){
      console.error('Failed to upsert admin row:', error);
      process.exit(1);
    }

    console.log('Admin upserted:', data);
    if(!user) console.log('Note: Auth user may already exist or creation was skipped — verify in Supabase Auth users.');
    console.log('\nDone.');
  }catch(e){
    console.error('Unexpected error:', e);
    process.exit(1);
  }
}

main();
