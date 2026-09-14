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
  const sql = `
    ALTER TABLE public.assessments
      ALTER COLUMN title DROP NOT NULL,
      ALTER COLUMN content DROP NOT NULL;
  `;

  console.log('Altering assessments schema to make title and content nullable...');
  const result = await runQuery(sql);
  console.log('Status:', result.statusCode);
  console.log(result.body);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
