import https from 'https';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcmltZ3lzcWl5cXlzZmhzb29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTkwMDMzOSwiZXhwIjoyMDk3NDc2MzM5fQ.nuD2mabgutrv12O0hzrLd3ZdFQxFqHy6eycR-OOajKQ';
const items = [
  { name:'علی رضایی', role:'بنیان‌گذار و CEO', company:'StartupX', text:'تیم کپیتال نتورک ما را در کمتر از ۶ ماه به سه VC Tier-1 متصل کردند. بدون آنها Series A ما ممکن نبود.', sort_order:1, is_active:true },
  { name:'فاطمه محمدی', role:'بنیان‌گذار و CTO', company:'TechFlow', text:'دیتا روم و Pitch Deck شان بسیار حرفه‌ای بود. VC های مختلف از ما تشویق کردند که بر روی نقاط تاکید آنها تمرکز کنیم.', sort_order:2, is_active:true },
  { name:'رضا کریمی', role:'بنیان‌گذار و CEO', company:'DataHub', text:'سرعت پاسخگویی و کیفیت معرفی‌ها فوق‌العاده بود. در عرض ۴۵ روز به Term Sheet رسیدیم. حرفه‌ای‌ترین تیمی که کار کردیم.', sort_order:3, is_active:true },
  { name:'نیلا احمدی', role:'مدیر محصول', company:'Analytics AI', text:'فرآیند کاملاً شفاف بود. مشاوره‌های آنها ما را در تصمیم‌گیری درباره معماری تکنولوژی کمک کرد.', sort_order:4, is_active:true },
];

function post(path, body) {
  return new Promise(resolve => {
    const b = JSON.stringify(body);
    const opts = {
      hostname: 'ycrimgysqiyqysfhsooa.supabase.co',
      path,
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(b),
        'Prefer': 'resolution=ignore-duplicates',
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(b); req.end();
  });
}

async function main() {
  console.log('🌱 Seeding testimonials...');
  const r = await post('/rest/v1/testimonials', items);
  if (r.status === 201 || r.status === 200) {
    console.log('✅ Seeded', items.length, 'testimonials');
  } else {
    console.log('❌', r.status, r.body.slice(0, 200));
  }

  // seed remaining site_settings
  console.log('\n🌱 Seeding extra site_settings...');
  const settings = [
    { key: 'social_twitter', value: '' },
    { key: 'social_linkedin', value: '' },
    { key: 'social_instagram', value: '' },
    { key: 'social_youtube', value: '' },
    { key: 'team', value: [] },
  ];
  for (const s of settings) {
    const sr = await post('/rest/v1/site_settings', s);
    if (sr.status === 201) console.log('  ✅', s.key);
    else console.log('  ⚠️', s.key, sr.status, sr.body.slice(0,60));
  }
  console.log('\n✅ Done!');
}
main().catch(console.error);
