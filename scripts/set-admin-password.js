import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

async function main(){
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;
  const email = process.argv[2];

  if(!SUPABASE_URL || !SERVICE_ROLE){
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env vars.');
    process.exit(1);
  }
  if(!email){
    console.error('Usage: node scripts/set-admin-password.js <email>');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  try{
    // Try admin list via client SDK
    let uid = null;
    try{
      if(supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.listUsers === 'function'){
        const resp = await supabase.auth.admin.listUsers();
        const users = resp?.data?.users ?? resp?.data ?? [];
        const found = (users || []).find(u => (u.email||'').toLowerCase() === email.toLowerCase());
        if(found) uid = found.id || found.user?.id || found.uid || found.uuid || null;
      }
    }catch(e){/* ignore */}

    // Fallback to REST admin users list
    if(!uid){
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers: { 'Authorization': `Bearer ${SERVICE_ROLE}` } });
      if(res.ok){
        const list = await res.json();
        const found = (list || []).find(u => (u.email||'').toLowerCase() === email.toLowerCase());
        if(found) uid = found.id || found.user?.id || found.uid || null;
      }
    }

    if(!uid){
      console.error('Could not find auth user by email:', email);
      process.exit(1);
    }

    const password = crypto.randomBytes(12).toString('base64');

    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE}`,
        'apikey': SERVICE_ROLE
      },
      body: JSON.stringify({ password })
    });

    const text = await updateRes.text();
    if(!updateRes.ok){
      console.error('Failed to set password:', updateRes.status, text);
      process.exit(1);
    }

    console.log('Password set for', email);
    console.log('PASSWORD:', password);
    console.log('API response:', text);
    process.exit(0);
  }catch(err){
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
