#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

async function main(){
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;
  const doBackup = process.argv.includes('--backup');

  if(!SUPABASE_URL || !SERVICE_ROLE){
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE environment variables.');
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE and re-run.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  try{
    console.log('Fetching all leads from assessments...');
    const { data: rows, error: fetchErr } = await supabase.from('assessments').select('*');
    if(fetchErr){
      console.error('Failed to fetch leads:', fetchErr);
      process.exit(1);
    }

    const ids = (rows || []).map(r => r.id).filter(Boolean);

    if(ids.length === 0){
      console.log('No leads found — nothing to delete.');
      process.exit(0);
    }

    if(doBackup){
      console.log('Creating CSV backup...');
      const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
      const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => {
        const v = r[k];
        if(v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""');
        return '"' + s + '"';
      }).join(','))).join('\n');

      const outDir = process.env.BACKUP_DIR || '.';
      const filename = path.join(outDir, `leads-backup-${new Date().toISOString().replace(/[:.]/g,'-')}.csv`);
      fs.writeFileSync(filename, csv, 'utf8');
      console.log('Backup written to', filename);
    }

    console.log(`Deleting ${ids.length} leads from assessments...`);
    // Supabase limits batch sizes; delete in chunks of 500
    const chunkSize = 500;
    for(let i=0;i<ids.length;i+=chunkSize){
      const chunk = ids.slice(i,i+chunkSize);
      const { error: delErr } = await supabase.from('assessments').delete().in('id', chunk);
      if(delErr){
        console.error('Delete error on chunk starting at', i, delErr);
        process.exit(1);
      }
    }

    console.log('All leads deleted successfully.');
  }catch(e){
    console.error('Unexpected error:', e);
    process.exit(1);
  }
}

main();
