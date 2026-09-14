import https from 'https';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ycrimgysqiyqysfhsooa';

function runQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const insertSql = `
    insert into public.assessments (profile_type, full_name, email, status)
    values ('founder', 'RLS Test User', 'rls-test+${Date.now()}@example.com', 'new')
    returning id, created_at, profile_type, email, status;
  `;

  console.log('Running test insert...');
  const result = await runQuery(insertSql);
  console.log('Status:', result.statusCode);
  console.log(result.body);
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
