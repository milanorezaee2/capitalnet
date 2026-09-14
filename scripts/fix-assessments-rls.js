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
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', (error) => reject(error));
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Inspecting current RLS policies for public.assessments...');

  const inspectSql = `
    select policyname, tablename, cmd, roles, qual, with_check
    from pg_policies
    where schemaname = 'public' and tablename = 'assessments'
    order by policyname;
  `;

  const inspectResult = await runQuery(inspectSql);
  console.log('Inspect result status:', inspectResult.statusCode);
  console.log(inspectResult.body);

  console.log('\nApplying assessment policies...');
  const policySql = `
    ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS assessments_public_insert ON public.assessments;
    CREATE POLICY assessments_public_insert ON public.assessments
      FOR INSERT TO anon, authenticated
      WITH CHECK (true);
    DROP POLICY IF EXISTS assessments_select_own ON public.assessments;
    CREATE POLICY assessments_select_own ON public.assessments
      FOR SELECT TO authenticated
      USING (email = auth.email());
    DROP POLICY IF EXISTS admin_assessments_all ON public.assessments;
    CREATE POLICY admin_assessments_all ON public.assessments
      FOR ALL TO authenticated
      USING (is_admin());
  `;

  const applyResult = await runQuery(policySql);
  console.log('Apply result status:', applyResult.statusCode);
  console.log(applyResult.body);

  console.log('\nRe-inspecting policies to verify changes...');
  const verifyResult = await runQuery(inspectSql);
  console.log('Verify result status:', verifyResult.statusCode);
  console.log(verifyResult.body);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
